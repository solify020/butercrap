"use client"

import { BarChart, LineChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FollowerTrackerPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Follower Tracker</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#333333] text-white">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#444444]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#444444]">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="platforms" className="data-[state=active]:bg-[#444444]">
            Platforms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#333333] text-white border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-400">+0 from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-[#333333] text-white border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Twitter/X</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-400">+0 from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-[#333333] text-white border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Instagram</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-400">+0 from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-[#333333] text-white border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">YouTube</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-400">+0 from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#333333] text-white border-gray-700">
              <CardHeader>
                <CardTitle>Growth Trend</CardTitle>
                <CardDescription className="text-gray-400">Follower growth over time</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <LineChart className="h-16 w-16 mb-2" />
                  <p>No data available</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#333333] text-white border-gray-700">
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription className="text-gray-400">Followers by platform</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <BarChart className="h-16 w-16 mb-2" />
                  <p>No data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[400px] flex items-center justify-center text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium">Analytics Dashboard</h3>
            <p className="text-sm text-gray-400 mt-1">No data available</p>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="h-[400px] flex items-center justify-center text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium">Platform Details</h3>
            <p className="text-sm text-gray-400 mt-1">No data available</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

