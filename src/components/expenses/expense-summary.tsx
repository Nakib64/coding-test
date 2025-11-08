"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseSummaryProps {
  totalAmount: number
  expenseCount: number
}

export function ExpenseSummary({ totalAmount, expenseCount }: ExpenseSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          Total: ${totalAmount.toFixed(2)}
        </div>
        <p className="text-sm text-muted-foreground">
          {expenseCount} expense(s) found
        </p>
      </CardContent>
    </Card>
  )
}

