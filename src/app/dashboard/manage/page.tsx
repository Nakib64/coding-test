"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { ExpenseFilters } from "@/components/expenses/expense-filters"
import { ExpenseSummary } from "@/components/expenses/expense-summary"
import { ExpenseTable, Expense } from "@/components/expenses/expense-table"
import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog"
import { ExpenseChart } from "@/components/expense-chart"
import { useToast } from "@/components/ui/toaster"
import { BudgetTracker } from "@/components/expenses/budgetTracker"

export default function ManageExpensePage() {
  const { status } = useSession()
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }
      if (monthFilter) {
        params.append("month", monthFilter)
      }

      const response = await fetch(`/api/expenses?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch expenses")
      }

      const data = await response.json()
      setExpenses(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchExpenses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, categoryFilter, monthFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete expense")
      }

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })

      fetchExpenses()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (expense: Expense, data: {
    title: string
    category: string
    amount: number
    date: string
  }) => {
    const response = await fetch(`/api/expenses/${expense._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update expense")
    }

    toast({
      title: "Success",
      description: "Expense updated successfully",
    })

    fetchExpenses()
  }

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category)
  }

  const handleMonthFilterChange = (month: string) => {
    setMonthFilter(month)
  }

  if (status === "loading") {
    return <Loading />
  }

  if (status === "unauthenticated") {
    return null
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Expenses"
        description="View and manage your expenses"
      />

      <ExpenseFilters
        categoryFilter={categoryFilter}
        monthFilter={monthFilter}
        onCategoryChange={handleCategoryFilterChange}
        onMonthChange={handleMonthFilterChange}
      />
      <BudgetTracker month={monthFilter || (() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      })()} />

      <ExpenseChart expenses={expenses} />

      <ExpenseSummary
        totalAmount={totalAmount}
        expenseCount={expenses.length}
      />

      <ExpenseTable
        expenses={expenses}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditExpenseDialog
        expense={editingExpense}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
