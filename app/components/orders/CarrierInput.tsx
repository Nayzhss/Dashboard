"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { CARRIERS } from "../../data/carriers"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CarrierInput({ value, onChange, placeholder, className }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return CARRIERS
    return CARRIERS.filter((c) => c.name.toLowerCase().includes(q))
  }, [value])

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
          {suggestions.map((carrier) => (
            <button
              key={carrier.slug}
              type="button"
              onClick={() => {
                onChange(carrier.name)
                setOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-[var(--color-white)] hover:bg-white/5 transition-colors"
            >
              <Image
                src={`/carriers/${carrier.slug}.png`}
                alt={carrier.name}
                width={20}
                height={20}
                className="rounded shrink-0"
              />
              {carrier.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
