import { ArticleExplorer } from "@/components/article-explorer";
import { getAllArticles, getFilterOptions, toArticlePreview } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  const articles = getAllArticles();
  const previews = articles.map(toArticlePreview);
  const filters = getFilterOptions();

  return (
    <main className="py-12">
      <header className="mb-14">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-1 text-xs font-medium text-[var(--gold)]">
            {siteConfig.statusLabel}
          </span>
          <span className="text-xs text-[var(--muted-text)]">
            {articles.length}
            {siteConfig.countSuffix}
          </span>
        </div>
        <h1 className="mb-3 text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">
          {siteConfig.title}
        </h1>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-[var(--muted-text)]">
          {siteConfig.description}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ep-num-bg)] text-xs">
            {siteConfig.authorIcon}
          </div>
          <span className="text-xs text-[var(--muted-text)]">
            {siteConfig.author}
          </span>
        </div>
      </header>

      <div className="mb-8 border-t border-[var(--border)]" />

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          {siteConfig.feedTitle}
        </h2>
      </div>

      <ArticleExplorer articles={previews} filters={filters} />
    </main>
  );
}
