"use client"

import { useState } from "react"

interface Props {
  shopName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function DeleteConfirm({ shopName, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#16161f] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Supprimer la commande</h3>
            <p className="text-xs text-[#6b6b80] mt-0.5">{shopName}</p>
          </div>
        </div>

        <p className="text-sm text-[#8080a0] mb-6">
          Cette action est irréversible. La commande sera définitivement supprimée.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-[#8080a0] hover:text-white hover:border-white/20 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  )
}
