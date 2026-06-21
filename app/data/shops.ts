export interface MethodStats {
  name: string
  vouches: number
  fails: number
  avgDelay: number | null
  maxAmount: number
}



export interface Shop {
  slug: string
  name: string

  website: string
  contactUrl?: string
  phone?: string
  mail?: string

  accountFresh: boolean

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