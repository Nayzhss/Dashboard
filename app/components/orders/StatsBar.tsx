"use client"

import { useEffect, useRef, useState } from "react"

interface Stats {
  total: number
  totalAmount: number
  monthlyProfit: number
  monthlyTrend: number[]
  pending: number
  refunded: number
  failed: number
}

interface Props {
  stats: Stats
  loading: boolean
}

function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)
  const firstRender = useRef(true)

  useEffect(() => {
    // pas d'animation au tout premier rendu (juste après le chargement)
    if (firstRender.current) {
      firstRender.current = false
      prevRef.current = target
      setDisplay(target)
      return
    }

    const from = prevRef.current
    const to = target
    if (from === to) return

    let raf: number
    const start = performance.now()

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
        setDisplay(to)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

function StatCard({
  label,
  value,
  format,
  sub,
  accent,
  delay = 0,
}: {
  label: string
  value: number
  format: (n: number) => string
  sub?: string
  accent?: string
  delay?: number
}) {
  const display = useCountUp(value)

  return (
    <div
      className="animate-fade-up bg-[var(--surface)] border border-white/5 rounded-2xl p-5 flex flex-col gap-1 hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >

      <p className="text-xs font-medium text-[var(--text-4)] uppercase tracking-widest">
        {label}
      </p>
      <p className={`text-2xl font-semibold tabular-nums ${accent ?? "text-[var(--color-white)]"}`}>
        {format(display)}
      </p>
      {sub && <p className="text-xs text-[var(--text-4)]">{sub}</p>}
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n)
}

const fmtInt = (n: number) => String(Math.round(n))

function monthLabels(count: number) {
  const now = new Date()
  const labels: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d))
  }
  return labels
}

function Sparkline({ values }: { values: number[] }) {
  const width = 600
  const height = 56
  const padding = 6
  const labels = monthLabels(values.length)

  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = padding + (i * (width - padding * 2)) / (values.length - 1)
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
  const areaPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`

  return (
    <div className="animate-fade-up bg-[var(--surface)] border border-white/5 rounded-2xl p-5" style={{ animationDelay: "240ms" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[var(--text-4)] uppercase tracking-widest">
          Tendance bénéf (6 mois)
        </p>
        <span className={`text-xs font-semibold tabular-nums ${values[values.length - 1] < 0 ? "text-red-400" : "text-emerald-300"}`}>
          {fmt(values[values.length - 1])}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-400)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkline-fill)" />
        <path d={linePath} fill="none" stroke="var(--accent-400)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="var(--accent-300)" />
        ))}
      </svg>

      <div className="flex justify-between mt-1 text-[10px] text-[var(--text-5)]">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  )
}

export function StatsBar({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--surface)] border border-white/5 rounded-2xl p-5 h-[82px] animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      <StatCard label="Commandes" value={stats.total} format={fmtInt} delay={0} />
      <StatCard
        label="Montant total"
        value={stats.totalAmount}
        format={fmt}
        accent="text-[var(--accent-300)]"
        delay={40}
      />
      <StatCard
        label="Bénéf du mois"
        value={stats.monthlyProfit}
        format={fmt}
        accent={stats.monthlyProfit < 0 ? "text-red-400" : "text-emerald-300"}
        delay={80}
      />
      <StatCard
        label="En attente"
        value={stats.pending}
        format={fmtInt}
        accent="text-amber-300"
        sub={stats.total ? `${Math.round((stats.pending / stats.total) * 100)}%` : undefined}
        delay={120}
      />
      <StatCard
        label="Remboursées"
        value={stats.refunded}
        format={fmtInt}
        accent="text-emerald-300"
        delay={160}
      />
      <StatCard
        label="Échecs"
        value={stats.failed}
        format={fmtInt}
        accent={stats.failed > 0 ? "text-red-400" : "text-[var(--color-white)]"}
        delay={200}
      />
    </div>

    <div className="mb-8">
      <Sparkline values={stats.monthlyTrend} />
    </div>
    </>
  )
}
