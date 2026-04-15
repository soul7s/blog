import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { blogCategories, blogCategoryMap, type CategoryKey } from "@/lib/site-config";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLE_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

type Frontmatter = {
  date?: string;
  draft?: boolean;
  summary?: string;
  description?: string;
  tags?: string[] | string;
  title?: string;
};

export type Article = {
  categoryKey: CategoryKey;
  categoryLabel: string;
  content: string;
  date: string;
  filePath: string;
  id: string;
  locationLabel: string;
  orderLabel: string;
  routeSegments: string[];
  sectionLabel: string | null;
  slug: string;
  summary: string;
  tags: string[];
  title: string;
  urlPath: string;
};

export type ArticlePreview = Pick<
  Article,
  | "categoryKey"
  | "categoryLabel"
  | "date"
  | "id"
  | "locationLabel"
  | "orderLabel"
  | "sectionLabel"
  | "summary"
  | "tags"
  | "title"
  | "urlPath"
> & {
  filterTokens: string[];
};

export type FilterOption = {
  label: string;
  value: string;
};

let articleCache: Article[] | null = null;

function ensureContentDirectory() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`content 폴더를 찾을 수 없습니다: ${CONTENT_DIR}`);
  }
}

function collectMarkdownFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectMarkdownFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function normaliseTags(tags: Frontmatter["tags"]): string[] {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function prettifySegment(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(markdown: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= 150) {
    return plainText;
  }

  return `${plainText.slice(0, 147).trimEnd()}...`;
}

function resolveCategory(categoryKey: string) {
  return blogCategoryMap.get(categoryKey as CategoryKey) ?? null;
}

function readArticle(filePath: string): Article | null {
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const directoryPath = path.dirname(relativePath);

  if (directoryPath === ".") {
    throw new Error(
      `글은 반드시 content 하위의 카테고리 폴더 안에 있어야 합니다: ${relativePath}`,
    );
  }

  const directorySegments = directoryPath.split(path.sep).filter(Boolean);
  const categoryKey = directorySegments[0];
  const category = resolveCategory(categoryKey);

  if (!category) {
    throw new Error(
      `허용되지 않은 카테고리입니다: ${relativePath}. 사용 가능한 카테고리: ${blogCategories
        .map((item) => item.key)
        .join(", ")}`,
    );
  }

  const fileName = path.basename(filePath);
  const match = ARTICLE_FILENAME_PATTERN.exec(fileName);
  const date = match?.[1];
  const rawSlug = match?.[2];

  if (!date || !rawSlug) {
    throw new Error(
      `잘못된 글 파일명입니다: ${relativePath}. "YYYY-MM-DD-제목.md" 형식을 사용하세요.`,
    );
  }

  const rawFile = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(rawFile);
  const frontmatter = data as Frontmatter;

  if (frontmatter.draft) {
    return null;
  }

  if (frontmatter.date && frontmatter.date !== date) {
    throw new Error(
      `frontmatter date와 파일명 날짜가 다릅니다: ${relativePath}`,
    );
  }

  const sectionSegments = directorySegments.slice(1);
  const sectionLabel = sectionSegments.length
    ? sectionSegments.map(prettifySegment).join(" / ")
    : null;
  const locationLabel = sectionLabel
    ? `${category.label} / ${sectionLabel}`
    : category.label;
  const slug = path.basename(filePath, ".md");
  const title = frontmatter.title?.trim() || prettifySegment(rawSlug);
  const summary =
    frontmatter.summary?.trim() ||
    frontmatter.description?.trim() ||
    extractExcerpt(content);
  const tags = normaliseTags(frontmatter.tags);
  const routeSegments = [...directorySegments, slug];

  return {
    categoryKey: category.key,
    categoryLabel: category.label,
    content,
    date,
    filePath,
    id: routeSegments.join("/"),
    locationLabel,
    orderLabel: "",
    routeSegments,
    sectionLabel,
    slug,
    summary,
    tags,
    title,
    urlPath: `/articles/${routeSegments
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`,
  };
}

function compareArticles(left: Article, right: Article) {
  if (left.date === right.date) {
    return right.id.localeCompare(left.id, "ko-KR");
  }

  return right.date.localeCompare(left.date);
}

function loadArticles() {
  if (articleCache) {
    return articleCache;
  }

  ensureContentDirectory();

  const articles = collectMarkdownFiles(CONTENT_DIR)
    .map(readArticle)
    .filter((article): article is Article => article !== null)
    .sort(compareArticles)
    .map((article, index) => ({
      ...article,
      orderLabel: String(index + 1).padStart(2, "0"),
    }));

  articleCache = articles;
  return articles;
}

export function getAllArticles() {
  return loadArticles();
}

export function getArticleBySlug(slugSegments: string[]) {
  const normalisedSegments = slugSegments.map((segment) =>
    decodeURIComponent(segment),
  );

  return loadArticles().find(
    (article) =>
      article.routeSegments.length === normalisedSegments.length &&
      article.routeSegments.every(
        (segment, index) => segment === normalisedSegments[index],
      ),
  );
}

export function getAdjacentArticles(articleId: string) {
  const articles = loadArticles();
  const currentIndex = articles.findIndex((article) => article.id === articleId);

  if (currentIndex === -1) {
    return {
      newer: null,
      older: null,
    };
  }

  return {
    newer: articles[currentIndex - 1] ?? null,
    older: articles[currentIndex + 1] ?? null,
  };
}

export function getFilterOptions(): FilterOption[] {
  const categoryOptions = blogCategories.map((category) => ({
    label: category.label,
    value: `category:${category.key}`,
  }));

  return [{ label: "전체", value: "all" }, ...categoryOptions];
}

export function toArticlePreview(article: Article): ArticlePreview {
  return {
    categoryKey: article.categoryKey,
    categoryLabel: article.categoryLabel,
    date: article.date,
    filterTokens: [`category:${article.categoryKey}`],
    id: article.id,
    locationLabel: article.locationLabel,
    orderLabel: article.orderLabel,
    sectionLabel: article.sectionLabel,
    summary: article.summary,
    tags: article.tags,
    title: article.title,
    urlPath: article.urlPath,
  };
}

export async function renderMarkdown(markdown: string) {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);

  return String(processed);
}
