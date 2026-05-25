import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillShield — Validate Agent Skills Before You Run Them",
  description:
    "Pre-flight validation, security scanning, and professional reports for the open Agent Skills ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-white text-zinc-900">
        <header className="border-b border-zinc-200">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-shield-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z"
                  clipRule="evenodd"
                />
              </svg>
              SkillShield
            </Link>
            <nav className="ml-auto flex items-center gap-4 text-sm font-medium text-zinc-600">
              <Link href="/" className="hover:text-zinc-900 transition-colors">
                Home
              </Link>
              <Link href="/history" className="hover:text-zinc-900 transition-colors">
                History
              </Link>
              <Link href="/compare" className="hover:text-zinc-900 transition-colors">
                Compare
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
          SkillShield &mdash; Agent Skills Validator
        </footer>
      </body>
    </html>
  );
}
