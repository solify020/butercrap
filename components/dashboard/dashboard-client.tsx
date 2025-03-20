"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users, Calendar, CheckSquare } from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ZoomIn } from "@/components/animations/zoom-in"

export function DashboardClient() {
  const { data: session, status } = useSession()
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [recentContent, setRecentContent] = useState<any[]>([])
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          // Fetch recent tasks
          const tasksQuery = query(collection(db, "tasks"), orderBy("createdAt", "desc"), limit(5))
          const tasksSnapshot = await getDocs(tasksQuery)
          const tasksData = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setRecentTasks(tasksData)

          // Fetch recent content
          const contentQuery = query(collection(db, "content"), orderBy("scheduledDate", "desc"), limit(5))
          const contentSnapshot = await getDocs(contentQuery)
          const contentData = contentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setRecentContent(contentData)

          // Fetch follower count
          const followersQuery = query(collection(db, "followers"))
          const followersSnapshot = await getDocs(followersQuery)
          setFollowerCount(followersSnapshot.size)

          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()
  }, [session, status])

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const isOwner = session.user.role === "owner"
  const isStaff = session.user.role === "staff"

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <ZoomIn>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{followerCount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled Content</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentContent.length}</div>
                  <p className="text-xs text-muted-foreground">{recentContent.length} items scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentTasks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {recentTasks.filter((task: any) => task.status === "completed").length} completed
                  </p>
                </CardContent>
              </Card>
            </div>
          </ZoomIn>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
                <CardDescription>Recently scheduled content across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                {recentContent.length > 0 ? (
                  <div className="space-y-2">
                    {recentContent.map((content: any) => (
                      <div key={content.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{content.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(content.scheduledDate.seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm">{content.platform}</div>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link href="/dashboard/content-calendar">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        View Content Calendar
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-lg font-medium">No content scheduled</p>
                      <p className="text-sm text-muted-foreground">Start creating content for your platforms</p>
                    </div>
                    <Button asChild>
                      <Link href="/dashboard/content-calendar">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Content
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Tasks assigned to you and your team</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-2">
                    {recentTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-sm ${task.status === "completed" ? "text-green-500" : "text-amber-500"}`}>
                          {task.status}
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link href="/dashboard/staff-tasks">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        View All Tasks
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <CheckSquare className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-lg font-medium">No tasks assigned</p>
                      <p className="text-sm text-muted-foreground">Create tasks for you and your team</p>
                    </div>
                    <Button asChild>
                      <Link href="/dashboard/staff-tasks">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Task
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

