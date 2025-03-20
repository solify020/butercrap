"use client"

import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface SigningOutScreenProps {
  redirectTo?: string
  delay?: number
}

export default function SigningOutScreen({ redirectTo = "/", delay = 1500 }: SigningOutScreenProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo)
    }, delay)

    return () => clearTimeout(timer)
  }, [router, redirectTo, delay])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#333333] animate-fadeIn">
      <div className="bg-[#444444] p-8 rounded-full shadow-lg mb-6 pulse-glow">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
      <div className="text-center slide-in-up">
        <h2 className="text-white text-2xl font-medium mb-2">Signing Out...</h2>
      </div>
    </div>
  )
}

