import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.title}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.title,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "ko_KR",
    siteName: siteConfig.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("theme");
                  if (theme === "light") {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.classList.add("light");
                    document.documentElement.style.colorScheme = "light";
                  } else {
                    document.documentElement.classList.remove("light");
                    document.documentElement.classList.add("dark");
                    document.documentElement.style.colorScheme = "dark";
                  }
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased transition-colors duration-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex justify-end pt-4">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
