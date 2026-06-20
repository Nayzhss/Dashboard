interface Stats {
  total: number
  totalAmount: number
  monthlyProfit: number
  pending: number
  refunded: number
  failed: number
}

interface Props {
  stats: Stats
  loading: boolean
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="bg-[#16161f] border border-white/5 rounded-2xl p-5 flex flex-col gap-1 hover:border-white/10 transition-colors">
      <p className="text-xs font-medium text-[#6b6b80] uppercase tracking-widest">
        {label}
      </p>
      <p className={`text-2xl font-semibold tabular-nums ${accent ?? "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#6b6b80]">{sub}</p>}
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

export function StatsBar({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#16161f] border border-white/5 rounded-2xl p-5 h-[82px] animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      <StatCard label="Commandes" value={String(stats.total)} />
      <StatCard
        label="Montant total"
        value={fmt(stats.totalAmount)}
        accent="text-violet-300"
      />
      <StatCard
        label="Bénéf du mois"
        value={fmt(stats.monthlyProfit)}
        accent={stats.monthlyProfit < 0 ? "text-red-400" : "text-emerald-300"}
      />
      <StatCard
        label="En attente"
        value={String(stats.pending)}
        accent="text-amber-300"
        sub={stats.total ? `${Math.round((stats.pending / stats.total) * 100)}%` : undefined}
      />
      <StatCard
        label="Remboursées"
        value={String(stats.refunded)}
        accent="text-emerald-300"
      />
      <StatCard
        label="Échecs"
        value={String(stats.failed)}
        accent={stats.failed > 0 ? "text-red-400" : "text-white"}
      />
    </div>
  )
}
