"use client"

import { useState, useEffect } from "react"
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Users, Eye, Clock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PerformancePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [timeframe, setTimeframe] = useState("30d")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="premium" size="sm" className="button-zoom-effect">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      >
        <Card className="dashboard-item-appear card-hover-transform" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500">+12.5% from previous period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-item-appear card-hover-transform" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8%</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500">+0.7% from previous period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-item-appear card-hover-transform" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:45</div>
            <div className="flex items-center mt-1">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-xs text-red-500">-0:15 from previous period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-item-appear card-hover-transform" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-500">+8.2% from previous period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="subtle-bounce" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Key metrics across all platforms</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <BarChart2 className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground ml-4">Interactive chart coming soon</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="subtle-bounce" style={{ animationDelay: "0.6s" }}>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>Content with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Eye className="h-6 w-6 text-muted-foreground/70" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium truncate">New Product Launch Video</p>
                        <p className="text-sm text-muted-foreground truncate">Posted on Instagram • 3 days ago</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" /> 24.5K
                          </span>
                          <span className="flex items-center">
                            <BarChart2 className="h-3 w-3 mr-1" /> 8.2%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Content
                </Button>
              </CardFooter>
            </Card>

            <Card className="subtle-bounce" style={{ animationDelay: "0.7s" }}>
              <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
                <CardDescription>New followers over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart2 className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground ml-4">Interactive chart coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Detailed metrics for all content</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">Detailed content analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>Demographics and behavior</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">Audience insights coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Income and conversion metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <DollarSign className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">Revenue analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

