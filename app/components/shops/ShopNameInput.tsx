"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useShops } from "../../hooks/useShops"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function ShopNameInput({ value, onChange, placeholder, className }: Props) {
  const { shops } = useShops()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    return shops.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6)
  }, [shops, value])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-[var(--dropdown-bg)] border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50 max-h-48 overflow-y-auto">
          {suggestions.map((shop) => (
            <button
              key={shop.slug}
              type="button"
              onClick={() => {
                onChange(shop.name)
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-[var(--color-white)] hover:bg-white/5 transition-colors"
            >
              {shop.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
