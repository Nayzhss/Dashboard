"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { StatusBadge } from "./StatusBadge"
import { STATUS_LIST, ACCOUNT_TYPE_CONFIG, DELIVERY_TYPE_CONFIG } from "./types"
import { useShops } from "../../hooks/useShops"
import { getCarrier } from "../../data/carriers"
import { slugify } from "../../../lib/slugify"
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
 * Délai retour = jours depuis le dépôt réel du colis (returnDroppedAt si connu,
 * sinon returnShippedAt), figé sur returnFrozenDelay une fois remboursée/fail
 */
function getReturnDelay(
  returnShippedAt: string | undefined,
  status: Status,
  returnFrozenDelay?: number,
  returnDroppedAt?: string
) {
  const startDate = returnDroppedAt || returnShippedAt
  if (!startDate) return null

  const start = new Date(startDate).getTime()

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
  const [actionsMenuId, setActionsMenuId] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const actionsMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      const target = e.target as Node
      const insideWrapper = wrapperRef.current?.contains(target)
      const insideDropdown = dropdownRef.current?.contains(target)
      if (!insideWrapper && !insideDropdown) setStatusMenu(null)
      if (!insideWrapper) setActionsMenuId(null)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  // ferme le menu statut si on scrolle pour éviter qu'il reste mal positionné
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
    setActionsMenuId(null)
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
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 bg-[var(--surface)] rounded-2xl animate-pulse border border-white/5"
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

  /* ───────── cards ───────── */

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-3">
      {orders.map((o, idx) => {
        const shop = getShop(o.shopSlug)
        const delay = getDelay(o.paymentDate, o.status, o.frozenDelay, o.deliveredAt)
        const returnDelay = getReturnDelay(
          o.returnShippedAt,
          o.status,
          o.returnFrozenDelay,
          o.returnDroppedAt
        )
        const accountCfg = o.accountType ? ACCOUNT_TYPE_CONFIG[o.accountType] : undefined
        const deliveryCfg = o.deliveryType ? DELIVERY_TYPE_CONFIG[o.deliveryType] : undefined

        return (
          <div
            key={o.id}
            className="animate-fade-up bg-[var(--surface)] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-colors"
            style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => setSelectedShop(o.shopSlug)}
                className="flex items-center gap-2.5 min-w-0 text-left"
              >
                <Image
                  src={`/logo/${slugify(o.shopSlug)}.png`}
                  alt={shop?.name ?? o.shopSlug}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-lg shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-white)] truncate hover:underline">
                    {shop?.name ?? o.shopSlug}
                  </p>
                  <p className="text-xs text-[var(--text-5)] font-mono truncate">
                    {o.orderNumber || "—"}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={(e) => toggleStatusMenu(o.id, e)}>
                  <StatusBadge status={o.status} />
                </button>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActionsMenuId(actionsMenuId === o.id ? null : o.id)
                    }
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-5)] hover:text-[var(--color-white)] hover:bg-white/5 transition-colors"
                  >
                    ⋯
                  </button>

                  {actionsMenuId === o.id && (
                    <div
                      ref={actionsMenuRef}
                      className="absolute right-0 top-full mt-1 w-40 bg-[var(--dropdown-bg)] border border-white/10 rounded-xl z-20 py-1 shadow-xl shadow-black/40"
                    >
                      <MenuItem
                        onClick={() => {
                          onEdit(o)
                          setActionsMenuId(null)
                        }}
                      >
                        ✏️ Modifier
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          onDuplicate(o)
                          setActionsMenuId(null)
                        }}
                      >
                        📋 Dupliquer
                      </MenuItem>
                      <MenuItem
                        danger
                        onClick={() => {
                          onDelete(o)
                          setActionsMenuId(null)
                        }}
                      >
                        🗑️ Supprimer
                      </MenuItem>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Stat label="Montant" value={fmt(o.amount)} />
              <Stat label="Articles" value={String(o.items)} />
              <Stat label="Payé le" value={fmtDate(o.paymentDate)} />
              <Stat label="Délai" value={`${delay}j`} className={getDelayColor(delay)} />
              {accountCfg && (
                <Pill>
                  {accountCfg.emoji} {accountCfg.label}
                </Pill>
              )}
              {deliveryCfg && (
                <Pill>
                  {deliveryCfg.emoji} {deliveryCfg.label}
                </Pill>
              )}
            </div>

            {/* TRANSPORTEUR / TECH */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-3)]">
              <CarrierTrack carrierRaw={o.carrier} tracking={o.trackingNumber} />
              {o.tech && <span>🔧 {o.tech}</span>}
            </div>

            {/* RETOUR */}
            {(o.returnCarrier || o.returnTrackingNumber || o.returnDroppedAt) && (
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                <span className="text-[var(--text-5)] font-medium shrink-0">↩ Retour</span>
                <CarrierTrack carrierRaw={o.returnCarrier ?? ""} tracking={o.returnTrackingNumber ?? ""} />
                <span
                  className={
                    returnDelay === null
                      ? "text-[var(--text-5)]"
                      : `font-semibold ${getDelayColor(returnDelay)}`
                  }
                >
                  {returnDelay === null ? "—" : `${returnDelay}j de retour`}
                </span>
                {o.returnDroppedAt && (
                  <span className="text-[var(--text-5)]">
                    déposé le {fmtDate(o.returnDroppedAt)}
                  </span>
                )}
              </div>
            )}

            {/* NOTE */}
            {o.note && (
              <p
                className="mt-3 text-xs text-[var(--text-4)] italic line-clamp-2"
                title={o.note}
              >
                {o.note}
              </p>
            )}
          </div>
        )
      })}

      {selectedShop && (
        <ShopModal slug={selectedShop} onClose={() => setSelectedShop(null)} />
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

function CarrierTrack({
  carrierRaw,
  tracking,
}: {
  carrierRaw: string
  tracking: string
}) {
  if (!carrierRaw) return <span className="text-[var(--text-5)]">—</span>

  const carrier = getCarrier(carrierRaw)

  return (
    <span className="inline-flex items-center gap-1.5">
      {carrier && (
        <Image
          src={`/carriers/${carrier.slug}.png`}
          alt={carrier.name}
          width={16}
          height={16}
          className="rounded shrink-0"
        />
      )}
      {tracking ? (
        carrier ? (
          <a
            href={carrier.trackingUrl(tracking)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:underline hover:text-[var(--accent-300)]"
          >
            {tracking}
          </a>
        ) : (
          <span className="font-mono">{tracking}</span>
        )
      ) : (
        <span>{carrier ? carrier.name : carrierRaw}</span>
      )}
    </span>
  )
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-6)]">
        {label}
      </span>
      <span className={`text-sm font-semibold text-[var(--color-white)] ${className}`}>
        {value}
      </span>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-xs text-[var(--text-2)]">
      {children}
    </span>
  )
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 ${
        danger ? "text-red-400" : "text-[var(--text-2)]"
      }`}
    >
      {children}
    </button>
  )
}
