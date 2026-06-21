import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const update: Record<string, unknown> = {}

  if (body.website !== undefined) update.website = body.website
  if (body.contactUrl !== undefined) update.contact_url = body.contactUrl || null
  if (body.phone !== undefined) update.phone = body.phone || null
  if (body.mail !== undefined) update.mail = body.mail || null
  if (body.accountFresh !== undefined) update.account_fresh = body.accountFresh
  if (body.notes !== undefined) update.notes = body.notes || null
  if (body.shippingDelivery !== undefined) update.shipping_delivery = body.shippingDelivery
  if (body.shippingReturn !== undefined) update.shipping_return = body.shippingReturn

  const { error } = await supabase.from("shops").update(update).eq("slug", slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
