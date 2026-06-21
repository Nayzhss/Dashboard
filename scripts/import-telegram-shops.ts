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
// from this source.

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

interface ParsedMethod {
  name: string
  vouches: number
  fails: number
  avgDelay: number | null
  maxAmount: number
}

interface ParsedShop {
  slug: string
  name: string
  website: string
  contactUrl?: string
  phone?: string
  accountFresh: boolean
  methods: ParsedMethod[]
}

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

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function stripTrailingEmoji(s: string) {
  return s
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+$/gu, "")
    .trim()
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

function parseBlock(lines: string[]): ParsedShop | null {
  const nameLine = lines[0] ?? ""
  const urlMatch = nameLine.match(/\((https?:\/\/[^)]+)\)/)
  const website = urlMatch?.[1] ?? ""
  const name = stripTrailingEmoji(nameLine.replace(/\(https?:\/\/[^)]*\)/, "")).trim()

  if (!name) return null

  const contactLine = lines.find((l) => l.startsWith("📧"))
  const contactUrl = contactLine?.match(/\((https?:\/\/[^)]+)\)/)?.[1]

  const phoneLine = lines.find((l) => l.startsWith("🎙"))
  const phoneRaw = phoneLine?.split(":")[1]?.trim()
  const phone = phoneRaw && phoneRaw !== "—" ? phoneRaw : undefined

  const accountLine = lines.find((l) => l.startsWith("Type de compte"))
  const accountFresh = /fresh/i.test(accountLine?.split(":")[1] ?? "")

  const tableHeaderIdx = lines.findIndex((l) => l.startsWith("Méthode |"))
  const methods: ParsedMethod[] = []

  if (tableHeaderIdx !== -1) {
    for (let i = tableHeaderIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.includes("|")) break

      const cells = line.split("|").map((c) => c.trim())
      if (cells.length < 6) break

      const [methodName, , vouchesStr, failsStr, maxStr, delayStr] = cells
      const maxAmount = Number(maxStr.replace(/[^\d.]/g, "")) || 0
      const delayMatch = delayStr.match(/\d+/)

      methods.push({
        name: methodName,
        vouches: Number(vouchesStr) || 0,
        fails: Number(failsStr) || 0,
        avgDelay: delayMatch ? Number(delayMatch[0]) : null,
        maxAmount,
      })
    }
  }

  return {
    slug: slugify(name),
    name,
    website,
    contactUrl,
    phone,
    accountFresh,
    methods,
  }
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
    .map(parseBlock)
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
    const { data: shopRow, error: shopError } = await supabase
      .from("shops")
      .upsert(
        {
          slug: shop.slug,
          name: shop.name,
          website: shop.website,
          contact_url: shop.contactUrl ?? null,
          phone: shop.phone ?? null,
          account_fresh: shop.accountFresh,
          shipping_delivery: [],
          shipping_return: [],
        },
        { onConflict: "slug" }
      )
      .select()
      .single()

    if (shopError || !shopRow) {
      console.error(`✗ ${shop.name}: ${shopError?.message}`)
      continue
    }

    await supabase.from("shop_methods").delete().eq("shop_id", shopRow.id)

    if (shop.methods.length) {
      const { error: methodsError } = await supabase
        .from("shop_methods")
        .insert(
          shop.methods.map((m) => ({
            shop_id: shopRow.id,
            name: m.name,
            vouches: m.vouches,
            fails: m.fails,
            avg_delay: m.avgDelay,
            max_amount: m.maxAmount,
          }))
        )

      if (methodsError) {
        console.error(`✗ ${shop.name} methods: ${methodsError.message}`)
        continue
      }
    }

    console.log(`✓ ${shop.name} (${shop.methods.length} methods)`)
  }
}

main()
