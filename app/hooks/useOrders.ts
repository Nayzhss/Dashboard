"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type {
  Order,
  Filters,
  SortField,
  SortDir,
  OrderFormData,
} from "../components/orders/types"

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    shop: "",
    carrier: "",
    dateFrom: "",
    dateTo: "",
  })

  const [sortField, setSortField] =
    useState<SortField>("paymentDate")

  const [sortDir, setSortDir] =
    useState<SortDir>("desc")

  // ─────────────────────────────────────────────
  // Load
  // ─────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders")
        const data: Order[] = await res.json()

        setOrders(
          data.map((o) => ({
            ...o,
            returnStatus:
              o.returnStatus ?? "waiting",
          }))
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ─────────────────────────────────────────────
  // Delay helper
  // ─────────────────────────────────────────────

  function getDelay(order: Order) {
    if (
      order.status === "Remboursée" ||
      order.status === "Fail"
    ) {
      return order.frozenDelay ?? 0
    }

    if (!order.paymentDate) return 0

    return Math.max(
      0,
      Math.floor(
        (Date.now() -
          new Date(order.paymentDate).getTime()) /
          86400000
      )
    )
  }

  // ─────────────────────────────────────────────
  // Create
  // ─────────────────────────────────────────────

  const createOrder = useCallback(
    async (
      form: OrderFormData
    ): Promise<Order> => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (!res.ok)
        throw new Error("Erreur création")

      const newOrder: Order =
        await res.json()

      setOrders((prev) => [
        newOrder,
        ...prev,
      ])

      return newOrder
    },
    []
  )

  // ─────────────────────────────────────────────
  // Update
  // ─────────────────────────────────────────────

  const updateOrder = useCallback(
    async (
      id: string,
      data: Partial<Order>
    ): Promise<void> => {
      const current = orders.find(
        (o) => o.id === id
      )

      const payload: Partial<Order> = {
        ...data,
      }

      // Gèle le délai quand la commande
      // passe en remboursée ou fail
      if (
        current &&
        data.status &&
        (
          data.status === "Remboursée" ||
          data.status === "Fail"
        ) &&
        current.status !== data.status
      ) {
        payload.frozenDelay =
          getDelay(current)
      }

      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id,
          ...payload,
        }),
      })

      if (!res.ok)
        throw new Error(
          "Erreur modification"
        )

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                ...payload,
              }
            : o
        )
      )
    },
    [orders]
  )

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────

  const deleteOrder = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!res.ok)
        throw new Error(
          "Erreur suppression"
        )

      setOrders((prev) =>
        prev.filter((o) => o.id !== id)
      )
    },
    []
  )

  // ─────────────────────────────────────────────
  // Duplicate
  // ─────────────────────────────────────────────

  const duplicateOrder = useCallback(async (order: Order): Promise<Order> => {
  const { id, ...rest } = order

  return createOrder({
    ...rest,
    tech: order.tech ?? "",
    note: order.note ?? "",
  } as any)
}, [createOrder])

  // ─────────────────────────────────────────────
  // Sort toggle
  // ─────────────────────────────────────────────

  const toggleSort = useCallback(
    (field: SortField) => {
      setSortField((prev) => {
        if (prev === field) {
          setSortDir((d) =>
            d === "asc"
              ? "desc"
              : "asc"
          )

          return field
        }

        setSortDir("desc")
        return field
      })
    },
    []
  )

  // ─────────────────────────────────────────────
  // Filters
  // ─────────────────────────────────────────────

  const uniqueShops = useMemo(
    () =>
      [
        ...new Set(
          orders
            .map((o) => o.shopSlug)
            .filter(Boolean)
        ),
      ].sort(),
    [orders]
  )

  const uniqueCarriers = useMemo(
    () =>
      [
        ...new Set(
          orders
            .map((o) => o.carrier)
            .filter(Boolean)
        ),
      ].sort(),
    [orders]
  )

  const filteredOrders = useMemo(() => {
    const q =
      filters.search.toLowerCase()

    return orders
      .filter((o) => {
        if (
          q &&
          !o.shopSlug
            .toLowerCase()
            .includes(q) &&
          !o.orderNumber
            .toLowerCase()
            .includes(q) &&
          !o.carrier
            .toLowerCase()
            .includes(q) &&
          !o.trackingNumber
            .toLowerCase()
            .includes(q)
        ) {
          return false
        }

        if (
          filters.status &&
          o.status !== filters.status
        )
          return false

        if (
          filters.shop &&
          o.shopSlug !== filters.shop
        )
          return false

        if (
          filters.carrier &&
          o.carrier !== filters.carrier
        )
          return false

        if (
          filters.dateFrom &&
          o.paymentDate <
            filters.dateFrom
        )
          return false

        if (
          filters.dateTo &&
          o.paymentDate >
            filters.dateTo
        )
          return false

        return true
      })
      .sort((a, b) => {
        let cmp = 0

        if (
          sortField ===
          "paymentDate"
        ) {
          cmp =
            new Date(
              a.paymentDate || 0
            ).getTime() -
            new Date(
              b.paymentDate || 0
            ).getTime()
        } else if (
          sortField === "amount"
        ) {
          cmp =
            Number(a.amount) -
            Number(b.amount)
        } else if (
          sortField === "shop"
        ) {
          cmp =
            a.shopSlug.localeCompare(
              b.shopSlug
            )
        }

        return sortDir === "asc"
          ? cmp
          : -cmp
      })
  }, [
    orders,
    filters,
    sortField,
    sortDir,
  ])

  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = orders.length

    const totalAmount =
      orders.reduce(
        (s, o) =>
          s + Number(o.amount),
        0
      )

    const avgAmount = total
      ? totalAmount / total
      : 0

    const pending =
      orders.filter(
        (o) =>
          o.status ===
          "En attente"
      ).length

    const refunded =
      orders.filter(
        (o) =>
          o.status ===
          "Remboursée"
      ).length

    const failed =
      orders.filter(
        (o) =>
          o.status === "Fail"
      ).length

    return {
      total,
      totalAmount,
      avgAmount,
      pending,
      refunded,
      failed,
    }
  }, [orders])

  return {
    orders,
    filteredOrders,
    loading,

    filters,
    setFilters,

    sortField,
    sortDir,
    toggleSort,

    uniqueShops,
    uniqueCarriers,

    stats,

    createOrder,
    updateOrder,
    deleteOrder,
    duplicateOrder,

    getDelay,
  }
}