import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { parseShopMessage, upsertParsedShop } from "@/lib/telegramShopImport"
import { sendTelegramMessage } from "@/lib/telegram"

interface TelegramUpdate {
  message?: {
    text?: string
    caption?: string
    chat: { id: number }
  }
}

function authorized(req: NextRequest) {
  const header = req.headers.get("x-telegram-bot-api-secret-token")
  return header === process.env.TELEGRAM_WEBHOOK_SECRET
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const update: TelegramUpdate = body
  const message = update.message
  const text = message?.text ?? message?.caption

  // pas un message texte (photo seule, sticker, commande...) : on log pour debug, on ignore
  if (!message || !text) {
    console.log("telegram webhook: no text, update keys:", Object.keys(body), JSON.stringify(body).slice(0, 500))
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id
  const shop = parseShopMessage(text.split(/\r?\n/))

  if (!shop || !shop.name) {
    await sendTelegramMessage(chatId, "⚠️ Message non reconnu, boutique ignorée.")
    return NextResponse.json({ ok: true })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const result = await upsertParsedShop(supabase, shop)

  if (!result.ok) {
    await sendTelegramMessage(chatId, `⚠️ ${shop.name} : erreur d'enregistrement (${result.error})`)
    return NextResponse.json({ ok: true })
  }

  await sendTelegramMessage(
    chatId,
    `✅ ${shop.name} importée (${result.methodsCount} méthode${result.methodsCount !== 1 ? "s" : ""})`
  )

  return NextResponse.json({ ok: true })
}
