import Link from "next/link";
import { getAllArticlesIncludingHidden, toArticlePreview } from "@/lib/blog";

export default function HiddenBlogPage() {
  const articles = getAllArticlesIncludingHidden()
    .filter((article) => article.categoryKey === "blog")
    .map(toArticlePreview);

  return (
    <main className="py-12">
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-1 text-xs font-medium text-[var(--gold)]">
            숨김 변환본
          </span>
          <span className="text-xs text-[var(--muted-text)]">{articles.length}개</span>
        </div>
        <h1 className="mb-3 text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">
          네이버 블로그 변환본 보관함
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-text)]">
          메인 목록에는 노출하지 않고, 필요할 때만 버튼으로 들어오는 네이버 변환용 글 보관함입니다.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-4 py-2 text-sm font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--bg)]"
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
            홈으로 가기
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-text)]">
            아직 저장된 변환본이 없습니다.
          </div>
        ) : null}

        {articles.map((article) => (
          <article
            key={article.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)]"
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  className="group block"
                  href={`/blog-copy/${encodeURIComponent(article.slug)}`}
                >
                  <h2 className="mb-1 text-base font-semibold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--gold)]">
                    {article.title}
                  </h2>
                </Link>
                <p className="line-clamp-2 mb-3 text-sm leading-relaxed text-[var(--muted-text)]">
                  {article.summary}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[var(--muted-text)]">{article.displayDate}</span>
                  <span className="text-xs text-[var(--muted-bg)]">·</span>
                  <span className="rounded-md bg-[var(--ep-num-bg)] px-2 py-0.5 text-xs text-[var(--muted-text)]">
                    네이버용
                  </span>
                  <Link
                    href={`/blog-copy/${encodeURIComponent(article.slug)}`}
                    className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-xs text-[var(--gold)]"
                  >
                    복사용 페이지
                  </Link>
                  <Link
                    href={article.urlPath}
                    className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--muted-text)]"
                  >
                    원문 보기
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
