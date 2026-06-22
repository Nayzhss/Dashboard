"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { StatusBadge } from "./StatusBadge"
import { STATUS_LIST } from "./types"
import { useShops } from "../../hooks/useShops"
import { getCarrier } from "../../data/carriers"
import type { Order, Status } from "./types"
import { ShopModal } from "../shops/ShopModal"
import { ReturnModal } from "./ReturnModal"

interface Props {
  orders: Order[]
  loading: boolean
  onEdit: (order: Order) => void
  onDelete: (order: Order) => void
  onDuplicate: (order: Order) => void
  onStatusChange: (id: string, status: Status) => Promise<void>
  onMarkReturn: (id: string, carrier: string, trackingNumber: string) => Promise<void>
}

/* ───────── utils ───────── */

function fmt(amount: number | string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(amount))
}

function fmtDate(d: string) {
  if (!d) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d))
}

/**
 * Délai = jours depuis paymentDate, figé sur frozenDelay une fois remboursée/fail
 */
function getDelay(
  paymentDate: string,
  status: Status,
  frozenDelay?: number,
  deliveredAt?: string
) {
  if (!paymentDate) return 0

  const start = new Date(paymentDate).getTime()

  if (deliveredAt) {
    return Math.max(0, Math.floor((new Date(deliveredAt).getTime() - start) / 86400000))
  }

  if (status === "Remboursée" || status === "Fail") {
    return frozenDelay ?? 0
  }

  const end = new Date().getTime()

  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)))
}

/**
 * Délai retour = jours depuis returnShippedAt, figé sur returnFrozenDelay une fois remboursée/fail
 */
function getReturnDelay(
  returnShippedAt: string | undefined,
  status: Status,
  returnFrozenDelay?: number
) {
  if (!returnShippedAt) return null

  const start = new Date(returnShippedAt).getTime()

  if (status === "Remboursée" || status === "Fail") {
    return returnFrozenDelay ?? 0
  }

  return Math.max(0, Math.floor((Date.now() - start) / 86400000))
}

/**
 * couleur du délai type SaaS
 */
function getDelayColor(days: number) {
  if (days <= 2) return "text-emerald-400"
  if (days <= 5) return "text-amber-400"
  return "text-red-400"
}

/* ───────── component ───────── */

