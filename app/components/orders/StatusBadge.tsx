import { STATUS_CONFIG } from "./types"
import type { Status } from "./types"

interface Props {
  status: Status
  size?: "sm" | "md"
}

export function StatusBadge({ status, size = "sm" }: Props) {
  const cfg = STATUS_CONFIG[status]
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
