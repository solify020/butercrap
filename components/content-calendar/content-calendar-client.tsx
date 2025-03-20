"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Calendar } from "@/components/content-calendar/calendar"
import { CalendarSidebar } from "@/components/content-calendar/calendar-sidebar"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ContentItem } from "@/types/content"

export function ContentCalendarClient() {
  const { data: session, status } = useSession()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    const fetchContentItems = async () => {
      if (status === "authenticated") {
        try {
          const contentQuery = query(collection(db, "content"), orderBy("scheduledDate", "asc"))

          const contentSnapshot = await getDocs(contentQuery)
          const contentData = contentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ContentItem[]

          setContentItems(contentData)
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching content items:", error)
          setIsLoading(false)
        }
      }
    }

    fetchContentItems()
  }, [session, status])

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:w-1/4">
          <CalendarSidebar contentItems={contentItems} setContentItems={setContentItems} />
        </div>
        <div className="md:w-3/4">
          <Calendar contentItems={contentItems} setContentItems={setContentItems} />
        </div>
      </div>
    </DashboardShell>
  )
}

