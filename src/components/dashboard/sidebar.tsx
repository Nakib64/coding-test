"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  User, 
  LogOut 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Add Expenses", href: "/dashboard/add", icon: Plus },
  { name: "Manage Expenses", href: "/dashboard/manage", icon: List },
  { name: "Manage Profile", href: "/dashboard/profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card max-md:w-full max-md:h-auto max-md:border-b max-md:border-r-0">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-semibold max-md:text-sm">Expense Dashboard</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4 max-md:flex max-md:flex-row max-md:space-y-0 max-md:space-x-2 max-md:overflow-x-auto max-md:pb-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="max-md:hidden">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4 max-md:border-t-0 max-md:border-l max-md:ml-auto max-md:px-2">
        <Button
          variant="ghost"
          className="w-full justify-start max-md:w-auto max-md:px-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="max-md:hidden">Sign Out</span>
        </Button>
      </div>
    </div>
  )
}
