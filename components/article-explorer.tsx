"use client";

import Link from "next/link";
import { useState } from "react";
import type { ArticlePreview, FilterOption } from "@/lib/blog";

type ArticleExplorerProps = {
  articles: ArticlePreview[];
  filters: FilterOption[];
};

export function ArticleExplorer({ articles, filters }: ArticleExplorerProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const visibleArticles =
    activeFilter === "all"
      ? articles
      : articles.filter((article) =>
          article.filterTokens.includes(activeFilter),
        );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.value === activeFilter;

          return (
            <button
              key={filter.value}
              type="button"
              className={[
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--bg)]"
                  : "border-[var(--muted-bg)] text-[var(--muted-text)] hover:border-[var(--gold)] hover:text-[var(--gold)]",
              ].join(" ")}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {visibleArticles.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-text)]">
            선택한 카테고리에 해당하는 글이 아직 없습니다.
          </div>
        ) : null}

        {visibleArticles.map((article) => (
          <Link key={article.id} className="group block" href={article.urlPath}>
            <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)]">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ep-num-bg)]">
                  <span className="text-sm font-bold text-[var(--gold)]">
                    {article.orderLabel}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="mb-1 text-base font-semibold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--gold)]">
                    {article.title}
                  </h2>
                  <p className="line-clamp-2 mb-3 text-sm leading-relaxed text-[var(--muted-text)]">
                    {article.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[var(--muted-text)]">
                      {article.date}
                    </span>
                    <span className="text-xs text-[var(--muted-bg)]">·</span>
                    <span className="rounded-md bg-[var(--ep-num-bg)] px-2 py-0.5 text-xs text-[var(--muted-text)]">
                      {article.categoryLabel}
                    </span>
                    {article.sectionLabel ? (
                      <span className="rounded-md bg-[var(--ep-num-bg)] px-2 py-0.5 text-xs text-[var(--muted-text)]">
                        {article.sectionLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-1 shrink-0 text-[var(--muted-bg)] transition-colors group-hover:text-[var(--gold)]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3L11 8L6 13"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
