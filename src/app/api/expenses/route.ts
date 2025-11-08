import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { Session } from "next-auth"

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const month = searchParams.get("month")

    const db = await getDb()
    let query: any = { userId: session.user.id }

    if (category && category !== "all") {
      query.category = category
    }

    if (month) {
      const [year, monthNum] = month.split("-")
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)
      query.date = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    const expenses = await db
      .collection("expenses")
      .find(query)
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, category, amount, date } = body

    if (!title || !category || !amount || !date) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    const validCategories = ["Food", "Transport", "Utilities", "Other"]
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.collection("expenses").insertOne({
      userId: session.user.id,
      title,
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Expense created successfully",
        expenseId: result.insertedId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

