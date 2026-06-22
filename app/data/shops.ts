export interface MethodStats {
  name: string
  vouches: number
  fails: number
  avgDelay: number | null
  maxAmount: number
}

export type ShopCategory =
  | "mode"
  | "sport"
  | "beaute"
  | "bijoux-luxe"
  | "maison-jardin"
  | "tech"
  | "marketplace"
  | "nutrition"
  | "alimentation"
  | "bricolage-auto"
  | "autre"

export const SHOP_CATEGORY_LIST: ShopCategory[] = [
  "mode",
  "sport",
  "beaute",
  "bijoux-luxe",
  "maison-jardin",
  "tech",
  "marketplace",
  "nutrition",
  "alimentation",
  "bricolage-auto",
  "autre",
]

export const SHOP_CATEGORY_CONFIG: Record<ShopCategory, { label: string; emoji: string }> = {
  mode: { label: "Mode", emoji: "👗" },
  sport: { label: "Sport", emoji: "🏃" },
  beaute: { label: "Beauté", emoji: "💄" },
  "bijoux-luxe": { label: "Bijoux & Luxe", emoji: "💎" },
  "maison-jardin": { label: "Maison & Jardin", emoji: "🏠" },
  tech: { label: "Tech & Électronique", emoji: "💻" },
  marketplace: { label: "Marketplace", emoji: "🛒" },
  nutrition: { label: "Nutrition", emoji: "🥤" },
  alimentation: { label: "Alimentation", emoji: "🍔" },
  "bricolage-auto": { label: "Bricolage & Auto", emoji: "🔧" },
  autre: { label: "Autre", emoji: "✨" },
}

export interface Shop {
  slug: string
  name: string

  website: string
  contactUrl?: string
  phone?: string
  mail?: string

  accountFresh: boolean
  category: ShopCategory

  methods: MethodStats[]

  notes?: string

  shipping: {
    delivery: string[]
    return: string[]
  }


}

/**
 * Rentabilité = montant max / délai, en prenant la meilleure méthode de la boutique.
 */
export function getShopScore(shop: Shop) {
  const ratios = shop.methods
    .filter((m) => m.avgDelay !== null && m.avgDelay > 0)
    .map((m) => m.maxAmount / (m.avgDelay as number))

  return ratios.length ? Math.max(...ratios) : 0
}