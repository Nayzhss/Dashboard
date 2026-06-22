"use client"

import { useState } from "react"
import { CarrierInput } from "./CarrierInput"

interface Props {
  onConfirm: (carrier: string, trackingNumber: string) => Promise<void>
  onClose: () => void
}

const inputCls =
  "w-full px-3 py-2 bg-[var(--input-bg)] border border-white/5 rounded-lg text-sm text-[var(--color-white)] placeholder:text-[var(--text-6)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"

export function ReturnModal({ onConfirm, onClose }: Props) {
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm(carrier, trackingNumber)
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
        className="bg-[var(--surface)] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-[var(--color-white)] mb-1">
          Commande en retour
        </h2>
        <p className="text-xs text-[var(--text-4)] mb-5">
          Renseigne le transporteur du retour pour suivre le colis et calculer son délai.
          Tu peux laisser ces champs vides et les compléter plus tard depuis l'édition.
        </p>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-[var(--text-4)]">Transporteur retour</span>
            <CarrierInput
              value={carrier}
              onChange={setCarrier}
              placeholder="DHL, Colissimo…"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--text-4)]">Numéro de suivi retour</span>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="TRK123456"
              className={inputCls}
            />
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-[var(--text-3)] hover:text-[var(--color-white)] hover:border-white/20 transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--accent-600)] hover:bg-[var(--accent-500)] disabled:opacity-40 text-sm font-medium text-[#fff] transition-colors"
          >
            {loading ? "Confirmation…" : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  )
}
