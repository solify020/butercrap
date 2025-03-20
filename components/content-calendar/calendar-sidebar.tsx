"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { collection, query, orderBy, getDocs, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ContentItem } from "@/types/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"

export function CalendarSidebar() {
  const { data: session } = useSession()
  const [upcomingContent, setUpcomingContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingContent = async () => {
      try {
        // Get content items scheduled for today or later
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const contentQuery = query(
          collection(db, "content"),
          where("scheduledDate", ">=", Timestamp.fromDate(today)),
          orderBy("scheduledDate", "asc"),
        )

        const contentSnapshot = await getDocs(contentQuery)
        const contentData = contentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContentItem[]

        setUpcomingContent(contentData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching upcoming content:", error)
        setIsLoading(false)
      }
    }

    if (session) {
      fetchUpcomingContent()
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="w-full mb-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Content
        </Button>

        <div className="space-y-4">
          {upcomingContent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming content scheduled</p>
          ) : (
            upcomingContent.map((item) => <UpcomingContentItem key={item.id} item={item} />)
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function UpcomingContentItem({ item }: { item: ContentItem }) {
  const date = item.scheduledDate?.toDate ? item.scheduledDate.toDate() : new Date(item.scheduledDate)

  return (
    <div className="border rounded-md p-3">
      <div className="font-medium">{item.title}</div>
      <div className="text-sm text-muted-foreground">
        {format(date, "MMM d, yyyy")} • {item.platform}
      </div>
      {item.description && <div className="text-sm mt-2 line-clamp-2">{item.description}</div>}
    </div>
  )
}

