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

    const url = new URL(request.url)
    const month = url.searchParams.get("month") // expects format "YYYY-MM"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Invalid or missing month" }, { status: 400 })
    }

    const [yearStr, monthStr] = month.split("-")
    const year = parseInt(yearStr)
    const monthNum = parseInt(monthStr) - 1 // JS Date months 0-based

    const startDate = new Date(year, monthNum, 1)
    const endDate = new Date(year, monthNum + 1, 0, 23, 59, 59, 999) // end of month

    const db = await getDb()

    // Aggregate sum of amounts by filtering by user and date range
    const result = await db.collection("expenses").aggregate([
      {
        $match: {
          userId: session.user.id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).toArray()

    const total = result[0]?.total ?? 0

    return NextResponse.json({ total })
  } catch (error) {
    console.error("Error fetching total spending:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
