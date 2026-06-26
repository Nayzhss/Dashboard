"use client"

import { useRef, useState } from "react"
import { useOrders } from "@/app/hooks/useOrders"
import { useToast } from "@/app/hooks/useToast"
import { StatsBar } from "@/app/components/orders/StatsBar"
import { Toolbar } from "@/app/components/orders/Toolbar"
import { OrdersTable } from "@/app/components/orders/OrdersTable"
import { OrderModal } from "@/app/components/orders/OrderModal"
import { ToastContainer } from "@/app/components/orders/Toast"
import { Header } from "@/app/components/Header"
import { Footer } from "@/app/components/Footer"
import { BackgroundOrbs } from "@/app/components/BackgroundOrbs"
import type { Order, OrderFormData, Status } from "@/app/components/orders/types"

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; order: Order }

export default function DashboardPage() {
  const {
    filteredOrders,
    orders,
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
  } = useOrders()

  const { toasts, addToast, removeToast } = useToast()
  const [modal, setModal] = useState<ModalState>({ type: "none" })
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set())
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleCreate(data: OrderFormData) {
    try {
      await createOrder(data)
      addToast("Commande créée", "success")
    } catch {
      addToast("Erreur lors de la création", "error")
      throw new Error()
    }
  }

  async function handleEdit(data: OrderFormData) {
    if (modal.type !== "edit") return
    try {
      await updateOrder(modal.order.id, data)
      addToast("Commande mise à jour", "success")
    } catch {
      addToast("Erreur lors de la mise à jour", "error")
      throw new Error()
    }
  }

  function handleDeleteClick(order: Order) {
    setPendingDeleteIds((prev) => new Set(prev).add(order.id))

    const timer = setTimeout(async () => {
      deleteTimers.current.delete(order.id)
      try {
        await deleteOrder(order.id)
      } catch {
        addToast("Erreur lors de la suppression", "error")
      } finally {
        setPendingDeleteIds((prev) => {
          const next = new Set(prev)
          next.delete(order.id)
          return next
        })
      }
    }, 5000)

    deleteTimers.current.set(order.id, timer)

    addToast(`"${order.shopSlug}" supprimée`, "success", {
      duration: 5000,
      action: {
        label: "Annuler",
        onClick: () => {
          clearTimeout(deleteTimers.current.get(order.id))
          deleteTimers.current.delete(order.id)
          setPendingDeleteIds((prev) => {
            const next = new Set(prev)
            next.delete(order.id)
            return next
          })
        },
      },
    })
  }

  async function handleDuplicate(order: Order) {
    try {
      await duplicateOrder(order)
      addToast(`"${order.shopSlug}" dupliquée`, "success")
    } catch {
      addToast("Erreur lors de la duplication", "error")
    }
  }

  async function handleStatusChange(id: string, status: Status) {
    try {
      await updateOrder(id, {
        status,
        ...(status === "Livrée"
          ? { deliveredAt: new Date().toISOString(), returnStatus: "waiting" }
          : {}),
      })
      addToast("Statut mis à jour", "success")
    } catch {
      addToast("Erreur lors du changement de statut", "error")
    }
  }

  async function handleMarkReturn(
    id: string,
    returnCarrier: string,
    returnTrackingNumber: string
  ) {
    try {
      await updateOrder(id, {
        status: "Retour",
        returnCarrier,
        returnTrackingNumber,
        returnShippedAt: new Date().toISOString().slice(0, 10),
      })
      addToast("Retour enregistré", "success")
    } catch {
      addToast("Erreur lors de l'enregistrement du retour", "error")
      throw new Error()
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="relative overflow-hidden min-h-screen bg-[var(--bg)] text-[var(--color-white)]">
      <BackgroundOrbs />

      <div className="relative z-10">
      <Header />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="animate-fade-up mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-white)] tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-5)] mt-1">
              Suivi et gestion des remboursements
            </p>
          </div>
          <span className="text-xs text-[var(--text-6)]">
            {orders.length} commande{orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} loading={loading} />

        {/* Toolbar */}
        <Toolbar
          filters={filters}
          setFilters={setFilters}
          sortField={sortField}
          sortDir={sortDir}
          toggleSort={toggleSort}
          uniqueShops={uniqueShops}
          uniqueCarriers={uniqueCarriers}
          totalVisible={filteredOrders.length}
          totalAll={orders.length}
          onNew={() => setModal({ type: "create" })}
        />

        {/* Table */}
        <OrdersTable
          orders={filteredOrders.filter((o) => !pendingDeleteIds.has(o.id))}
          totalCount={orders.length}
          loading={loading}
          onEdit={(order) => setModal({ type: "edit", order })}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicate}
          onStatusChange={handleStatusChange}
          onMarkReturn={handleMarkReturn}
          onNew={() => setModal({ type: "create" })}
        />
      </div>

      <Footer />
      </div>

      {/* Modals */}
      {modal.type === "create" && (
        <OrderModal
          mode="create"
          onSave={handleCreate}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {modal.type === "edit" && (
        <OrderModal
          mode="edit"
          order={modal.order}
          onSave={handleEdit}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  )
}
