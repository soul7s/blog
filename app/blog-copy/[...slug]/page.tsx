import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/blog";

type BlogCopyPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: ["2026-04-18-연말정산-소득공제와-세액공제-쉽게-정리"] }];
}

function toCopyFriendlyText(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---\n?/m, "")
    .replace(/^##\s+/gm, "")
    .replace(/^###\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^-\s+/gm, "• ")
    .trim();
}

export default async function BlogCopyPage({ params }: BlogCopyPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(["blog", ...slug]);

  if (!article || article.categoryKey !== "blog") {
    notFound();
  }

  const copyText = toCopyFriendlyText(article.content);

  return (
    <main className="py-12">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--gold)]"
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
            홈으로
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--gold)]"
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
            변환본 목록으로
          </Link>
        </div>
        <button
          type="button"
          className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--bg)]"
          onClick={() => navigator.clipboard.writeText(copyText)}
        >
          전체 복사
        </button>
      </div>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)]">
            네이버 복사용 보기
          </span>
          <span className="text-xs text-[var(--muted-text)]">붙여넣기용 간격 유지</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">
          {article.title}
        </h1>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <pre className="whitespace-pre-wrap break-words text-[15px] leading-8 text-[var(--text)] [font-family:inherit]">
          {copyText}
        </pre>
      </section>
    </main>
  );
}
