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

export function getShopScore(shop: Shop) {
  const totalVouches = shop.methods.reduce((a, m) => a + m.vouches, 0)
  const totalFails = shop.methods.reduce((a, m) => a + m.fails, 0)
const validMethods = shop.methods.filter(m => m.avgDelay !== null)

const avgDelay =
  validMethods.length
    ? validMethods.reduce((a, m) => a + (m.avgDelay ?? 0), 0) /
      validMethods.length
    : 0
  const maxAmount = shop.methods.length
    ? Math.max(...shop.methods.map(m => m.maxAmount))
    : 0

  return (
    totalVouches * 2 -
    totalFails * 3 +
    maxAmount / 100 -
    avgDelay
  )
}