"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { StatusBadge } from "./StatusBadge"
import { STATUS_LIST } from "./types"
import type { Order, Status } from "./types"

interface Props {
  orders: Order[]
  loading: boolean
  onEdit: (order: Order) => void
  onDelete: (order: Order) => void
  onDuplicate: (order: Order) => void
  onStatusChange: (id: string, status: Status) => Promise<void>
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
 * Délai = jours depuis paymentDate
 */
function getDelay(paymentDate: string, status: Status) {
  if (!paymentDate) return 0

  const endStatuses = ["Remboursée", "Fail"]
  const start = new Date(paymentDate).getTime()
  const end = new Date().getTime()

  return Math.floor((end - start) / (1000 * 60 * 60 * 24))
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
}: Props) {
  const [statusMenu, setStatusMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStatusMenu(null)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  /* ───────── loading ───────── */

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 bg-[#16161f] rounded-xl animate-pulse border border-white/5"
          />
        ))}
      </div>
    )
  }

  /* ───────── empty ───────── */

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[#6b6b80] font-medium">
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
          <thead className="sticky top-0 z-10 bg-[#0f0f14]">
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
              <Th align="right">Actions</Th>
            </tr>
          </thead>

          <tbody className="bg-[#13131a]">
            {orders.map((o, idx) => {
              const delay = getDelay(o.paymentDate, o.status)

              return (
                <tr
                  key={o.id}
                  className={`group border-b border-white/[0.03] hover:bg-[#1a1a27] transition-colors ${
                    idx % 2 === 0 ? "" : "bg-[#16161f]/50"
                  }`}
                >
                  <td className="px-4 py-3.5 font-medium text-white">
                    {o.shop || "—"}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-[#8080a0]">
                    {o.orderNumber || "—"}
                  </td>

                  <td className="px-4 py-3.5 text-[#8080a0]">
                    {o.carrier || "—"}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-[#6b6b80]">
                    {o.trackingNumber || "—"}
                  </td>

                  <td className="px-4 py-3.5 text-right text-[#8080a0]">
                    {o.items}
                  </td>

                  <td className="px-4 py-3.5 text-right font-semibold text-white">
                    {fmt(o.amount)}
                  </td>

                  <td className="px-4 py-3.5 text-[#6b6b80] text-xs">
                    {fmtDate(o.paymentDate)}
                  </td>

                  {/* ───── DELAY ───── */}
                  <td className={`px-4 py-3.5 font-semibold ${getDelayColor(delay)}`}>
                    {delay}j
                  </td>

                  {/* ───── TECH ───── */}
                  <td className="px-4 py-3.5 text-[#8080a0] text-xs">
                    {o.tech || "—"}
                  </td>

                  {/* ───── NOTE ───── */}
                  <td className="px-4 py-3.5 text-[#6b6b80] text-xs max-w-[160px]">
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
                    <button
                      onClick={() =>
                        setStatusMenu(
                          statusMenu === o.id ? null : o.id
                        )
                      }
                    >
                      <StatusBadge status={o.status} />
                    </button>

                    {statusMenu === o.id && (
                      <div className="absolute left-4 top-full mt-1 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl z-50 py-1">
                        {STATUS_LIST.map((s) => (
                          <button
                            key={s}
                            onClick={async () => {
                              await onStatusChange(o.id, s)
                              setStatusMenu(null)
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-white/5"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
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
      className={`px-4 py-3 text-xs text-[#4a4a60] uppercase ${
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
          : "text-[#4a4a60] hover:text-white hover:bg-white/5"
      }`}
    >
      ⋯
    </button>
  )
}