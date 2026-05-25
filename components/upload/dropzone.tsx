"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'

interface DropzoneProps {
  onFiles: (files: { name: string; content: string }[]) => void
}

export default function Dropzone({ onFiles }: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const items = e.dataTransfer?.items
    if (!items) return
    const files: { name: string; content: string }[] = []
    const names: string[] = []
    for (const item of items) {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null
      if (entry?.isDirectory) {
        await traverseDirectory(entry as FileSystemDirectoryEntry, files, names, '')
      } else if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          names.push(file.name)
          const content = await file.text()
          files.push({ name: file.name, content })
        }
      }
    }
    setFileNames(names)
    onFiles(files)
  }

  async function traverseDirectory(
    entry: FileSystemDirectoryEntry,
    files: { name: string; content: string }[],
    names: string[],
    path: string
  ) {
    const reader = entry.createReader()
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries(resolve)
    })
    for (const child of entries) {
      if (child.isDirectory) {
        await traverseDirectory(child as FileSystemDirectoryEntry, files, names, `${path}${child.name}/`)
      } else {
        const file = await new Promise<File>((resolve) => (child as FileSystemFileEntry).file(resolve))
        names.push(`${path}${file.name}`)
        const content = await file.text()
        files.push({ name: `${path}${file.name}`, content })
      }
    }
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList) return
    const files: { name: string; content: string }[] = []
    const names: string[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      names.push(file.name)
      const content = await file.text()
      files.push({ name: file.name, content })
    }
    setFileNames(names)
    onFiles(files)
  }

  function handleClick() {
    inputRef.current?.click()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        dragging
          ? 'border-shield-500 bg-shield-50'
          : 'border-outline bg-surface-secondary/50 hover:border-shield-400 hover:bg-surface-secondary'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".md,.zip,.json,.yaml,.yml,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-on-surface-secondary">
        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
      </div>
      <p className="text-sm font-medium text-on-surface">
        Drop your skill folder or ZIP here
      </p>
      <p className="mt-1 text-xs text-on-surface-secondary">
        or click to browse &middot; SKILL.md, ZIP, or directory
      </p>
      {fileNames.length > 0 && (
        <div className="mt-4 space-y-1">
          {fileNames.slice(0, 5).map((name) => (
            <div key={name} className="text-xs text-on-surface-secondary truncate">{name}</div>
          ))}
          {fileNames.length > 5 && (
            <div className="text-xs text-on-surface-secondary">+{fileNames.length - 5} more files</div>
          )}
        </div>
      )}
    </div>
  )
}
