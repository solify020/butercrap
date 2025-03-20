"use client"

import { useEffect } from "react"
import { ShieldAlert } from "lucide-react"
import { signOut } from "next-auth/react"
import { PageTransition } from "@/components/animations/page-transition"

export default function LockdownPage() {
  useEffect(() => {
    // Sign out the user after showing the message
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/login" })
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#333333] p-4">
        <div className="max-w-md w-full bg-[#222222] rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-900/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">Account Locked</h1>

          <p className="text-gray-300 mb-6">
            You have been signed out by BUTERASCP management. The system is currently in lockdown mode.
          </p>

          <div className="bg-red-900/20 border border-red-800 rounded-md p-4 text-left">
            <p className="text-red-400 text-sm">
              Please contact your administrator for more information. You will be redirected to the login page shortly.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

