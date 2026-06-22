// One-off (re-runnable) categorization: assigns a domaine d'activité (see
// app/data/shops.ts > SHOP_CATEGORY_CONFIG) to every shop by slug. Safe to
// re-run after a Telegram re-import: shops not listed below are left
// untouched (they keep the 'autre' default from the schema).
//
// Usage:
//   npx tsx scripts/assign-shop-categories.ts [--dry-run]

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

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

loadEnvLocal()

const CATEGORY_BY_SLUG: Record<string, string> = {
  "abercrombie-fitch": "mode",
  bershka: "mode",
  bonsoirs: "mode",
  clarks: "mode",
  converse: "mode",
  cos: "mode",
  crocs: "mode",
  farfetch: "mode",
  "fear-of-god": "mode",
  "h-m": "mode",
  "k-way": "mode",
  lanvin: "mode",
  "levi-s": "mode",
  lounge: "mode",
  maje: "mode",
  mango: "mode",
  pyrenex: "mode",
  "ralph-lauren": "mode",
  "ray-ban": "mode",
  samsonite: "mode",
  sandro: "mode",
  "showroom-prive": "mode",
  snipes: "mode",
  solebox: "mode",
  spartoo: "mode",
  "sunglass-hut": "mode",
  "victoria-s-secret": "mode",
  vinted: "mode",
  zalando: "mode",
  zara: "mode",

  adidas: "sport",
  "alo-yoga": "sport",
  asics: "sport",
  decathlon: "sport",
  ekosport: "sport",
  fanatics: "sport",
  gymshark: "sport",
  intersport: "sport",
  lululemon: "sport",
  "new-balance": "sport",
  nike: "sport",
  oakley: "sport",
  "on-running": "sport",
  "psg-store": "sport",
  puma: "sport",

  byredo: "beaute",
  "cult-beauty": "beaute",
  ghd: "beaute",
  "my-origines": "beaute",
  "oral-b": "beaute",
  rituals: "beaute",
  sephora: "beaute",
  "ysl-beauty": "beaute",

  coach: "bijoux-luxe",
  "louis-vuitton": "bijoux-luxe",
  "marc-orian": "bijoux-luxe",
  pandora: "bijoux-luxe",
  swarovski: "bijoux-luxe",

  dreame: "maison-jardin",
  dyson: "maison-jardin",
  emma: "maison-jardin",
  home24: "maison-jardin",
  kitchenaid: "maison-jardin",
  "maisons-du-monde": "maison-jardin",
  "massimo-maison": "maison-jardin",
  mova: "maison-jardin",
  ninja: "maison-jardin",
  ooni: "maison-jardin",
  "secret-lab": "maison-jardin",
  smeg: "maison-jardin",
  tineco: "maison-jardin",

  "back-market": "tech",
  bose: "tech",
  cybertek: "tech",
  "google-store": "tech",
  logitech: "tech",
  meta: "tech",
  rhinoshield: "tech",
  "zaero-design": "tech",

  aliexpress: "marketplace",
  amazon: "marketplace",
  cdiscount: "marketplace",
  temu: "marketplace",
  tiktok: "marketplace",

  bulk: "nutrition",
  nutrimuscle: "nutrition",
  prozis: "nutrition",

  mcdo: "alimentation",
  nespresso: "alimentation",

  manomano: "bricolage-auto",
  oscaro: "bricolage-auto",

  arte: "autre",
  paypal: "autre",
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const [slug, category] of Object.entries(CATEGORY_BY_SLUG)) {
    if (dryRun) {
      console.log(`[dry-run] ${slug} -> ${category}`)
      continue
    }

    const { error } = await supabase.from("shops").update({ category }).eq("slug", slug)

    if (error) {
      console.error(`✗ ${slug}: ${error.message}`)
    } else {
      console.log(`✓ ${slug} -> ${category}`)
    }
  }
}

main()
