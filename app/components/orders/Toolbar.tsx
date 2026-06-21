"use client"

import { STATUS_LIST } from "./types"
import type { Filters, SortField, SortDir } from "./types"

interface Props {
  filters: Filters
  setFilters: (f: Filters) => void
  sortField: SortField
  sortDir: SortDir
  toggleSort: (f: SortField) => void
  uniqueShops: string[]
  uniqueCarriers: string[]
  totalVisible: number
  totalAll: number
  onNew: () => void
}

function SortBtn({
  label,
  field,
  current,
  dir,
  onToggle,
}: {
  label: string
  field: SortField
  current: SortField
  dir: SortDir
  onToggle: (f: SortField) => void
}) {
  const active = current === field
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-[var(--accent-500)]/20 text-[var(--accent-300)] border border-[var(--accent-500)]/30"
          : "text-[var(--text-4)] hover:text-[var(--color-white)] border border-transparent hover:border-white/10"
      }`}
    >
      {label}
      {active && (
        <span className="text-[10px]">{dir === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  )
}

export function Toolbar({
  filters,
  setFilters,
  sortField,
  sortDir,
  toggleSort,
  uniqueShops,
  uniqueCarriers,
  totalVisible,
  totalAll,
  onNew,
}: Props) {
  const set = (key: keyof Filters, value: string) =>
    setFilters({ ...filters, [key]: value })

  const hasFilters =
    filters.search || filters.status || filters.shop || filters.carrier || filters.dateFrom || filters.dateTo

  return (
    <div className="mb-6 space-y-3">
      {/* Top row */}
      <div className="flex gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-5)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Rechercher boutique, commande, tracking…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface)] border border-white/5 rounded-xl text-sm text-[var(--color-white)] placeholder:text-[var(--text-5)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => set("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-5)] hover:text-[var(--color-white)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* New order button */}
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] rounded-xl text-sm font-medium text-[#fff] transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle commande
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={filters.status}
          onChange={(v) => set("status", v)}
          placeholder="Tous les statuts"
          options={STATUS_LIST.map((s) => ({ value: s, label: s }))}
        />
        <Select
          value={filters.shop}
          onChange={(v) => set("shop", v)}
          placeholder="Toutes les boutiques"
          options={uniqueShops.map((s) => ({ value: s, label: s }))}
        />
        <Select
          value={filters.carrier}
          onChange={(v) => set("carrier", v)}
          placeholder="Tous les transporteurs"
          options={uniqueCarriers.map((s) => ({ value: s, label: s }))}
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => set("dateFrom", e.target.value)}
          title="Date de début"
          className="px-3 py-1.5 bg-[var(--surface)] border border-white/5 rounded-lg text-xs text-[var(--text-4)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"
        />
        <span className="text-[var(--text-6)] text-xs">→</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => set("dateTo", e.target.value)}
          title="Date de fin"
          className="px-3 py-1.5 bg-[var(--surface)] border border-white/5 rounded-lg text-xs text-[var(--text-4)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors"
        />

        {hasFilters && (
          <button
            onClick={() =>
              setFilters({
                search: "",
                status: "",
                shop: "",
                carrier: "",
                dateFrom: "",
                dateTo: "",
              })
            }
            className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-4)] hover:text-[var(--color-white)] border border-white/5 hover:border-white/10 transition-colors"
          >
            Effacer
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-xs text-[var(--text-5)]">
          {totalVisible === totalAll
            ? `${totalAll} commande${totalAll !== 1 ? "s" : ""}`
            : `${totalVisible} / ${totalAll}`}
        </span>
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-[var(--text-5)] mr-1">Trier :</span>
        <SortBtn label="Date" field="paymentDate" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortBtn label="Montant" field="amount" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortBtn label="Boutique A–Z" field="shop" current={sortField} dir={sortDir} onToggle={toggleSort} />
      </div>
    </div>
  )
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 bg-[var(--surface)] border border-white/5 rounded-lg text-xs text-[var(--text-2)] focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
