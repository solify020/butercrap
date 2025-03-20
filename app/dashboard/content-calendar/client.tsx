"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, where, Timestamp } from "firebase/firestore"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/animations/page-transition"

export default function ContentCalendarClient() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      redirect("/login")
    }

    // Only fetch data when authenticated
    if (status === "authenticated") {
      const fetchEvents = async () => {
        try {
          // Get today's date at midnight
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const eventsQuery = query(
            collection(db, "calendar-events"),
            where("date", ">=", Timestamp.fromDate(today)),
            orderBy("date", "asc"),
          )

          const snapshot = await getDocs(eventsQuery)
          const eventsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setEvents(eventsList)
          setIsLoading(false)
        } catch (err) {
          console.error("Error fetching events:", err)
          setError(err.message)
          setIsLoading(false)
        }
      }

      fetchEvents()
    }
  }, [status])

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-lg">Loading calendar...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Calendar</h2>
            <p className="mb-4">There was a problem loading the calendar data:</p>
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
            <p className="mt-4">
              This might be due to insufficient permissions or a network issue. Please try again later or contact
              support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <Button>Add New Event</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-muted-foreground">No upcoming events scheduled</p>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="border rounded-md p-3">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">{format(event.date.toDate(), "MMM d, yyyy")}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center p-12 text-muted-foreground">Calendar view is simplified for this version.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

