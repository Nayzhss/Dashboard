"use client"
import Image from "next/image"
import { useShops } from "../../hooks/useShops"

interface Props {
  slug: string
  onClose: () => void
}

export function ShopModal({ slug, onClose }: Props) {
  const { getShop, loading } = useShops()
  const shop = getShop(slug.toLowerCase())

  if (!loading && !shop) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-[var(--surface)] border border-white/10 rounded-2xl w-[420px] p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[var(--text-4)] hover:text-[var(--color-white)]"
          >
            ✕
          </button>
          <p className="text-[var(--color-white)] font-semibold mb-1">{slug}</p>
          <p className="text-sm text-[var(--text-4)]">
            Aucune donnée pour cette boutique pour l'instant.
          </p>
        </div>
      </div>
    )
  }

  if (!shop) return null

  const totalVouches = shop.methods.reduce((a, m) => a + m.vouches, 0)
  const totalFails = shop.methods.reduce((a, m) => a + m.fails, 0)
  const maxAmount = shop.methods.length
    ? Math.max(...shop.methods.map(m => m.maxAmount))
    : 0

  return (
    
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[var(--surface)] border border-white/10 rounded-2xl w-[420px] p-5 relative">

        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-4)] hover:text-[var(--color-white)]"
        >
          ✕
        </button>

        {/* header */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={`/logo/${shop.slug}.png`}
            alt={shop.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <p className="text-[var(--color-white)] font-semibold">{shop.name}</p>
            <p className="text-xs text-[var(--text-4)]">{shop.slug}</p>
          </div>
        </div>

        {/* infos */}
        <div className="space-y-2 text-sm text-[var(--text-1)]">

          <p>
            🌐{" "}
            <a className="text-[var(--accent-300)] hover:underline" href={shop.website} target="_blank">
              Website
            </a>
          </p>

          <p>
            📩{" "}
            <a className="text-[var(--accent-300)] hover:underline" href={shop.contactUrl} target="_blank">
              Contact
            </a>
          </p>

          <p>📞 {shop.phone || "—"}</p>

          <p>📧 {shop.mail || "—"}</p>

          <p>🔥 Account fresh : {shop.accountFresh ? "Yes" : "No"}</p>

          <p>👍 Total vouches : {totalVouches}</p>
          <p>❌ Total fails : {totalFails}</p>

          <p>💰 Max amount : {maxAmount}€</p>

          <p>
            🚚 Delivery : {shop.shipping.delivery.join(", ")}
          </p>

          <p>
            📦 Returns : {shop.shipping.return.join(", ")}
          </p>

          <div className="pt-2 border-t border-white/10 mt-2">
            <p className="text-xs text-[var(--text-4)] mb-1">Methods</p>

            {shop.methods.map((m) => (
              <div key={m.name} className="text-xs text-[var(--text-1)] mb-2">
                <div className="font-semibold">{m.name}</div>
                <div>👍 {m.vouches} / ❌ {m.fails}</div>
                <div>⏱ {m.avgDelay === 9999 ? "N/A" : m.avgDelay + "j"}</div>
                <div>💰 {m.maxAmount}€</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}