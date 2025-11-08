"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { ExpenseForm } from "@/components/expenses/expense-form"

export default function AddExpensePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return <Loading />
  }

  if (status === "unauthenticated") {
    return null
  }

  const handleSuccess = () => {
    router.push("/dashboard/manage")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Expense"
        description="Record a new expense"
      />
      <ExpenseForm onSubmitSuccess={handleSuccess} />
    </div>
  )
}
