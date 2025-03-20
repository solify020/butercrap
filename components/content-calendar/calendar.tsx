"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ContentItem } from "@/types/content"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function Calendar() {
  const { data: session } = useSession()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const fetchContentItems = async () => {
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

    if (session) {
      fetchContentItems()
    }
  }, [session])

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  // Simple calendar view - can be expanded with more features
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="text-xl font-bold mb-4">
          {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium p-2">
              {day}
            </div>
          ))}
          {generateCalendarDays(currentMonth, contentItems)}
        </div>
      </CardContent>
    </Card>
  )
}

function generateCalendarDays(date: Date, contentItems: ContentItem[]) {
  const year = date.getFullYear()
  const month = date.getMonth()

  // Get the first day of the month
  const firstDay = new Date(year, month, 1)
  const startingDay = firstDay.getDay() // 0 = Sunday

  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()

  // Create calendar cells
  const days = []

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 min-h-[80px] bg-muted/20 rounded-sm"></div>)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(year, month, day)

    // Find content items for this day
    const dayContentItems = contentItems.filter((item) => {
      const itemDate = item.scheduledDate?.toDate ? item.scheduledDate.toDate() : new Date(item.scheduledDate)
      return itemDate.getDate() === day && itemDate.getMonth() === month && itemDate.getFullYear() === year
    })

    days.push(
      <div
        key={`day-${day}`}
        className={`p-2 min-h-[80px] border border-border rounded-sm ${
          dayContentItems.length > 0 ? "bg-primary/10" : ""
        }`}
      >
        <div className="font-medium">{day}</div>
        {dayContentItems.map((item) => (
          <div key={item.id} className="text-xs p-1 mt-1 bg-primary/20 rounded truncate" title={item.title}>
            {item.title}
          </div>
        ))}
      </div>,
    )
  }

  return days
}

