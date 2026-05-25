"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 4000)
    },
    [remove]
  )

  const colorMap: Record<ToastType, string> = {
    success: "border-l-shield-500 bg-shield-50 text-shield-800",
    error: "border-l-error bg-error-container text-error",
    info: "border-l-threat-info bg-tertiary-container text-tertiary",
  }

  const iconMap: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div role="alert" aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border border-outline border-l-4 px-4 py-3 shadow-lg transition-all duration-300 ${colorMap[t.type]}`}
            style={{
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <span className="material-symbols-outlined text-lg">{iconMap[t.type]}</span>
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
