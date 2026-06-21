"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { getShopScore } from "./data/shops"
import { useShops } from "./hooks/useShops"
import { ShopModal } from "./components/shops/ShopModal"
import { Header } from "./components/Header"

const RANK_STYLES = [
  "border-violet-400/40 shadow-[0_0_24px_-8px_rgba(167,139,250,0.5)]",
  "border-violet-400/20",
  "border-violet-400/10",
]

function fmtScore(score: number) {
  return score > 0 ? `${Math.round(score)} €/j` : "—"
}

export default function Home() {
  const { shops, loading } = useShops()
  const [selectedShop, setSelectedShop] = useState<string | null>(null)

  const sortedShops = useMemo(
    () => [...shops].sort((a, b) => getShopScore(b) - getShopScore(a)),
    [shops]
  )

  const top3 = sortedShops.slice(0, 3)

  return (
    <main className="min-h-screen bg-[#0b0b10] text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Boutiques</h1>
          <p className="text-sm text-[#6b6b80] mt-1">
            {shops.length} boutique{shops.length !== 1 ? "s" : ""} disponible
            {shops.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-[#6b6b80]">Chargement…</p>
        ) : shops.length === 0 ? (
          <p className="text-sm text-[#6b6b80]">Aucune boutique pour l'instant.</p>
        ) : (
          <>
            {/* TOP 3 RENTABILITÉ */}
            <section className="mb-12">
              <p className="text-xs font-medium text-[#6b6b80] uppercase tracking-widest mb-4">
                Top 3 rentabilité
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {top3.map((shop, i) => (
                  <div
                    key={shop.slug}
                    onClick={() => setSelectedShop(shop.slug)}
                    className={`relative bg-[#16161f] border rounded-2xl p-5 cursor-pointer transition-colors hover:border-violet-400/50 ${RANK_STYLES[i]}`}
                  >
                    <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-violet-500/15 text-violet-300 text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>

                    <Image
                      src={`/logo/${shop.slug}.png`}
                      alt={shop.name}
                      width={48}
                      height={48}
                      className="rounded-xl mb-4"
                    />

                    <h2 className="font-semibold leading-tight">{shop.name}</h2>
                    <p className="text-xs text-[#6b6b80] mt-0.5 truncate">
                      {shop.website}
                    </p>

                    <p className="mt-3 text-lg font-semibold text-violet-300">
                      {fmtScore(getShopScore(shop))}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* TOUTES LES BOUTIQUES */}
            <section>
              <p className="text-xs font-medium text-[#6b6b80] uppercase tracking-widest mb-4">
                Toutes les boutiques
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedShops.map((shop) => (
                  <div
                    key={shop.slug}
                    onClick={() => setSelectedShop(shop.slug)}
                    className="bg-[#16161f] border border-white/5 rounded-2xl p-5 cursor-pointer transition-colors hover:border-white/15"
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
                        <p className="text-xs text-[#6b6b80] truncate">
                          {shop.website}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-violet-300 font-semibold">
                        {fmtScore(getShopScore(shop))}
                      </span>
                      <span className="text-[#6b6b80]">
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

      {selectedShop && (
        <ShopModal slug={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </main>
  )
}
