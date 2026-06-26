"use client"

import { useMemo } from "react"
import Image from "next/image"
import { useShops } from "../hooks/useShops"

function shuffle<T>(arr: T[]) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function ShopLogoMarquee() {
  const { shops } = useShops()

  const sample = useMemo(() => shuffle(shops).slice(0, 20), [shops])

  if (sample.length === 0) return <div className="h-16" />

  const row = [...sample, ...sample]

  return (
    <div className="relative w-full overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-marquee flex items-center gap-8 w-max">
        {row.map((shop, i) => (
          <div
            key={`${shop.slug}-${i}`}
            title={shop.name}
            className="shrink-0 w-12 h-12 rounded-xl bg-[var(--surface)] border border-white/5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
          >
            <Image
              src={`/logo/${shop.slug}.png`}
              alt={shop.name}
              width={32}
              height={32}
              className="rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
