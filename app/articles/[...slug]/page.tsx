import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdjacentArticles,
  getAllArticles,
  getAllArticlesIncludingHidden,
  getArticleBySlug,
  renderMarkdown,
} from "@/lib/blog";

type ArticlePageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

function ArticleNavigationCard({
  article,
  direction,
}: {
  article: ReturnType<typeof getAllArticles>[number] | null;
  direction: "newer" | "older";
}) {
  if (!article) {
    return <div />;
  }

  const isNewer = direction === "newer";

  return (
    <Link
      href={article.urlPath}
      className="group flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]"
    >
      <span className="flex items-center gap-1 text-xs text-[var(--muted-text)]">
        {isNewer ? (
          <>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            다음 글
          </>
        ) : (
          <>
            이전 글
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </>
        )}
      </span>
      <span className="text-xs text-[var(--gold)]">{article.categoryLabel}</span>
      <span className="line-clamp-2 text-sm font-medium leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--gold)]">
        {article.title}
      </span>
    </Link>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticlesIncludingHidden().map((article) => ({
    slug: article.routeSegments,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const html = await renderMarkdown(article.content);
  const isHiddenBlog = article.categoryKey === "blog";
  const { newer, older } = isHiddenBlog
    ? { newer: null, older: null }
    : getAdjacentArticles(article.id);

  return (
    <main className="py-12">
      <Link
        href={isHiddenBlog ? "/blog" : "/"}
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--gold)]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        {isHiddenBlog ? "변환본 목록으로" : "목록으로"}
      </Link>

      <header className="mb-10">
        {!isHiddenBlog ? (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--gold)]">
              POST {article.orderLabel}
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)]">
              네이버 블로그 변환본
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 text-xs text-[var(--gold)]">
            {article.categoryLabel}
          </span>
          {article.sectionLabel ? (
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted-text)]">
              {article.sectionLabel}
            </span>
          ) : null}
          <span className="text-xs text-[var(--muted-text)]">
            {article.displayDate}
          </span>
        </div>
        <h1 className="mb-4 text-xl font-bold leading-tight text-[var(--text)] sm:text-2xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <span
              key={`${article.id}-${tag}`}
              className="rounded-md border border-[var(--border)] bg-[var(--ep-num-bg)] px-2.5 py-1 text-xs text-[var(--muted-text)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="mb-10 border-t border-[var(--border)]" />

      <article
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {!isHiddenBlog ? (
        <div className="mt-14 border-t border-[var(--border)] pt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ArticleNavigationCard article={older} direction="older" />
            <ArticleNavigationCard article={newer} direction="newer" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
