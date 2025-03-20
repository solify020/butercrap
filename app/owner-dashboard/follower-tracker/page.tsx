"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import FollowerTracker from "@/components/follower-tracker"

export default function FollowerTrackerPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-[#454545] p-8 rounded-full shadow-lg mb-6 pulse-glow">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </div>
        <p className="text-white text-xl font-medium slide-in-up">Loading follower tracker...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#454545] p-8 rounded-xl shadow-lg border border-[#666666] max-w-md slide-in-up">
          <p className="text-center text-white text-xl mb-6">Please log in to access the dashboard</p>
          <Button onClick={() => router.push("/")} className="w-full bg-accent hover:bg-accent/90 text-white py-6">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      <header className="p-6 bg-[#333333] shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Follower Tracker</h1>
      </header>

      <main className="container mx-auto px-6 py-10">
        <FollowerTracker />
      </main>
    </div>
  )
}