export function OrdersTable({
  orders,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onMarkReturn,
}: Props) {
  const { getShop } = useShops()
  const [statusMenu, setStatusMenu] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [returnModalOrderId, setReturnModalOrderId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      const target = e.target as Node
      const insideTable = menuRef.current?.contains(target)
      const insideDropdown = dropdownRef.current?.contains(target)
      if (!insideTable && !insideDropdown) {
        setStatusMenu(null)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  // ferme le menu si on scrolle (table ou page) pour éviter qu'il reste mal positionné
  useEffect(() => {
    if (!statusMenu) return
    function close() {
      setStatusMenu(null)
    }
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [statusMenu])

  function toggleStatusMenu(orderId: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (statusMenu === orderId) {
      setStatusMenu(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const menuHeight = STATUS_LIST.length * 34 + 8
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight

    setMenuPos({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
    })
    setStatusMenu(orderId)
  }

  /* ───────── loading ───────── */

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 bg-[var(--surface)] rounded-xl animate-pulse border border-white/5"
          />
        ))}
      </div>
    )
  }

  /* ───────── empty ───────── */

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[var(--text-4)] font-medium">
          Aucune commande trouvée
        </p>
      </div>
    )
  }

  /* ───────── table ───────── */

  return (
    <div ref={menuRef} className="relative">
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-sm border-collapse">

          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-[var(--input-bg)]">
            <tr className="border-b border-white/5">
              <Th>Boutique</Th>
              <Th>Commande</Th>
              <Th>Transporteur</Th>
              <Th>Suivi</Th>
              <Th align="right">Articles</Th>
              <Th align="right">Montant</Th>
              <Th>Date paiement</Th>
              <Th>Délai</Th>
              <Th>Tech</Th>
              <Th>Note</Th>
              <Th>Statut</Th>
              <Th>Transp. retour</Th>
              <Th>Suivi retour</Th>
              <Th>Délai retour</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>

          <tbody className="bg-[var(--table-bg)]">
            {orders.map((o, idx) => {
              const shop = getShop(o.shopSlug.toLowerCase())
              const carrier = getCarrier(o.carrier)
              const delay = getDelay(o.paymentDate, o.status, o.frozenDelay, o.deliveredAt)
              const returnCarrier = o.returnCarrier ? getCarrier(o.returnCarrier) : undefined
              const returnDelay = getReturnDelay(o.returnShippedAt, o.status, o.returnFrozenDelay)

              return (
                <tr
                  key={o.id}
                  className={`group border-b border-white/[0.03] hover:bg-[var(--surface-hover)] transition-colors ${
                    idx % 2 === 0 ? "" : "bg-[var(--surface)]/50"
                  }`}
                >
                  <td
  className="px-4 py-3.5 font-medium text-[var(--color-white)] flex items-center gap-2 cursor-pointer"
  onClick={() => setSelectedShop(o.shopSlug.toLowerCase())}
>
  <Image
    src={`/logo/${o.shopSlug.toLowerCase()}.png`}
    alt={shop?.name ?? o.shopSlug}
    width={20}
    height={20}
    className="w-5 h-5 rounded"
  />

  <span className="hover:underline">
    {shop?.name ?? o.shopSlug}
  </span>
</td>

                  <td className="px-4 py-3.5 font-mono text-xs text-[var(--text-3)]">
                    {o.orderNumber || "—"}
                  </td>

                  <td className="px-4 py-3.5 text-[var(--text-3)]">
                    {o.carrier ? (
                      carrier ? (
                        <span className="flex items-center gap-2" title={carrier.name}>
                          <Image
                            src={`/carriers/${carrier.slug}.png`}
                            alt={carrier.name}
                            width={20}
                            height={20}
                            className="rounded shrink-0"
                          />
                          <span className="sr-only">{carrier.name}</span>
                        </span>
                      ) : (
                        o.carrier
                      )
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-[var(--text-4)]">
                    {o.trackingNumber ? (
                      carrier ? (
                        <a
                          href={carrier.trackingUrl(o.trackingNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-[var(--accent-300)]"
                        >
                          {o.trackingNumber}
                        </a>
                      ) : (
                        o.trackingNumber
                      )
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right text-[var(--text-3)]">
                    {o.items}
                  </td>

                  <td className="px-4 py-3.5 text-right font-semibold text-[var(--color-white)]">
                    {fmt(o.amount)}
                  </td>

                  <td className="px-4 py-3.5 text-[var(--text-4)] text-xs">
                    {fmtDate(o.paymentDate)}
                  </td>

                  {/* ───── DELAY ───── */}
                  <td className={`px-4 py-3.5 font-semibold ${getDelayColor(delay)}`}>
                    {delay}j
                  </td>

                  {/* ───── TECH ───── */}
                  <td className="px-4 py-3.5 text-[var(--text-3)] text-xs">
                    {o.tech || "—"}
                  </td>

                  {/* ───── NOTE ───── */}
                  <td className="px-4 py-3.5 text-[var(--text-4)] text-xs max-w-[160px]">
                    {o.note ? (
                      <span title={o.note}>
                        {o.note.length > 20
                          ? o.note.slice(0, 20) + "..."
                          : o.note}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3.5 relative">
                    <button onClick={(e) => toggleStatusMenu(o.id, e)}>
                      <StatusBadge status={o.status} />
                    </button>
                  </td>

                  {/* ───── RETOUR ───── */}
                  <td className="px-4 py-3.5 text-[var(--text-3)]">
                    {o.returnCarrier ? (
                      returnCarrier ? (
                        <span className="flex items-center gap-2" title={returnCarrier.name}>
                          <Image
                            src={`/carriers/${returnCarrier.slug}.png`}
                            alt={returnCarrier.name}
                            width={20}
                            height={20}
                            className="rounded shrink-0"
                          />
                          <span className="sr-only">{returnCarrier.name}</span>
                        </span>
                      ) : (
                        o.returnCarrier
                      )
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-[var(--text-4)]">
                    {o.returnTrackingNumber ? (
                      returnCarrier ? (
                        <a
                          href={returnCarrier.trackingUrl(o.returnTrackingNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-[var(--accent-300)]"
                        >
                          {o.returnTrackingNumber}
                        </a>
                      ) : (
                        o.returnTrackingNumber
                      )
                    ) : (
                      "—"
                    )}
                  </td>

                  <td
                    className={
                      returnDelay === null
                        ? "px-4 py-3.5 text-[var(--text-5)]"
                        : `px-4 py-3.5 font-semibold ${getDelayColor(returnDelay)}`
                    }
                  >
                    {returnDelay === null ? "—" : `${returnDelay}j`}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <ActionBtn title="Edit" onClick={() => onEdit(o)} />
                      <ActionBtn title="Dup" onClick={() => onDuplicate(o)} />
                      <ActionBtn
                        title="Delete"
                        onClick={() => onDelete(o)}
                        danger
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selectedShop && (
  <ShopModal
    slug={selectedShop}
    onClose={() => setSelectedShop(null)}
  />
)}
      {returnModalOrderId && (
        <ReturnModal
          onConfirm={(carrier, trackingNumber) =>
            onMarkReturn(returnModalOrderId, carrier, trackingNumber)
          }
          onClose={() => setReturnModalOrderId(null)}
        />
      )}
      {statusMenu &&
        menuPos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed w-44 max-h-[60vh] overflow-y-auto bg-[var(--dropdown-bg)] border border-white/10 rounded-xl z-50 py-1 shadow-xl shadow-black/40"
          >
            {STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={async () => {
                  if (s === "Retour") {
                    setReturnModalOrderId(statusMenu)
                    setStatusMenu(null)
                    return
                  }
                  await onStatusChange(statusMenu, s)
                  setStatusMenu(null)
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-white/5"
              >
                {s}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

/* ───────── small components ───────── */

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className={`px-4 py-3 text-xs text-[var(--text-5)] uppercase ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  )
}

function ActionBtn({
  title,
  onClick,
  danger,
}: {
  title: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
        danger
          ? "text-red-400 hover:bg-red-400/10"
          : "text-[var(--text-5)] hover:text-[var(--color-white)] hover:bg-white/5"
      }`}
    >
      ⋯
    </button>
  )
}