"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ExpenseFiltersProps {
  categoryFilter: string
  monthFilter: string
  onCategoryChange: (category: string) => void
  onMonthChange: (month: string) => void
}

export function ExpenseFilters({
  categoryFilter,
  monthFilter,
  onCategoryChange,
  onMonthChange,
}: ExpenseFiltersProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month-filter">Month</Label>
            <Input
              id="month-filter"
              type="month"
              value={monthFilter || currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

