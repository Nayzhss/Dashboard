"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { getShopScore, getCategoryConfig, SHOP_CATEGORY_LIST, SHOP_CATEGORY_CONFIG } from "../data/shops"
import type { ShopCategory } from "../data/shops"
import { useShops } from "../hooks/useShops"
import { ShopModal } from "../components/shops/ShopModal"
import { ShopSearch } from "../components/shops/ShopSearch"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { BackgroundOrbs } from "../components/BackgroundOrbs"

const RANK_STYLES = [
  "border-[var(--accent-400)]/40 shadow-[0_0_24px_-8px_rgba(167,139,250,0.5)]",
  "border-[var(--accent-400)]/20",
  "border-[var(--accent-400)]/10",
]

function fmtScore(score: number) {
  return score > 0 ? `${Math.round(score)} €/j` : "—"
}

export default function BoutiquesPage() {
  const { shops, loading } = useShops()
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [category, setCategory] = useState<ShopCategory | "all">("all")

  const visibleShops = useMemo(
    () => (category === "all" ? shops : shops.filter((s) => s.category === category)),
    [shops, category]
  )

  const sortedShops = useMemo(
    () => [...visibleShops].sort((a, b) => getShopScore(b) - getShopScore(a)),
    [visibleShops]
  )

  const counts = useMemo(() => {
    const c = new Map<ShopCategory, number>()
    for (const s of shops) c.set(s.category, (c.get(s.category) ?? 0) + 1)
    return c
  }, [shops])

  const top3 = sortedShops.slice(0, 3)

  return (
    <main className="relative overflow-hidden min-h-screen bg-[var(--bg)] text-[var(--color-white)]">
      <BackgroundOrbs />

      <div className="relative z-10">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-fade-up mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Boutiques</h1>
            <p className="text-sm text-[var(--text-4)] mt-1">
              {shops.length} boutique{shops.length !== 1 ? "s" : ""} disponible
              {shops.length !== 1 ? "s" : ""}
            </p>
          </div>

          <ShopSearch shops={shops} onSelect={setSelectedShop} />
        </div>

        {!loading && shops.length > 0 && (
          <div className="animate-fade-up mb-8 flex flex-wrap gap-2" style={{ animationDelay: "40ms" }}>
            <CategoryChip
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              Toutes ({shops.length})
            </CategoryChip>
            {SHOP_CATEGORY_LIST.filter((c) => counts.get(c)).map((c) => (
              <CategoryChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {SHOP_CATEGORY_CONFIG[c].emoji} {SHOP_CATEGORY_CONFIG[c].label} ({counts.get(c)})
              </CategoryChip>
            ))}
          </div>
        )}

        {loading ? (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[172px] bg-[var(--surface)] border border-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[140px] bg-[var(--surface)] border border-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </>
        ) : shops.length === 0 ? (
          <EmptyState emoji="🏬" message="Aucune boutique pour l'instant." />
        ) : sortedShops.length === 0 ? (
          <EmptyState emoji="🔍" message="Aucune boutique dans cette catégorie.">
            <button
              onClick={() => setCategory("all")}
              className="mt-4 px-4 py-2 rounded-xl bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-sm font-medium text-[#fff] transition-colors"
            >
              Voir toutes les boutiques
            </button>
          </EmptyState>
        ) : (
          <>
            {/* TOP 3 RENTABILITÉ */}
            <section className="mb-12">
              <p className="text-xs font-medium text-[var(--text-4)] uppercase tracking-widest mb-4">
                Top 3 rentabilité
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {top3.map((shop, i) => (
                  <div
                    key={shop.slug}
                    onClick={() => setSelectedShop(shop.slug)}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className={`animate-fade-up group relative bg-[var(--surface)] border rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-[var(--accent-400)]/50 hover:-translate-y-1 ${RANK_STYLES[i]}`}
                  >
                    <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--accent-500)]/15 text-[var(--accent-300)] text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>

                    <Image
                      src={`/logo/${shop.slug}.png`}
                      alt={shop.name}
                      width={48}
                      height={48}
                      className="rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                    />

                    <h2 className="font-semibold leading-tight">{shop.name}</h2>
                    <p className="text-xs text-[var(--text-4)] mt-0.5 truncate">
                      {shop.website}
                    </p>

                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--text-3)]">
                      {getCategoryConfig(shop.category).emoji} {getCategoryConfig(shop.category).label}
                    </span>

                    <p className="mt-3 text-lg font-semibold text-[var(--accent-300)]">
                      {fmtScore(getShopScore(shop))}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* TOUTES LES BOUTIQUES */}
            <section>
              <p className="text-xs font-medium text-[var(--text-4)] uppercase tracking-widest mb-4">
                Toutes les boutiques
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedShops.map((shop, i) => (
                  <div
                    key={shop.slug}
                    onClick={() => setSelectedShop(shop.slug)}
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                    className="animate-fade-up bg-[var(--surface)] border border-white/5 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-white/15 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={`/logo/${shop.slug}.png`}
                        alt={shop.name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />

                      <div className="min-w-0">
                        <p className="font-medium truncate">{shop.name}</p>
                        <p className="text-xs text-[var(--text-4)] truncate">
                          {shop.website}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--text-3)]">
                        {getCategoryConfig(shop.category).emoji} {getCategoryConfig(shop.category).label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[var(--accent-300)] font-semibold">
                        {fmtScore(getShopScore(shop))}
                      </span>
                      <span className="text-[var(--text-4)]">
                        {shop.methods.length} méthode
                        {shop.methods.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
      </div>

      {selectedShop && (
        <ShopModal slug={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </main>
  )
}

function EmptyState({
  emoji,
  message,
  children,
}: {
  emoji: string
  message: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-3 opacity-80">{emoji}</div>
      <p className="text-[var(--text-4)] font-medium">{message}</p>
      {children}
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-[var(--accent-500)]/15 border-[var(--accent-500)]/50 text-[var(--accent-300)]"
          : "bg-[var(--surface)] border-white/5 text-[var(--text-3)] hover:border-white/15 hover:text-[var(--color-white)]"
      }`}
    >
      {children}
    </button>
  )
}
