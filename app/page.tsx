"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Dropzone from '@/components/upload/dropzone'
import UrlInput from '@/components/upload/url-input'
import { saveValidation } from '@/lib/state'
import type { SkillInput } from '@/lib/validator/types'

type Tab = 'upload' | 'url' | 'paste'

export default function HomePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('upload')
  const [loading, setLoading] = useState(false)
  const [pasteContent, setPasteContent] = useState('')

  async function validate(input: SkillInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Validation failed')
      const result = await res.json()
      saveValidation(result)
      router.push(`/validate/${result.id}`)
    } catch (err) {
      alert('Validation failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDropFiles = useCallback(async (files: { name: string; content: string }[]) => {
    const skillFiles = files.map(f => ({ path: f.name, content: f.content }))
    const skillInput: SkillInput = { files: skillFiles }
    await validate(skillInput)
  }, [])

  const handleUrlParse = useCallback(async (data: { owner: string; repo: string; path: string; url: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: data.owner, repo: data.repo, path: data.path }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch repository')
      }
      const result = await res.json()
      await validate({ files: result.files, source: { type: 'github', url: data.url } })
    } catch (err) {
      alert('Failed to fetch from GitHub: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePasteValidate = useCallback(async () => {
    if (!pasteContent.trim()) return
    await validate({ files: [{ path: 'SKILL.md', content: pasteContent }], source: { type: 'paste' } })
  }, [pasteContent])

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-shield-100 text-shield-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          SkillShield &mdash; Validate Agent Skills Before You Run Them
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
          Pre-flight validation, security scanning, and professional reports for the open Agent Skills ecosystem.
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

      <section id="upload" className="mt-12 scroll-mt-20">
        <div className="rounded-xl border border-zinc-200">
          <div className="flex border-b border-zinc-200">
            {([['upload', 'Upload Files'], ['url', 'GitHub URL'], ['paste', 'Paste SKILL.md']] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'border-b-2 border-shield-500 text-shield-700 bg-shield-50'
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'upload' && <Dropzone onFiles={handleDropFiles} />}

            {tab === 'url' && <UrlInput onParse={handleUrlParse} />}

            {tab === 'paste' && (
              <div className="space-y-4">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`---\nname: my-skill\ndescription: What your skill does and when to use it.\n---\n\n# Your Skill Instructions\n\nStart typing your SKILL.md content here...`}
                  rows={16}
                  className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-sm font-mono text-zinc-700 placeholder-zinc-400 focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePasteValidate}
                    disabled={!pasteContent.trim() || loading}
                    className="rounded-lg bg-shield-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-shield-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Validating...' : 'Validate'}
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-shield-200 border-t-shield-600" />
                Running validation...
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="rounded-xl border border-zinc-200 p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shield-100 text-shield-600 font-bold text-lg">1</div>
              <h3 className="mt-4 font-semibold text-zinc-900">Upload</h3>
              <p className="mt-1 text-sm text-zinc-500">Drag & drop your SKILL.md, paste a GitHub URL, or type it in</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shield-100 text-shield-600 font-bold text-lg">2</div>
              <h3 className="mt-4 font-semibold text-zinc-900">Scan</h3>
              <p className="mt-1 text-sm text-zinc-500">Security analysis, compatibility check, and quality report</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shield-100 text-shield-600 font-bold text-lg">3</div>
              <h3 className="mt-4 font-semibold text-zinc-900">Report</h3>
              <p className="mt-1 text-sm text-zinc-500">View score, findings, and export in PDF, JSON, or HTML</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
