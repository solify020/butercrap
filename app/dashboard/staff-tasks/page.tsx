"use client"

import { CardFooter } from "@/components/ui/card"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { getTasks, updateTaskStatus } from "@/app/actions/staff-tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

export default function StaffTasks() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")

  const userRole = session?.user?.role || "staff"
  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin"

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    async function fetchTasks() {
      const result = await getTasks()

      if (result.success) {
        setTasks(result.tasks)
      }

      setLoading(false)
    }

    fetchTasks()
  }, [session, status, router])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const result = await updateTaskStatus(taskId, newStatus)

    if (result.success) {
      // Update the task in the local state
      setTasks(tasks.map((task: any) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    }
  }

  const filteredTasks = statusFilter === "all" ? tasks : tasks.filter((task: any) => task.status === statusFilter)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-[#222222]">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Staff Tasks</h1>

          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-[#333333] border-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {filteredTasks.length === 0 ? (
          <div className="dashboard-empty-state mt-8">
            <p>No tasks found.</p>
            {isOwnerOrAdmin && (
              <Button
                className="mt-4 bg-[#999999] hover:bg-[#777777]"
                onClick={() => router.push("/dashboard/staff-tasks/new")}
              >
                Create New Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredTasks.map((task: any) => (
              <Card key={task.id} className="bg-[#333333] border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{task.title}</CardTitle>
                    <Badge
                      className={`
                        ${task.status === "pending" ? "bg-yellow-600" : ""}
                        ${task.status === "in-progress" ? "bg-blue-600" : ""}
                        ${task.status === "completed" ? "bg-green-600" : ""}
                      `}
                    >
                      {task.status}
                    </Badge>
                  </div>
                  {task.dueDate && (
                    <CardDescription className="text-gray-400">
                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{task.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value)}
                    disabled={!isOwnerOrAdmin && task.status === "completed"}
                  >
                    <SelectTrigger className="w-[140px] bg-[#444444] border-gray-600">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {isOwnerOrAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#444444] border-gray-600 hover:bg-[#555555]"
                      onClick={() => router.push(`/dashboard/staff-tasks/${task.id}`)}
                    >
                      Edit
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

