import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rowToOrder, orderToRow, type OrderRow } from "@/lib/supabase/mappers"
import { getCarrier } from "@/app/data/carriers"
import { registerTracking } from "@/lib/track17"
import type { OrderFormData } from "@/app/components/orders/types"

async function maybeRegisterTracking(carrierName?: string, trackingNumber?: string) {
  if (!carrierName || !trackingNumber) return

  const carrier = getCarrier(carrierName)
  if (!carrier) return

  try {
    await registerTracking([{ number: trackingNumber, carrier: carrier.track17Code }])
  } catch {
    // best-effort: a failed registration shouldn't break order creation/update
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("payment_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data as OrderRow[]).map(rowToOrder))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: OrderFormData = await req.json()

  const { data, error } = await supabase
    .from("orders")
    .insert({ ...orderToRow(body), user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await maybeRegisterTracking(body.carrier, body.trackingNumber)

  return NextResponse.json(rowToOrder(data as OrderRow), { status: 201 })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, ...updates } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("orders")
    .update(orderToRow(updates))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const row = data as OrderRow
  await maybeRegisterTracking(row.carrier, row.tracking_number)
  await maybeRegisterTracking(row.return_carrier ?? undefined, row.return_tracking_number ?? undefined)

  return NextResponse.json(rowToOrder(row))
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error || !count) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
