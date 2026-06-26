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
  | "voyage"
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
  "voyage",
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
  voyage: { label: "Voyage", emoji: "✈️" },
  autre: { label: "Autre", emoji: "✨" },
}

/**
 * Lookup défensif : une catégorie venant de la DB qui ne correspond à
 * aucune clé connue (saisie manuelle dans Supabase, futur import Telegram
 * mal mappé...) retombe sur "Autre" plutôt que de faire planter l'UI.
 */
export function getCategoryConfig(category: string) {
  return SHOP_CATEGORY_CONFIG[category as ShopCategory] ?? SHOP_CATEGORY_CONFIG.autre
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
 * Rentabilité = (montant max × fiabilité) / délai, en prenant la meilleure
 * méthode de la boutique.
 *
 * La fiabilité est un taux de réussite lissé (vouches+1)/(vouches+fails+2) :
 * une méthode avec 1 vouch et 0 fail ne doit pas écraser une méthode avec
 * 50 vouches et 2 fails juste parce qu'elle n'a pas encore eu d'échec — le
 * lissage tire les petits échantillons vers 50% tant qu'ils ne sont pas
 * prouvés, ce qui reflète mieux le risque réel à retaper la boutique.
 */
export function getShopScore(shop: Shop) {
  const ratios = shop.methods
    .filter((m) => m.avgDelay !== null && m.avgDelay > 0)
    .map((m) => {
      const reliability = (m.vouches + 1) / (m.vouches + m.fails + 2)
      return (m.maxAmount * reliability) / (m.avgDelay as number)
    })

  return ratios.length ? Math.max(...ratios) : 0
}