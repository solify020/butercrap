"use client"

import { useSession } from "next-auth/react"

export default function ContentCalendarPageClient() {
  const { data: sessionData } = useSession()
  const data = sessionData || { user: null }

  if (!data || !data.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
          <p>Please wait while we load your content calendar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Content Calendar</h1>
      <div className="text-center p-8">
        <p>Loading calendar...</p>
      </div>
    </div>
  )
}

