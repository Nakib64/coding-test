"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Profile"
        description="Update your profile information"
      />
      <ProfileForm />
    </div>
  )
}
