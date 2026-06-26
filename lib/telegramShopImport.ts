// Logique de parsing + upsert partagée entre l'import manuel
// (scripts/import-telegram-shops.ts) et le webhook temps réel
// (app/api/telegram/webhook/route.ts) — un message = une boutique.

import type { SupabaseClient } from "@supabase/supabase-js"
import { slugify } from "./slugify"

export interface ParsedMethod {
  name: string
  vouches: number
  fails: number
  avgDelay: number | null
  maxAmount: number
}

export interface ParsedShop {
  slug: string
  name: string
  website: string
  contactUrl?: string
  phone?: string
  accountFresh: boolean
  methods: ParsedMethod[]
}

function stripTrailingEmoji(s: string) {
  return s
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+$/gu, "")
    .trim()
}

/**
 * Parse les lignes d'un seul message (une boutique). Retourne null si
 * aucun nom de boutique n'a pu être extrait de la première ligne.
 */
export function parseShopMessage(lines: string[]): ParsedShop | null {
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

// ─────────────────────────────────────────────
// Format "rich_message" (bots qui postent des messages structurés au lieu
// de texte brut — observé sur le bot relais : blocks de type heading,
// paragraph, table, divider, chacun avec du texte enrichi : bold/url/
// custom_emoji).
// ─────────────────────────────────────────────

type RichNode =
  | string
  | {
      type?: string
      text?: RichNode | RichNode[]
      url?: string
      alternative_text?: string
    }

function flattenRich(node: RichNode | RichNode[] | undefined): string {
  if (node == null) return ""
  if (Array.isArray(node)) return node.map(flattenRich).join("")
  if (typeof node === "string") return node
  if (node.type === "custom_emoji") return node.alternative_text ?? ""
  if (node.text !== undefined) return flattenRich(node.text)
  return ""
}

function findRichUrl(node: RichNode | RichNode[] | undefined): string | undefined {
  if (node == null) return undefined
  if (Array.isArray(node)) {
    for (const n of node) {
      const found = findRichUrl(n)
      if (found) return found
    }
    return undefined
  }
  if (typeof node === "string") return undefined
  if (node.type === "url" && node.url) return node.url
  return findRichUrl(node.text)
}

interface RichBlock {
  type: string
  text?: RichNode | RichNode[]
  cells?: { text?: RichNode; is_header?: boolean }[][]
}

function extractContactAndPhone(paragraphs: RichBlock[]) {
  let contactUrl: string | undefined
  let phone: string | undefined

  for (const p of paragraphs) {
    const items = Array.isArray(p.text) ? p.text : p.text ? [p.text] : []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const alt = typeof item === "object" && item?.type === "custom_emoji" ? item.alternative_text : undefined

      if (alt === "📧" && !contactUrl) {
        for (let j = i + 1; j < items.length; j++) {
          if (typeof items[j] === "string" && (items[j] as string).includes("\n")) break
          const url = findRichUrl(items[j])
          if (url) {
            contactUrl = url
            break
          }
        }
      }

      if (alt === "🎙" && !phone) {
        for (let j = i + 1; j < items.length; j++) {
          if (typeof items[j] === "string" && (items[j] as string).includes("\n")) break
          const text = flattenRich(items[j])
          if (text.includes("Téléphone")) {
            const raw = text.split(":")[1]?.trim()
            phone = raw && raw !== "—" ? raw : undefined
            break
          }
        }
      }
    }
  }

  return { contactUrl, phone }
}

function parseRichTable(table: RichBlock | undefined): ParsedMethod[] {
  const rows = table?.cells
  if (!rows || rows.length < 2) return []

  const headerLabels = rows[0].map((c) => flattenRich(c.text).trim())
  const colIndex = (label: string) => headerLabels.indexOf(label)
  const iName = colIndex("Méthode")
  const iOk = colIndex("✓")
  const iFail = colIndex("✗")
  const iMax = colIndex("Max")
  const iDelay = colIndex("Délai")

  const methods: ParsedMethod[] = []

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const cell = (i: number) => (i >= 0 && row[i] ? flattenRich(row[i].text).trim() : "")
    const name = cell(iName)
    if (!name) continue

    const delayMatch = cell(iDelay).match(/\d+/)

    methods.push({
      name,
      vouches: Number(cell(iOk)) || 0,
      fails: Number(cell(iFail)) || 0,
      avgDelay: delayMatch ? Number(delayMatch[0]) : null,
      maxAmount: Number(cell(iMax).replace(/[^\d.]/g, "")) || 0,
    })
  }

  return methods
}

/**
 * Parse le champ "rich_message" d'un message bot structuré (au lieu du
 * texte brut). Retourne null si aucun titre de boutique n'a pu être extrait.
 */
export function parseRichShopMessage(rich: unknown): ParsedShop | null {
  const blocks = (rich as { blocks?: RichBlock[] } | undefined)?.blocks
  if (!Array.isArray(blocks)) return null

  const heading = blocks.find((b) => b.type === "heading")
  if (!heading) return null

  const name = stripTrailingEmoji(flattenRich(heading.text)).trim()
  if (!name) return null

  const website = findRichUrl(heading.text) ?? ""

  const paragraphs = blocks.filter((b) => b.type === "paragraph")
  const { contactUrl, phone } = extractContactAndPhone(paragraphs)

  const accountLine = paragraphs
    .map((p) => flattenRich(p.text))
    .find((l) => l.includes("Type de compte"))
  const accountFresh = /fresh/i.test(accountLine?.split(":")[1] ?? "")

  const methods = parseRichTable(blocks.find((b) => b.type === "table"))

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

export async function upsertParsedShop(
  supabase: SupabaseClient,
  shop: ParsedShop
): Promise<{ ok: true; methodsCount: number } | { ok: false; error: string }> {
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
    return { ok: false, error: shopError?.message ?? "upsert failed" }
  }

  await supabase.from("shop_methods").delete().eq("shop_id", shopRow.id)

  if (shop.methods.length) {
    const { error: methodsError } = await supabase.from("shop_methods").insert(
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
      return { ok: false, error: methodsError.message }
    }
  }

  return { ok: true, methodsCount: shop.methods.length }
}
