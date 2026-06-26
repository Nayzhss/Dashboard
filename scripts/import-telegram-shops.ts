// One-off import: parses a Telegram "copy as text" export of the shops
// channel and upserts shops + shop_methods into Supabase via the
// service_role key (bypasses RLS, which only allows reads on these tables).
//
// Usage:
//   npx tsx scripts/import-telegram-shops.ts <path-to-txt> [--dry-run]
//
// Shipping (Transporteur/Livraison/Retour) is intentionally skipped: the
// custom Telegram emoji used for carriers collapse to generic fallback
// characters once copied as text, so the carrier identity isn't recoverable
// from this source. The real-time webhook (app/api/telegram/webhook) doesn't
// have this limitation since it reads messages via the Bot API instead.

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { parseShopMessage, upsertParsedShop, type ParsedShop } from "../lib/telegramShopImport"

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

const HEADER_RE = /^\[\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\] [^:]+:\s*/

function splitBlocks(raw: string): string[][] {
  const blocks: string[][] = []
  let current: string[] | null = null

  for (const line of raw.split(/\r?\n/)) {
    if (HEADER_RE.test(line)) {
      if (current) blocks.push(current)
      current = [line.replace(HEADER_RE, "")]
    } else if (current) {
      current.push(line)
    }
  }
  if (current) blocks.push(current)

  return blocks
}

async function main() {
  const filePath = process.argv[2]
  const dryRun = process.argv.includes("--dry-run")

  if (!filePath) {
    console.error("Usage: npx tsx scripts/import-telegram-shops.ts <path-to-txt> [--dry-run]")
    process.exit(1)
  }

  loadEnvLocal()

  const raw = fs.readFileSync(filePath, "utf-8")
  const shops = splitBlocks(raw)
    .map(parseShopMessage)
    .filter((s): s is ParsedShop => s !== null)

  console.log(`Parsed ${shops.length} shops.`)

  if (dryRun) {
    console.log(JSON.stringify(shops, null, 2))
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  for (const shop of shops) {
    const result = await upsertParsedShop(supabase, shop)

    if (!result.ok) {
      console.error(`✗ ${shop.name}: ${result.error}`)
      continue
    }

    console.log(`✓ ${shop.name} (${result.methodsCount} methods)`)
  }
}

main()
