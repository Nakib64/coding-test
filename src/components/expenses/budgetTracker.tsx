"use client"

import { useEffect, useState } from "react"

interface BudgetTrackerProps {
    month: string // format "YYYY-MM"
}

export function BudgetTracker({ month }: BudgetTrackerProps) {
    // State for budget value
    const [budget, setBudget] = useState<number>(0)
    // State for total spent amount for the selected month
    const [totalSpent, setTotalSpent] = useState<number>(0)
    // Loading states
    const [loadingBudget, setLoadingBudget] = useState(false)
    const [loadingSpent, setLoadingSpent] = useState(false)
    // State for when saving budget
    const [savingBudget, setSavingBudget] = useState(false)
    // Error message state
    const [error, setError] = useState<string | null>(null)
    // Controlled input value for budget form
    const [inputBudget, setInputBudget] = useState<string>("")

    // Fetch the current budget from API on mount
    useEffect(() => {
        setLoadingBudget(true)
        fetch("/api/budget")
            .then((res) => res.json())
            .then((data) => {
                if (typeof data.budget === "number") {
                    setBudget(data.budget)
                    setInputBudget(data.budget.toString())
                } else {
                    setBudget(0)
                    setInputBudget("")
                }
            })
            .catch(() => setError("Failed to load budget"))
            .finally(() => setLoadingBudget(false))
    }, [])

    // Fetch total spending for the selected month whenever `month` changes
    useEffect(() => {
        if (!month) return

        setLoadingSpent(true)
        fetch(`/api/expenses/total?month=${month}`)
            .then((res) => res.json())
            .then((data) => {
                if (typeof data.total === "number") setTotalSpent(data.total)
                else setTotalSpent(0)
            })
            .catch(() => setError("Failed to load total spending"))
            .finally(() => setLoadingSpent(false))
    }, [month])

    // Save budget to backend API
    const saveBudget = async (value: number) => {
        setSavingBudget(true)
        setError(null)

        try {
            const res = await fetch("/api/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: value }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to save budget")
            } else {
                setBudget(value)
            }
        } catch {
            setError("Failed to save budget")
        } finally {
            setSavingBudget(false)
        }
    }

    // Handle input change for controlled form input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputBudget(e.target.value)
    }

    // Handle form submit to save budget
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const value = parseFloat(inputBudget)
        if (isNaN(value) || value < 0) {
            setError("Please enter a valid non-negative budget")
            return
        }
        saveBudget(value)
    }

    // Calculate progress for budget usage
    const progress = budget > 0 ? Math.min(totalSpent / budget, 1) : 0
    const isOverBudget = budget > 0 && totalSpent > budget

    return (
        <section className="p-4 border rounded-md w-full  mx-auto space-y-6">
  {error && <p className="text-red-600">{error}</p>}

  <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-4 md:space-x-6 space-y-4 md:space-y-0">
    {/* Budget input form */}
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center justify-center w-full sm:space-x-4 space-y-3 sm:space-y-0"
    >
      <label className="flex flex-col sm:flex-row items-center w-fit space-y-1 sm:space-y-0 sm:space-x-2 flex-1">
        <span className="whitespace-nowrap font-medium">Set Monthly Budget ($):</span>
        <input
          type="number"
          min={0}
          step={0.01}
          value={inputBudget}
          onChange={handleInputChange}
          disabled={loadingBudget || savingBudget}
          className="border px-3 py-2 rounded w-full sm:w-32"
        />
      </label>
      <button
        type="submit"
        disabled={loadingBudget || savingBudget}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {savingBudget ? "Saving..." : "Save"}
      </button>
    </form>

    {/* Display total spent and progress bar */}
    <div className="flex flex-col flex-1 min-w-[220px]">
      <div className="flex justify-between items-center mb-1 font-semibold text-gray-700">
        <span>Total Spent in {month}:</span>
        <span>{loadingSpent ? "Loading..." : `$${totalSpent.toFixed(2)}`}</span>
      </div>
      <div className="relative h-6 w-full bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-6 rounded transition-all duration-300 ${
            isOverBudget ? "bg-red-600" : "bg-green-600"
          }`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      {isOverBudget && (
        <p className="text-red-700 font-semibold text-center md:text-left mt-2">
          Warning: You have exceeded your budget!
        </p>
      )}
    </div>
  </div>
</section>


    )
}
