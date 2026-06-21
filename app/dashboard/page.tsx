"use client"

import { useState } from "react"
import { useOrders } from "@/app/hooks/useOrders"
import { useToast } from "@/app/hooks/useToast"
import { StatsBar } from "@/app/components/orders/StatsBar"
import { Toolbar } from "@/app/components/orders/Toolbar"
import { OrdersTable } from "@/app/components/orders/OrdersTable"
import { OrderModal } from "@/app/components/orders/OrderModal"
import { DeleteConfirm } from "@/app/components/orders/DeleteConfirm"
import { ToastContainer } from "@/app/components/orders/Toast"
import { Header } from "@/app/components/Header"
import { Footer } from "@/app/components/Footer"
import type { Order, OrderFormData, Status } from "@/app/components/orders/types"

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; order: Order }
  | { type: "delete"; order: Order }

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

  async function handleDelete() {
    if (modal.type !== "delete") return
    try {
      await deleteOrder(modal.order.id)
      addToast("Commande supprimée", "success")
      setModal({ type: "none" })
    } catch {
      addToast("Erreur lors de la suppression", "error")
      throw new Error()
    }
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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--color-white)]">
      <Header />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8 flex items-end justify-between">
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
          orders={filteredOrders}
          loading={loading}
          onEdit={(order) => setModal({ type: "edit", order })}
          onDelete={(order) => setModal({ type: "delete", order })}
          onDuplicate={handleDuplicate}
          onStatusChange={handleStatusChange}
        />
      </div>

      <Footer />

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

      {modal.type === "delete" && (
        <DeleteConfirm
          shopName={modal.order.shopSlug}
          onConfirm={handleDelete}
          onCancel={() => setModal({ type: "none" })}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  )
}
