"use client"

import { useCallback, useEffect, useState } from "react"
import type { Shop } from "../data/shops"

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const res = await fetch("/api/shops")
    const data: Shop[] = await res.json()
    setShops(data)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  function getShop(slug: string) {
    return shops.find((s) => s.slug === slug)
  }

  return { shops, loading, getShop, refresh }
}
