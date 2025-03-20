"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Calendar } from "./calendar"
import { CalendarSidebar } from "./calendar-sidebar"
import { PageTransition } from "@/components/animations/page-transition"

export function ContentCalendarPage() {
  const { data: session, status } = useSession()

  // Handle authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
          <p className="text-white text-lg">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Content Calendar</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/4">
            <CalendarSidebar />
          </div>
          <div className="md:w-3/4">
            <Calendar />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

