"use client"

import { useState, useEffect } from "react"
import { Expense } from "./expense-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

interface EditExpenseDialogProps {
  expense: Expense | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (expense: Expense, data: {
    title: string
    category: string
    amount: number
    date: string
  }) => Promise<void>
}

export function EditExpenseDialog({
  expense,
  isOpen,
  onClose,
  onUpdate,
}: EditExpenseDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Food")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Update form when expense changes
  useEffect(() => {
    if (expense) {
      setTitle(expense.title)
      setCategory(expense.category)
      setAmount(expense.amount.toString())
      setDate(new Date(expense.date).toISOString().split("T")[0])
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expense) return

    setIsLoading(true)
    try {
      await onUpdate(expense, {
        title,
        category,
        amount: parseFloat(amount),
        date,
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!expense) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>Update the details of your expense</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

