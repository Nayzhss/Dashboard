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
