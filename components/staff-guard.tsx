"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface StaffGuardProps {
  children: React.ReactNode
}

export function StaffGuard({ children }: StaffGuardProps) {
  const { loading, isOwner, isStaff } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isOwner && !isStaff) {
      router.push("/")
    }
  }, [loading, isOwner, isStaff, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isOwner && !isStaff) {
    return null
  }

  return <>{children}</>
}

