export type Status =
  | "En attente"
  | "Payée"
  | "Expédiée"
  | "Livrée"
  | "Retour"
  | "Remboursée"
  | "Fail"

export type ReturnStatus = "waiting" | "scanned" | "returned"

export type AccountType = "fresh" | "old"
export type DeliveryType = "domicile" | "relais"

export type SortField = "paymentDate" | "amount" | "shop"
export type SortDir = "asc" | "desc"

export interface Order {
  id: string
  shopSlug: string
  orderNumber: string
  carrier: string
  trackingNumber: string
  items: number
  amount: number
  paymentDate: string
  status: Status
  returnStatus: ReturnStatus

  tech?: string
  note?: string

  accountType?: AccountType
  deliveryType?: DeliveryType

  // délai figé quand commande remboursée ou fail
  frozenDelay?: number

  deliveredAt?: string

  returnCarrier?: string
  returnTrackingNumber?: string
  returnShippedAt?: string
  // délai retour figé quand commande remboursée ou fail
  returnFrozenDelay?: number
}

// Données mutables d'une commande, où accountType/deliveryType peuvent
// valoir "" (depuis le formulaire) en plus de leur valeur réelle ou undefined
export type OrderUpdateInput = Partial<Omit<Order, "accountType" | "deliveryType">> & {
  accountType?: AccountType | ""
  deliveryType?: DeliveryType | ""
}

export interface OrderFormData {
  shopSlug: string
  orderNumber: string
  carrier: string
  trackingNumber: string
  items: number
  amount: number
  paymentDate: string
  status: Status
  returnStatus: ReturnStatus

  tech: string
  note: string

  accountType: AccountType | ""
  deliveryType: DeliveryType | ""

  deliveredAt: string
}

export interface Filters {
  search: string
  status: Status | ""
  shop: string
  carrier: string
  dateFrom: string
  dateTo: string
}

export const STATUS_LIST: Status[] = [
  "En attente",
  "Payée",
  "Expédiée",
  "Livrée",
  "Retour",
  "Remboursée",
  "Fail",
]

export const STATUS_CONFIG: Record<
  Status,
  {
    label: string
    dot: string
    bg: string
    text: string
  }
> = {
  "En attente": {
    label: "En attente",
    dot: "bg-amber-400",
    bg: "bg-amber-400/10",
    text: "text-amber-300",
  },

  Payée: {
    label: "Payée",
    dot: "bg-blue-400",
    bg: "bg-blue-400/10",
    text: "text-blue-300",
  },

  Expédiée: {
    label: "Expédiée",
    dot: "bg-violet-400",
    bg: "bg-violet-400/10",
    text: "text-violet-300",
  },

  Livrée: {
    label: "Livrée",
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
  },

  Retour: {
    label: "Retour",
    dot: "bg-orange-400",
    bg: "bg-orange-400/10",
    text: "text-orange-300",
  },

  Remboursée: {
    label: "Remboursée",
    dot: "bg-green-400",
    bg: "bg-green-400/10",
    text: "text-green-300",
  },

  Fail: {
    label: "Fail",
    dot: "bg-red-400",
    bg: "bg-red-400/10",
    text: "text-red-400",
  },
}

export const DEFAULT_TECHS = [
  "EB",
  "DNA",
  "EB PR",
  "DNA PR",
  "RTS",
  "RR",
  "WIR",
] as const

export const RETURN_TECHS = [
  "LIT SCAN",
  "LIT TRANSIT",
  "FTID",
] as const

export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; emoji: string }> = {
  fresh: { label: "Fresh", emoji: "✨" },
  old: { label: "Old", emoji: "📦" },
}

export const DELIVERY_TYPE_CONFIG: Record<DeliveryType, { label: string; emoji: string }> = {
  domicile: { label: "Domicile", emoji: "🏠" },
  relais: { label: "Point relais", emoji: "🏪" },
}

export const EMPTY_FORM: OrderFormData = {
  shopSlug: "",
  orderNumber: "",
  carrier: "",
  trackingNumber: "",
  items: 1,
  amount: 0,
  paymentDate: "",
  status: "En attente",
  returnStatus: "waiting",

  tech: "",
  note: "",

  accountType: "",
  deliveryType: "",

  deliveredAt: "",
}