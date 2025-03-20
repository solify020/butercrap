"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface OwnerGuardProps {
  children: React.ReactNode
}

export function OwnerGuard({ children }: OwnerGuardProps) {
  const { loading, isOwner } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isOwner) {
      router.push("/")
    }
  }, [loading, isOwner, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isOwner) {
    return null
  }

  return <>{children}</>
}

