"use client"

import { useState } from 'react'

function getInitialTheme(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return stored === 'dark' || (!stored && prefersDark)
  }
  return false
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialTheme)

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-secondary hover:bg-surface-secondary transition-colors"
    >
      <span className="material-symbols-outlined text-lg">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}
