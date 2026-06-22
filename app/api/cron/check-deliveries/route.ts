import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCarrier } from "@/app/data/carriers"
import { getTrackInfo } from "@/lib/track17"
import type { OrderRow } from "@/lib/supabase/mappers"

// "Retour" est volontairement exclu : une fois en retour, le tracking
// principal est déjà "Delivered" (c'est ce qui a permis le retour), le
// re-vérifier ferait retomber la commande en "Livrée" à tort.
const ACTIVE_STATUSES = ["En attente", "Payée", "Expédiée"]
const BATCH_SIZE = 40 // 17Track's gettrackinfo limit per call

function authorized(req: NextRequest) {
  const header = req.headers.get("authorization")
  return header === `Bearer ${process.env.CRON_SECRET}`
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("orders")
    .select("id, carrier, tracking_number")
    .in("status", ACTIVE_STATUSES)
    .not("tracking_number", "is", null)
    .neq("tracking_number", "")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const trackable = (data as Pick<OrderRow, "id" | "carrier" | "tracking_number">[])
    .map((o) => ({ ...o, carrierInfo: getCarrier(o.carrier) }))
    .filter((o) => o.carrierInfo)

  let delivered = 0
  let checked = 0

  for (const batch of chunk(trackable, BATCH_SIZE)) {
    const items = batch.map((o) => ({
      number: o.tracking_number,
      carrier: o.carrierInfo!.track17Code,
    }))

    const results = await getTrackInfo(items)
    checked += results.length

    for (const result of results) {
      if (!result.delivered) continue

      const matches = batch.filter(
        (o) =>
          o.tracking_number === result.number &&
          o.carrierInfo!.track17Code === result.carrier
      )

      for (const order of matches) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "Livrée",
            return_status: "waiting",
            delivered_at: result.deliveredAt ?? new Date().toISOString(),
          })
          .eq("id", order.id)

        if (!updateError) delivered++
      }
    }
  }

  // ─── Colis retour : date de dépôt (une fois connue, on ne re-vérifie plus) ───

  const { data: returns, error: returnsError } = await supabase
    .from("orders")
    .select("id, return_carrier, return_tracking_number")
    .eq("status", "Retour")
    .is("return_dropped_at", null)
    .not("return_tracking_number", "is", null)
    .neq("return_tracking_number", "")

  let returnsChecked = 0
  let returnsDropped = 0

  if (!returnsError && returns?.length) {
    const trackableReturns = (
      returns as Pick<OrderRow, "id" | "return_carrier" | "return_tracking_number">[]
    )
      .map((o) => ({ ...o, carrierInfo: getCarrier(o.return_carrier ?? "") }))
      .filter((o) => o.carrierInfo)

    for (const batch of chunk(trackableReturns, BATCH_SIZE)) {
      const items = batch.map((o) => ({
        number: o.return_tracking_number!,
        carrier: o.carrierInfo!.track17Code,
      }))

      const results = await getTrackInfo(items)
      returnsChecked += results.length

      for (const result of results) {
        if (!result.pickedUpAt) continue

        const matches = batch.filter(
          (o) =>
            o.return_tracking_number === result.number &&
            o.carrierInfo!.track17Code === result.carrier
        )

        for (const order of matches) {
          const { error: updateError } = await supabase
            .from("orders")
            .update({ return_dropped_at: result.pickedUpAt.slice(0, 10) })
            .eq("id", order.id)

          if (!updateError) returnsDropped++
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    checked,
    delivered,
    returnsChecked,
    returnsDropped,
  })
}
