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

export const SHOPS: Shop[] = [
  {
    slug: "pandora",
    name: "Pandora",

    website: "https://www.pandora.net",
    contactUrl: "https://help.pandora.net/fr/s/contactsupport",
    phone: "08 05 37 48 51",
    mail : "estore-fr@pandora.net",

    accountFresh: true,
    

    methods: [
      {
        name: "EB",
        vouches: 19,
        fails: 1,
        avgDelay: 2,
        maxAmount : 391
      },
      {
        name: "DNA",
        vouches: 4,
        fails: 0,
        avgDelay: 2,
        maxAmount : 200
      },
      {
        name: "EB PR",
        vouches: 3,
        fails: 0,
        avgDelay: null ,
        maxAmount : 169
      },
      {
        name: "RTS",
        vouches: 1,
        fails: 0,
        avgDelay: 7,
        maxAmount : 1050
      },
    ],

    notes: "",

    shipping: {
      delivery: ["DHL", "MR", "UPS"],
      return: ["DHL"],
    },
  },
]

export function getShop(slug: string) {
  return SHOPS.find((s) => s.slug === slug)
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
  const maxAmount = Math.max(...shop.methods.map(m => m.maxAmount))

  return (
    totalVouches * 2 -
    totalFails * 3 +
    maxAmount / 100 -
    avgDelay
  )
}