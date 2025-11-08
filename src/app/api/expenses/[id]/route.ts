import { NextResponse } from "next/server"
import { getServerSession, Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions)
    
const session = (await getServerSession(authOptions)) as Session | null
    console.log(session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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

    // Check if expense exists and belongs to user
    const expense = await db.collection("expenses").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    })

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    await db.collection("expenses").updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      {
        $set: {
          title,
          category,
          amount: parseFloat(amount),
          date: new Date(date),
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ message: "Expense updated successfully" })
  } catch (error) {
    console.error("Update expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    console.log(session)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDb()

    // Check if expense exists and belongs to user
    const expense = await db.collection("expenses").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    })

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    await db.collection("expenses").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    })

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

