import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const BUCKET = "backups"
const KEEP = 8 // ~2 months of weekly backups

function authorized(req: NextRequest) {
  const header = req.headers.get("authorization")
  return header === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [shops, orders, profiles] = await Promise.all([
    supabase.from("shops").select("*, shop_methods(*)"),
    supabase.from("orders").select("*"),
    supabase.from("profiles").select("id, username, email, created_at"),
  ])

  for (const [name, res] of Object.entries({ shops, orders, profiles })) {
    if (res.error) {
      return NextResponse.json(
        { error: `Failed reading ${name}: ${res.error.message}` },
        { status: 500 }
      )
    }
  }

  const dump = {
    createdAt: new Date().toISOString(),
    shops: shops.data,
    orders: orders.data,
    profiles: profiles.data,
  }

  const filename = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, JSON.stringify(dump, null, 2), {
      contentType: "application/json",
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // prune anything beyond the most recent KEEP backups
  const { data: existing } = await supabase.storage.from(BUCKET).list("", {
    sortBy: { column: "name", order: "desc" },
  })

  const stale = (existing ?? []).slice(KEEP).map((f) => f.name)
  if (stale.length) {
    await supabase.storage.from(BUCKET).remove(stale)
  }

  return NextResponse.json({
    success: true,
    filename,
    counts: {
      shops: shops.data?.length ?? 0,
      orders: orders.data?.length ?? 0,
      profiles: profiles.data?.length ?? 0,
    },
    pruned: stale,
  })
}
