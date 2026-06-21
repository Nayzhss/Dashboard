"use client"

import { useState, useEffect } from "react"
import {
  STATUS_LIST,
  EMPTY_FORM,
  DEFAULT_TECHS,
  RETURN_TECHS,
} from "./types"
import type { Order, OrderFormData, Status } from "./types"

interface Props {
  mode: "create" | "edit"
  order?: Order
  onSave: (data: OrderFormData) => Promise<void>
  onClose: () => void
}

export function OrderModal({
  mode,
  order,
  onSave,
  onClose,
}: Props) {
  const [form, setForm] =
    useState<OrderFormData>(EMPTY_FORM)

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    if (mode === "edit" && order) {
      setForm({
        shopSlug: order.shopSlug,
        orderNumber: order.orderNumber,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        items: order.items,
        amount: order.amount,
        paymentDate: order.paymentDate,
        status: order.status,
        returnStatus: order.returnStatus,

        tech: order.tech ?? "",
        note: order.note ?? "",
      })
    }
  }, [mode, order])

  function set<K extends keyof OrderFormData>(
    key: K,
    value: OrderFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handleSave() {
    setLoading(true)

    try {
      await onSave(form)
      onClose()
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-white)]">
              {mode === "create"
                ? "Nouvelle commande"
                : "Modifier la commande"}
            </h2>

            {mode === "edit" &&
              order && (
                <p className="text-xs text-[var(--text-4)] mt-0.5">
                  {order.shopSlug}
                </p>
              )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-5)] hover:text-[var(--color-white)] hover:bg-white/5 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Boutique *">
              <input
                type="text"
                value={form.shopSlug}
                onChange={(e) =>
                  set(
                    "shopSlug",
                    e.target.value
                  )
                }
                placeholder="Nike, Zara…"
                className={inputCls}
              />
            </Field>

            <Field label="N° commande">
              <input
                type="text"
                value={form.orderNumber}
                onChange={(e) =>
                  set(
                    "orderNumber",
                    e.target.value
                  )
                }
                placeholder="CMD-001"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Transporteur">
              <input
                type="text"
                value={form.carrier}
                onChange={(e) =>
                  set(
                    "carrier",
                    e.target.value
                  )
                }
                placeholder="DHL, Colissimo…"
                className={inputCls}
              />
            </Field>

            <Field label="Numéro de suivi">
              <input
                type="text"
                value={form.trackingNumber}
                onChange={(e) =>
                  set(
                    "trackingNumber",
                    e.target.value
                  )
                }
                placeholder="TRK123456"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Articles">
              <input
                type="number"
                min={1}
                value={form.items}
                onChange={(e) =>
                  set(
                    "items",
                    Number(
                      e.target.value
                    )
                  )
                }
                className={inputCls}
              />
            </Field>

            <Field label="Montant (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.amount}
                onChange={(e) =>
                  set(
                    "amount",
                    Number(
                      e.target.value
                    )
                  )
                }
                className={inputCls}
              />
            </Field>

            <Field label="Date paiement">
              <input
                type="date"
                value={form.paymentDate}
                onChange={(e) =>
                  set(
                    "paymentDate",
                    e.target.value
                  )
                }
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Statut">
            <select
              value={form.status}
              onChange={(e) =>
                set(
                  "status",
                  e.target.value as Status
                )
              }
              className={inputCls}
            >
              {STATUS_LIST.map((s) => (
                <option
                  key={s}
                  value={s}
                >
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tech">
            <select
              value={form.tech}
              onChange={(e) =>
                set("tech", e.target.value)
              }
              className={inputCls}
            >
              <option value="">
                Sélectionner
              </option>

              {(form.status === "Retour"
                ? RETURN_TECHS
                : DEFAULT_TECHS
              ).map((tech) => (
                <option
                  key={tech}
                  value={tech}
                >
                  {tech}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Note">
            <textarea
              rows={4}
              value={form.note}
              onChange={(e) =>
                set("note", e.target.value)
              }
              placeholder="Ajouter une note..."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-[var(--text-3)] hover:text-[var(--color-white)] hover:border-white/20 transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={
              !form.shopSlug || loading
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--accent-600)] hover:bg-[var(--accent-500)] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-[#fff] transition-colors"
          >
            {loading
              ? mode === "create"
                ? "Création…"
                : "Sauvegarde…"
              : mode === "create"
              ? "Créer"
              : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--text-4)]">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  "w-full px-3 py-2 bg-[var(--input-bg)] border border-white/5 rounded-lg text-sm text-[var(--color-white)] placeholder:text-[var(--text-6)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"