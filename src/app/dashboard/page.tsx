"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loading } from "@/components/shared/loading"

export default function DashboardPage() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard/manage")
    } else if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  return <Loading message="Redirecting..." />
}

