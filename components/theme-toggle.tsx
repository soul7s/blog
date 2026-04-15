"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const subscribers = new Set<() => void>();

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function emitThemeChange() {
  subscribers.forEach((subscriber) => subscriber());
}

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

function subscribe(callback: () => void) {
  subscribers.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== "theme") {
      return;
    }

    const nextTheme = event.newValue === "light" ? "light" : "dark";
    applyTheme(nextTheme);
    emitThemeChange();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    subscribers.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "dark");
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-text)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
      suppressHydrationWarning
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        window.localStorage.setItem("theme", nextTheme);
        applyTheme(nextTheme);
        emitThemeChange();
      }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2v1.5M8 12.5V14M13.2 8H14.5M1.5 8h1.3M11.7 4.3l1 1M3.3 11.7l1 1M11.7 11.7l1-1M3.3 4.3l1 1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
          <circle
            cx="8"
            cy="8"
            r="2.75"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10.9 2.5a5.9 5.9 0 1 0 2.6 10.8A6.4 6.4 0 0 1 10.9 2.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
        </svg>
      )}
    </button>
  );
}
