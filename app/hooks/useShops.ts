"use client"

import { useEffect, useState } from "react"
import type { Shop } from "../data/shops"

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/shops")
        const data: Shop[] = await res.json()
        setShops(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function getShop(slug: string) {
    return shops.find((s) => s.slug === slug)
  }

  return { shops, loading, getShop }
}
