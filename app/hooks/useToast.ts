"use client"

import { useState, useCallback } from "react"

export type ToastType = "success" | "error" | "info"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  action?: ToastAction
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      options?: { action?: ToastAction; duration?: number }
    ) => {
      const id = Date.now().toString()
      const duration = options?.duration ?? 3500
      setToasts((prev) => [...prev, { id, message, type, duration, action: options?.action }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
