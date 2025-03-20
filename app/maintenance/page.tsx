"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Wrench } from "lucide-react"

export default function MaintenancePage() {
  const { signOut, isOwner } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-600">
      <div className="w-full max-w-md p-8 bg-[#333333] rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#444444] rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Maintenance Mode</h1>
        <p className="text-gray-300 mb-6">The system is currently undergoing maintenance. Please check back later.</p>
        {isOwner ? (
          <p className="text-yellow-400 mb-6">
            You are logged in as an owner. You can disable maintenance mode in the admin settings.
          </p>
        ) : (
          <Button onClick={signOut} className="bg-gray-500 hover:bg-gray-600 text-white">
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
}

