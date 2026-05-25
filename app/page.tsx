import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-shield-100 text-shield-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-10"
          >
            <path
              fillRule="evenodd"
              d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          SkillShield &mdash; Validate Agent Skills Before You Run Them
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
          Pre-flight validation, security scanning, and professional reports for
          the open Agent Skills ecosystem.
        </p>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-center">
          <div className="text-3xl font-bold text-shield-600">130K+</div>
          <div className="mt-1 text-sm text-zinc-500">skills analyzed</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-center">
          <div className="text-3xl font-bold text-shield-600">12</div>
          <div className="mt-1 text-sm text-zinc-500">threat categories</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-center">
          <div className="text-3xl font-bold text-shield-600">22+</div>
          <div className="mt-1 text-sm text-zinc-500">agents supported</div>
        </div>
      </section>

      <section className="mt-12">
        <div className="rounded-xl border border-zinc-200 p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shield-100 text-shield-600 font-bold text-lg">
                1
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900">Upload</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Drag & drop your SKILL.md, paste a GitHub URL, or upload a ZIP
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shield-100 text-shield-600 font-bold text-lg">
                2
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900">Scan</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Security analysis, compatibility check, and quality report
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shield-100 text-shield-600 font-bold text-lg">
                3
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900">Report</h3>
              <p className="mt-1 text-sm text-zinc-500">
                View score, findings, and export in PDF, JSON, or HTML
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 text-center">
        <Link
          href="/#upload"
          className="inline-flex items-center gap-2 rounded-lg bg-shield-600 px-6 py-3 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636V13.25z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Validate a Skill
        </Link>
      </section>
    </div>
  );
}
