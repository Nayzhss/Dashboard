// Enregistre (ou met à jour) le webhook Telegram une fois le bot créé.
// À relancer si l'URL de prod ou le secret changent.
//
// Usage:
//   npx tsx scripts/set-telegram-webhook.ts

import fs from "fs"
import path from "path"

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim()
    }
  }
}

async function main() {
  loadEnvLocal()

  const token = process.env.TELEGRAM_BOT_TOKEN
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  const baseUrl = process.env.SITE_URL ?? "https://dashboardrefund.vercel.app"

  if (!token || !secret) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET in .env.local")
    process.exit(1)
  }

  const webhookUrl = `${baseUrl}/api/telegram/webhook`

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message"],
    }),
  })

  const data = await res.json()
  console.log(data)

  if (data.ok) {
    console.log(`✓ Webhook enregistré sur ${webhookUrl}`)
  }
}

main()
