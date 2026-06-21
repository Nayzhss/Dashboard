"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import type { Shop } from "../../data/shops"

interface Props {
  shops: Shop[]
  onSelect: (slug: string) => void
}

function highlight(name: string, query: string) {
  const idx = name.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return name

  return (
    <>
      {name.slice(0, idx)}
      <span className="text-[var(--accent-300)]">{name.slice(idx, idx + query.length)}</span>
      {name.slice(idx + query.length)}
    </>
  )
}

export function ShopSearch({ shops, onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return shops.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6)
  }, [shops, query])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  function select(slug: string) {
    onSelect(slug)
    setQuery("")
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-sm">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-5)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Rechercher une boutique…"
        className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] border border-white/5 rounded-xl text-sm text-[var(--color-white)] placeholder:text-[var(--text-5)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-[var(--surface)] border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          {suggestions.map((shop) => (
            <button
              key={shop.slug}
              onClick={() => select(shop.slug)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
              <Image
                src={`/logo/${shop.slug}.png`}
                alt={shop.name}
                width={28}
                height={28}
                className="rounded-md shrink-0"
              />
              <span className="text-sm text-[var(--color-white)] truncate">
                {highlight(shop.name, query)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
