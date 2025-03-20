"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZoomIn } from "@/components/animations/zoom-in"
import { Loader2 } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function FollowerCount() {
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFollowerCount = async () => {
      try {
        const followersCollection = collection(db, "followers")
        const snapshot = await getDocs(followersCollection)
        setFollowerCount(snapshot.size)
      } catch (error) {
        console.error("Error fetching follower count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowerCount()
  }, [])

  return (
    <ZoomIn>
      <Card className="bg-[#333333] border-[#444444]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Follower Count</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="text-2xl font-bold">{followerCount?.toLocaleString() || "0"}</div>
          )}
        </CardContent>
      </Card>
    </ZoomIn>
  )
}

