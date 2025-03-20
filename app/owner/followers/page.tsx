"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Users } from "lucide-react"

export default function FollowersPage() {
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFollowers = () => {
      try {
        const q = query(collection(db, "followers"), orderBy("date", "asc"))

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const followersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date?.toDate?.() || new Date(doc.data().date),
            }))

            setFollowers(followersData)
            setLoading(false)
          },
          (err) => {
            console.error("Error fetching followers:", err)
            setError("Failed to load followers data")
            setLoading(false)
          },
        )

        return unsubscribe
      } catch (err) {
        console.error("Error setting up followers listener:", err)
        setError("Failed to set up followers data listener")
        setLoading(false)
        return () => {}
      }
    }

    const unsubscribe = fetchFollowers()
    return () => unsubscribe()
  }, [])

  const prepareChartData = () => {
    if (!followers.length) return []

    // Sort by date
    const sortedData = [...followers].sort((a, b) => a.date.getTime() - b.date.getTime())

    return sortedData.map((item) => ({
      date: item.date.toLocaleDateString(),
      followers: item.count,
      growth: item.growth || 0,
    }))
  }

  const calculateTotalGrowth = () => {
    if (followers.length < 2) return 0

    const sortedData = [...followers].sort((a, b) => a.date.getTime() - b.date.getTime())
    const firstCount = sortedData[0].count
    const lastCount = sortedData[sortedData.length - 1].count

    return lastCount - firstCount
  }

  const calculateAverageGrowth = () => {
    if (followers.length < 2) return 0

    const totalGrowth = calculateTotalGrowth()
    const days = followers.length - 1

    return (totalGrowth / days).toFixed(2)
  }

  const chartData = prepareChartData()
  const totalGrowth = calculateTotalGrowth()
  const averageGrowth = calculateAverageGrowth()
  const currentFollowers = followers.length > 0 ? followers[followers.length - 1].count : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 zoom-in">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Followers Tracker</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#333333] border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Current Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentFollowers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#333333] border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalGrowth > 0 ? "+" : ""}
              {totalGrowth.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#333333] border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Daily Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(averageGrowth) > 0 ? "+" : ""}
              {averageGrowth}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#333333] border-gray-700">
        <CardHeader>
          <CardTitle>Followers Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList className="bg-[#444444]">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="area">Area Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="line" className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                  <XAxis dataKey="date" stroke="#999999" />
                  <YAxis stroke="#999999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#333333", borderColor: "#555555" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Line type="monotone" dataKey="followers" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="area" className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                  <XAxis dataKey="date" stroke="#999999" />
                  <YAxis stroke="#999999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#333333", borderColor: "#555555" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Area type="monotone" dataKey="followers" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-[#333333] border-gray-700">
        <CardHeader>
          <CardTitle>Followers Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Followers</th>
                  <th className="text-left py-3 px-4">Daily Growth</th>
                </tr>
              </thead>
              <tbody>
                {[...followers]
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-700">
                      <td className="py-3 px-4">{item.date.toLocaleDateString()}</td>
                      <td className="py-3 px-4">{item.count.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {item.growth > 0 ? (
                          <span className="text-green-500">+{item.growth}</span>
                        ) : item.growth < 0 ? (
                          <span className="text-red-500">{item.growth}</span>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

