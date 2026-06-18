import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "data", "orders.json")

function readOrders(): any[] {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw)
}

function writeOrders(orders: any[]): void {
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2))
}

export async function GET() {
  const orders = readOrders()
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const orders = readOrders()

  const newOrder = {
    id: Date.now().toString(),
    returnStatus: "waiting",
    ...body,
  }

  orders.unshift(newOrder) // newest first
  writeOrders(orders)

  return NextResponse.json(newOrder, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const orders = readOrders()
  const idx = orders.findIndex((o: any) => o.id === id)

  if (idx === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  orders[idx] = { ...orders[idx], ...updates }
  writeOrders(orders)

  return NextResponse.json(orders[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const orders = readOrders()
  const updated = orders.filter((o: any) => o.id !== id)

  if (updated.length === orders.length) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  writeOrders(updated)
  return NextResponse.json({ success: true })
}
