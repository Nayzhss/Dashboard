import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const { username } = await req.json()

  if (typeof username !== "string" || !username) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("username", username.toLowerCase())
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
  }

  return NextResponse.json({ email: data.email })
}
