import type { Order } from "@/app/components/orders/types"
import type { Shop, MethodStats } from "@/app/data/shops"

export interface OrderRow {
  id: string
  user_id: string
  shop_slug: string
  order_number: string
  carrier: string
  tracking_number: string
  items: number
  amount: number
  payment_date: string | null
  status: Order["status"]
  return_status: Order["returnStatus"]
  tech: string | null
  note: string | null
  frozen_delay: number | null
  delivered_at: string | null
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    shopSlug: row.shop_slug,
    orderNumber: row.order_number,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    items: row.items,
    amount: row.amount,
    paymentDate: row.payment_date ?? "",
    status: row.status,
    returnStatus: row.return_status,
    tech: row.tech ?? undefined,
    note: row.note ?? undefined,
    frozenDelay: row.frozen_delay ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
  }
}

export function orderToRow(data: Partial<Order>): Partial<OrderRow> {
  const row: Partial<OrderRow> = {}

  if (data.shopSlug !== undefined) row.shop_slug = data.shopSlug
  if (data.orderNumber !== undefined) row.order_number = data.orderNumber
  if (data.carrier !== undefined) row.carrier = data.carrier
  if (data.trackingNumber !== undefined) row.tracking_number = data.trackingNumber
  if (data.items !== undefined) row.items = data.items
  if (data.amount !== undefined) row.amount = data.amount
  if (data.paymentDate !== undefined) row.payment_date = data.paymentDate || null
  if (data.status !== undefined) row.status = data.status
  if (data.returnStatus !== undefined) row.return_status = data.returnStatus
  if (data.tech !== undefined) row.tech = data.tech || null
  if (data.note !== undefined) row.note = data.note || null
  if (data.frozenDelay !== undefined) row.frozen_delay = data.frozenDelay
  if (data.deliveredAt !== undefined) row.delivered_at = data.deliveredAt || null

  return row
}

export interface ShopMethodRow {
  name: string
  vouches: number
  fails: number
  avg_delay: number | null
  max_amount: number
}

export interface ShopRow {
  slug: string
  name: string
  website: string
  contact_url: string | null
  phone: string | null
  mail: string | null
  account_fresh: boolean
  notes: string | null
  shipping_delivery: string[]
  shipping_return: string[]
  shop_methods: ShopMethodRow[]
}

function rowToMethod(row: ShopMethodRow): MethodStats {
  return {
    name: row.name,
    vouches: row.vouches,
    fails: row.fails,
    avgDelay: row.avg_delay,
    maxAmount: row.max_amount,
  }
}

export function rowToShop(row: ShopRow): Shop {
  return {
    slug: row.slug,
    name: row.name,
    website: row.website,
    contactUrl: row.contact_url ?? undefined,
    phone: row.phone ?? undefined,
    mail: row.mail ?? undefined,
    accountFresh: row.account_fresh,
    notes: row.notes ?? undefined,
    methods: (row.shop_methods ?? []).map(rowToMethod),
    shipping: {
      delivery: row.shipping_delivery ?? [],
      return: row.shipping_return ?? [],
    },
  }
}
