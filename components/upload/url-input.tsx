"use client"

import { useState } from 'react'

interface UrlInputProps {
  onParse: (data: { owner: string; repo: string; path: string; url: string }) => void
}

export default function UrlInput({ onParse }: UrlInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  function parseUrl(input: string) {
    setError('')
    const trimmed = input.trim()

    const patterns = [
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/,
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/,
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)$/,
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/(.+)$/,
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/,
    ]

    for (const pattern of patterns) {
      const match = trimmed.match(pattern)
      if (match) {
        const owner = match[1]
        const repo = match[2]
        const path = match.slice(3).join('/') || ''
        onParse({ owner, repo, path, url: trimmed })
        return
      }
    }

    setError('Invalid GitHub URL. Expected format: https://github.com/owner/repo')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      parseUrl(url)
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://github.com/owner/repo/tree/main/path"
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
        />
        <button
          onClick={() => parseUrl(url)}
          disabled={!url.trim()}
          className="rounded-lg bg-shield-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-shield-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Parse
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
