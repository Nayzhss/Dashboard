import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/

export async function POST(req: NextRequest) {
  const { username } = await req.json()

  if (typeof username !== "string" || !USERNAME_RE.test(username)) {
    return NextResponse.json({ available: false, reason: "format" })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
