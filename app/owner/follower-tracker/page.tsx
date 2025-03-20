"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, orderBy, limit, Timestamp } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ZoomIn } from "@/components/animations/zoom-in"

interface FollowerData {
  date: string
  instagram: number
  tiktok: number
  youtube: number
  twitter: number
}

export default function FollowerTrackerPage() {
  const [followerData, setFollowerData] = useState<FollowerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCounts, setCurrentCounts] = useState({
    instagram: 0,
    tiktok: 0,
    youtube: 0,
    twitter: 0,
  })

  useEffect(() => {
    async function fetchFollowerData() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch follower history data
        const followersCollection = collection(db, "follower_history")
        const followersQuery = query(followersCollection, orderBy("date", "asc"), limit(30))
        const querySnapshot = await getDocs(followersQuery)

        const fetchedData: FollowerData[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          // Convert Firestore Timestamp to Date string
          const date =
            data.date instanceof Timestamp
              ? data.date.toDate().toLocaleDateString()
              : new Date(data.date).toLocaleDateString()

          fetchedData.push({
            date: date,
            instagram: data.instagram || 0,
            tiktok: data.tiktok || 0,
            youtube: data.youtube || 0,
            twitter: data.twitter || 0,
          })
        })

        setFollowerData(fetchedData)

        // Set current counts from the most recent data point
        if (fetchedData.length > 0) {
          const latest = fetchedData[fetchedData.length - 1]
          setCurrentCounts({
            instagram: latest.instagram,
            tiktok: latest.tiktok,
            youtube: latest.youtube,
            twitter: latest.twitter,
          })
        }
      } catch (err) {
        console.error("Error fetching follower data:", err)
        setError("Failed to load follower data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowerData()
  }, [])

  return (
    <ZoomIn>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Follower Tracker</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Instagram" value={currentCounts.instagram} isLoading={isLoading} color="#E1306C" />
          <StatCard title="TikTok" value={currentCounts.tiktok} isLoading={isLoading} color="#000000" />
          <StatCard title="YouTube" value={currentCounts.youtube} isLoading={isLoading} color="#FF0000" />
          <StatCard title="Twitter" value={currentCounts.twitter} isLoading={isLoading} color="#1DA1F2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
            <CardDescription>Track your follower growth across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                <TabsTrigger value="twitter">Twitter</TabsTrigger>
              </TabsList>

              <div className="h-[400px] mt-4">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : followerData.length > 0 ? (
                  <>
                    <TabsContent value="all">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={followerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="instagram" stroke="#E1306C" name="Instagram" />
                          <Line type="monotone" dataKey="tiktok" stroke="#000000" name="TikTok" />
                          <Line type="monotone" dataKey="youtube" stroke="#FF0000" name="YouTube" />
                          <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" name="Twitter" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="instagram">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={followerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="instagram" stroke="#E1306C" name="Instagram" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="tiktok">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={followerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="tiktok" stroke="#000000" name="TikTok" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="youtube">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={followerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="youtube" stroke="#FF0000" name="YouTube" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="twitter">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={followerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" name="Twitter" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No follower data available</p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ZoomIn>
  )
}

function StatCard({
  title,
  value,
  isLoading,
  color,
}: {
  title: string
  value: number
  isLoading: boolean
  color: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium" style={{ color }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  )
}

