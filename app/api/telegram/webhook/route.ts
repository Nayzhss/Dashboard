import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  parseShopMessage,
  parseRichShopMessage,
  upsertParsedShop,
  type ParsedShop,
} from "@/lib/telegramShopImport"
import { sendTelegramMessage } from "@/lib/telegram"

interface TelegramUpdate {
  message?: {
    text?: string
    caption?: string
    rich_message?: unknown
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

  if (!message) {
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id

  let shop: ParsedShop | null = null
  if (message.rich_message) {
    shop = parseRichShopMessage(message.rich_message)
  } else if (message.text ?? message.caption) {
    shop = parseShopMessage((message.text ?? message.caption ?? "").split(/\r?\n/))
  } else {
    // pas de contenu reconnaissable (photo seule, sticker, commande...) : on log pour debug, on ignore
    console.log("telegram webhook: no text/rich_message, full update:", JSON.stringify(body))
    return NextResponse.json({ ok: true })
  }

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
