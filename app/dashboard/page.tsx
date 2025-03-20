"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardPage() {
  const { user, userRoles } = useAuth()
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch recent tasks
        const tasksQuery = query(
          collection(db, "tasks"),
          where("assignedTo", "==", user.uid),
          where("status", "!=", "completed"),
          orderBy("status"),
          orderBy("dueDate"),
          limit(5),
        )

        const tasksSnapshot = await getDocs(tasksQuery)
        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentTasks(tasksData)

        // Fetch upcoming calendar events
        const now = new Date()
        const calendarQuery = query(collection(db, "calendar"), where("date", ">=", now), orderBy("date"), limit(5))

        const calendarSnapshot = await getDocs(calendarQuery)
        const calendarData = calendarSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUpcomingEvents(calendarData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Format date for display
  const formatDate = (date: any) => {
    if (!date) return "No date"

    if (typeof date === "object" && date.toDate) {
      date = date.toDate()
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.displayName || user?.email}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tasks Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your most recent assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tasks assigned to you</p>
            )}
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your upcoming calendar events</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    </div>
                    {event.colour && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: event.colour }} />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

