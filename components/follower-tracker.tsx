"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  UserPlus,
  UserMinus,
  RefreshCw,
  Calendar,
  Download,
  Filter,
  Loader2,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

// Mock data - would be replaced with real API data
// Remove this mock data generator
// const generateMockData = (days: number) => {
//   const data = []
//   const today = new Date()
//   let followers = 10000 + Math.floor(Math.random() * 500)

//   for (let i = days; i >= 0; i--) {
//     const date = subDays(today, i)
//     const gained = Math.floor(Math.random() * 100) + 10
//     const lost = Math.floor(Math.random() * 40) + 5
//     followers = followers + gained - lost

//     data.push({
//       date: format(date, "yyyy-MM-dd"),
//       followers,
//       gained,
//       lost,
//       net: gained - lost,
//     })
//   }
//   return data
// }

export default function FollowerTracker() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isLoading, setIsLoading] = useState(false)
  const [followerData, setFollowerData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate summary metrics
  const currentFollowers = followerData.length > 0 ? followerData[followerData.length - 1].followers : 0
  const previousFollowers = followerData.length > 0 ? followerData[0].followers : 0
  const netChange = currentFollowers - previousFollowers
  const percentChange = previousFollowers ? ((netChange / previousFollowers) * 100).toFixed(2) : "0.00"

  const totalGained = followerData.reduce((sum, day) => sum + day.gained, 0)
  const totalLost = followerData.reduce((sum, day) => sum + day.lost, 0)

  // Add this at the beginning of the component
  useEffect(() => {
    // Show a message that this feature requires API implementation
    toast({
      title: "API Required",
      description:
        "This component requires Instagram API integration to function properly. Currently showing placeholder UI.",
      variant: "warning",
      duration: 5000,
    })
  }, [])

  // Load data based on selected time range
  // Replace the mock data loading with real API call
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/instagram/followers?range=${timeRange}`)

        if (!response.ok) {
          throw new Error("Failed to fetch follower data")
        }

        const data = await response.json()
        setFollowerData(data.followers || [])
      } catch (error) {
        console.error("Error fetching follower data:", error)
        toast({
          title: "Error",
          description: "Failed to load follower data. Please try again later.",
          variant: "destructive",
        })
        setFollowerData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  // Update the refresh function to call the real API
  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      const response = await fetch(`/api/instagram/followers/refresh?range=${timeRange}`)

      if (!response.ok) {
        throw new Error("Failed to refresh follower data")
      }

      const data = await response.json()
      setFollowerData(data.followers || [])

      toast({
        title: "Data refreshed",
        description: `Follower data has been updated as of ${format(new Date(), "MMM d, yyyy h:mm a")}`,
      })
    } catch (error) {
      console.error("Error refreshing follower data:", error)
      toast({
        title: "Refresh failed",
        description: "Failed to refresh follower data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Update the export function to call the real API
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/instagram/followers/export?range=${timeRange}`)

      if (!response.ok) {
        throw new Error("Failed to export follower data")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `follower-data-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export complete",
        description: "Follower data has been exported successfully",
      })
    } catch (error) {
      console.error("Error exporting follower data:", error)
      toast({
        title: "Export failed",
        description: "Failed to export follower data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] bg-[#333333] border-[#666666]/30 text-white">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-[#333333] border-[#666666]/30 text-white">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#333333] border-[#666666]/30 text-white hover:bg-[#444444]"
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            className="bg-[#333333] border-[#666666]/30 text-white hover:bg-[#444444]"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px] bg-[#333333] rounded-lg border border-[#666666]/30">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            <p className="text-gray-300">Loading follower data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#333333] border-[#666666]/30 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Current Followers</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  {currentFollowers.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  {netChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={netChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {netChange >= 0 ? "+" : ""}
                    {netChange.toLocaleString()} ({percentChange}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#333333] border-[#666666]/30 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">New Followers</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-500" />
                  {totalGained.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  Avg. {Math.round(totalGained / followerData.length)} per day
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#333333] border-[#666666]/30 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Lost Followers</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserMinus className="h-5 w-5 text-red-500" />
                  {totalLost.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">Avg. {Math.round(totalLost / followerData.length)} per day</div>
              </CardContent>
            </Card>

            <Card className="bg-[#333333] border-[#666666]/30 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Retention Rate</CardDescription>
                <CardTitle className="text-2xl">
                  {totalGained > 0 ? (((totalGained - totalLost) / totalGained) * 100).toFixed(1) : 0}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  {totalLost > 0 ? (totalGained / totalLost).toFixed(1) + "x gain ratio" : "No followers lost"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#333333] border-[#666666]/30 text-white">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#444444]">
                Overview
              </TabsTrigger>
              <TabsTrigger value="growth" className="data-[state=active]:bg-[#444444]">
                Growth
              </TabsTrigger>
              <TabsTrigger value="daily" className="data-[state=active]:bg-[#444444]">
                Daily Changes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card className="bg-[#333333] border-[#666666]/30 text-white">
                <CardHeader>
                  <CardTitle>Follower Growth</CardTitle>
                  <CardDescription className="text-gray-400">Total follower count over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={followerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis
                          dataKey="date"
                          stroke="#999"
                          tickFormatter={(value) => {
                            const date = parseISO(value)
                            if (timeRange === "7d") return format(date, "EEE")
                            if (timeRange === "30d") return format(date, "MMM d")
                            if (timeRange === "90d") return format(date, "MMM d")
                            return format(date, "MMM yyyy")
                          }}
                        />
                        <YAxis stroke="#999" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#333", border: "1px solid #666" }}
                          labelStyle={{ color: "#fff" }}
                          formatter={(value: any) => [value.toLocaleString(), "Followers"]}
                          labelFormatter={(value) => format(parseISO(value), "MMMM d, yyyy")}
                        />
                        <Area
                          type="monotone"
                          dataKey="followers"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorFollowers)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth" className="mt-4">
              <Card className="bg-[#333333] border-[#666666]/30 text-white">
                <CardHeader>
                  <CardTitle>Net Follower Growth</CardTitle>
                  <CardDescription className="text-gray-400">
                    Daily net change in followers (gained - lost)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={followerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis
                          dataKey="date"
                          stroke="#999"
                          tickFormatter={(value) => {
                            const date = parseISO(value)
                            if (timeRange === "7d") return format(date, "EEE")
                            if (timeRange === "30d") return format(date, "MMM d")
                            if (timeRange === "90d") return format(date, "MMM d")
                            return format(date, "MMM yyyy")
                          }}
                        />
                        <YAxis stroke="#999" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#333", border: "1px solid #666" }}
                          labelStyle={{ color: "#fff" }}
                          formatter={(value: any) => [value.toLocaleString(), "Net Change"]}
                          labelFormatter={(value) => format(parseISO(value), "MMMM d, yyyy")}
                        />
                        <Line type="monotone" dataKey="net" stroke="#10b981" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="daily" className="mt-4">
              <Card className="bg-[#333333] border-[#666666]/30 text-white">
                <CardHeader>
                  <CardTitle>Daily Follower Changes</CardTitle>
                  <CardDescription className="text-gray-400">Followers gained and lost each day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={followerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis
                          dataKey="date"
                          stroke="#999"
                          tickFormatter={(value) => {
                            const date = parseISO(value)
                            if (timeRange === "7d") return format(date, "EEE")
                            if (timeRange === "30d") return format(date, "MMM d")
                            if (timeRange === "90d") return format(date, "MMM d")
                            return format(date, "MMM yyyy")
                          }}
                        />
                        <YAxis stroke="#999" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#333", border: "1px solid #666" }}
                          labelStyle={{ color: "#fff" }}
                          formatter={(value: any) => [value.toLocaleString(), ""]}
                          labelFormatter={(value) => format(parseISO(value), "MMMM d, yyyy")}
                        />
                        <Legend />
                        <Bar dataKey="gained" name="Gained" fill="#10b981" />
                        <Bar dataKey="lost" name="Lost" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Insights */}
          <Card className="bg-[#333333] border-[#666666]/30 text-white">
            <CardHeader>
              <CardTitle>Growth Insights</CardTitle>
              <CardDescription className="text-gray-400">
                Key metrics and patterns in your follower growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#3a3a3a] rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      Best Day for Growth
                    </h3>
                    <p className="text-gray-300">
                      Monday (+{Math.floor(Math.random() * 20) + 10} followers on average)
                    </p>
                  </div>

                  <div className="p-4 bg-[#3a3a3a] rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Filter className="h-4 w-4 text-blue-400" />
                      Growth Trend
                    </h3>
                    <p className="text-gray-300">
                      {netChange > 0
                        ? `Steady growth at ${Math.round(netChange / followerData.length)} followers per day`
                        : "Declining trend - consider posting more engaging content"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#3a3a3a] rounded-lg">
                  <h3 className="font-medium mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Post more consistently to maintain follower growth</li>
                    <li>Engage with comments to improve retention rate</li>
                    <li>Analyze top-performing content to understand what resonates with your audience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

