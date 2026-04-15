import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <p className="mb-3 text-sm text-[var(--gold)]">404</p>
        <h1 className="mb-3 text-2xl font-bold text-[var(--text)]">
          글을 찾지 못했습니다
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--muted-text)]">
          경로가 바뀌었거나 해당 마크다운 파일이 삭제되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--gold)]"
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
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
