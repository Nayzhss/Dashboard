"use client"
import { useState } from "react"
import Image from "next/image"
import { useShops } from "../../hooks/useShops"
import type { Shop } from "../../data/shops"

interface Props {
  slug: string
  onClose: () => void
}

const inputCls =
  "w-full px-2.5 py-1.5 bg-[var(--input-bg)] border border-white/5 rounded-lg text-xs text-[var(--color-white)] placeholder:text-[var(--text-6)] focus:outline-none focus:border-[var(--accent-500)]/50"

function emptyForm(shop: Shop) {
  return {
    website: shop.website,
    contactUrl: shop.contactUrl ?? "",
    phone: shop.phone ?? "",
    mail: shop.mail ?? "",
    accountFresh: shop.accountFresh,
    notes: shop.notes ?? "",
    shippingDelivery: shop.shipping.delivery.join(", "),
    shippingReturn: shop.shipping.return.join(", "),
  }
}

export function ShopModal({ slug, onClose }: Props) {
  const { getShop, loading, refresh } = useShops()
  const shop = getShop(slug.toLowerCase())
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => (shop ? emptyForm(shop) : null))

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

  function startEdit() {
    setForm(emptyForm(shop!))
    setEditing(true)
  }

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      await fetch(`/api/shops/${shop!.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shippingDelivery: form.shippingDelivery
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          shippingReturn: form.shippingReturn
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      await refresh()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const totalVouches = shop.methods.reduce((a, m) => a + m.vouches, 0)
  const totalFails = shop.methods.reduce((a, m) => a + m.fails, 0)
  const maxAmount = shop.methods.length
    ? Math.max(...shop.methods.map(m => m.maxAmount))
    : 0

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[var(--surface)] border border-white/10 rounded-2xl w-[420px] p-5 relative max-h-[85vh] overflow-y-auto">

        {/* close + edit */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {!editing && (
            <button
              onClick={startEdit}
              className="text-[var(--text-4)] hover:text-[var(--color-white)]"
              aria-label="Modifier"
            >
              ✎
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[var(--text-4)] hover:text-[var(--color-white)]"
          >
            ✕
          </button>
        </div>

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

        {editing && form ? (
          <div className="space-y-2.5">
            <label className="block">
              <span className="text-xs text-[var(--text-4)]">Website</span>
              <input
                className={inputCls}
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-xs text-[var(--text-4)]">Formulaire de contact</span>
              <input
                className={inputCls}
                value={form.contactUrl}
                onChange={(e) => setForm({ ...form, contactUrl: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-xs text-[var(--text-4)]">Téléphone</span>
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs text-[var(--text-4)]">Email</span>
                <input
                  className={inputCls}
                  value={form.mail}
                  onChange={(e) => setForm({ ...form, mail: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-xs text-[var(--text-4)]">Livraison (séparé par ,)</span>
                <input
                  className={inputCls}
                  placeholder="DHL, UPS…"
                  value={form.shippingDelivery}
                  onChange={(e) => setForm({ ...form, shippingDelivery: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs text-[var(--text-4)]">Retour (séparé par ,)</span>
                <input
                  className={inputCls}
                  placeholder="DHL, UPS…"
                  value={form.shippingReturn}
                  onChange={(e) => setForm({ ...form, shippingReturn: e.target.value })}
                />
              </label>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.accountFresh}
                onChange={(e) => setForm({ ...form, accountFresh: e.target.checked })}
              />
              <span className="text-xs text-[var(--text-4)]">Account fresh</span>
            </label>

            <label className="block">
              <span className="text-xs text-[var(--text-4)]">Notes</span>
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-xs text-[var(--text-3)] hover:text-[var(--color-white)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--accent-600)] hover:bg-[var(--accent-500)] disabled:opacity-40 text-xs font-medium text-[#fff] transition-colors"
              >
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-[var(--text-1)]">

            <p>
              🌐{" "}
              <a className="text-[var(--accent-300)] hover:underline" href={shop.website} target="_blank">
                Website
              </a>
            </p>

            <p>
              📩{" "}
              {shop.contactUrl ? (
                <a className="text-[var(--accent-300)] hover:underline" href={shop.contactUrl} target="_blank">
                  Contact
                </a>
              ) : "—"}
            </p>

            <p>📞 {shop.phone || "—"}</p>

            <p>📧 {shop.mail || "—"}</p>

            <p>🔥 Account fresh : {shop.accountFresh ? "Yes" : "No"}</p>

            <p>👍 Total vouches : {totalVouches}</p>
            <p>❌ Total fails : {totalFails}</p>

            <p>💰 Max amount : {maxAmount}€</p>

            <p>
              🚚 Delivery : {shop.shipping.delivery.length ? shop.shipping.delivery.join(", ") : "—"}
            </p>

            <p>
              📦 Returns : {shop.shipping.return.length ? shop.shipping.return.join(", ") : "—"}
            </p>

            {shop.notes && <p>📝 {shop.notes}</p>}

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
        )}
      </div>
    </div>
  )
}
