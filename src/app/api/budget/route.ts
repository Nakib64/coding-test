import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { Session } from "next-auth"

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const budgetDoc = await db.collection("budgets").findOne({
      userId: session.user.id,
    })

    return NextResponse.json({ budget: budgetDoc?.amount ?? 0 })
  } catch (error) {
    console.error("Get budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection("budgets").updateOne(
      { userId: session.user.id },
      { $set: { amount, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({ message: "Budget saved successfully" })
  } catch (error) {
    console.error("Save budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
