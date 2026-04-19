"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--bg)]"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      전체 복사
    </button>
  );
}
