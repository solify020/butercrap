"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Use client-side navigation instead of redirect()
    router.push("/login")
  }, [router])

  // Return a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  )
}

