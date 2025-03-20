"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CheckCircle, Clock, AlertCircle, CheckSquare } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedBy: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: Timestamp
  createdAt: Timestamp
  completedAt: Timestamp | null
}

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  const fetchTasks = async () => {
    if (!user) return

    try {
      const q = query(collection(db, "tasks"), where("assignedTo", "==", user.uid), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const fetchedTasks: Task[] = []

      querySnapshot.forEach((doc) => {
        fetchedTasks.push({
          id: doc.id,
          ...(doc.data() as Omit<Task, "id">),
        })
      })

      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user, toast])

  const updateTaskStatus = async (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    if (!user) return

    setLoading(true)

    try {
      const taskRef = doc(db, "tasks", taskId)
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      }

      if (newStatus === "completed") {
        updateData.completedAt = serverTimestamp()
      } else {
        updateData.completedAt = null
      }

      await updateDoc(taskRef, updateData)

      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      })

      fetchTasks()
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    }
  }

  const filterTasks = (status: string) => {
    if (status === "all") return tasks
    return tasks.filter((task) => task.status === status)
  }

  return (
    <>
      <Header title="My Tasks" portalType="staff" />
      <div className="flex-1 p-4 animate-in fade-in-50 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Tasks</h2>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {["all", "pending", "in-progress", "completed"].map((status) => (
            <TabsContent key={status} value={status}>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {filterTasks(status).length > 0 ? (
                  <div className="space-y-4">
                    {filterTasks(status).map((task) => (
                      <Card key={task.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              {getStatusIcon(task.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                          <div className="flex flex-wrap justify-between items-center">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {task.dueDate.toDate().toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                              {task.status !== "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateTaskStatus(task.id, "pending")}
                                  disabled={loading}
                                >
                                  Mark as Pending
                                </Button>
                              )}
                              {task.status !== "in-progress" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateTaskStatus(task.id, "in-progress")}
                                  disabled={loading}
                                >
                                  Mark as In Progress
                                </Button>
                              )}
                              {task.status !== "completed" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => updateTaskStatus(task.id, "completed")}
                                  disabled={loading}
                                >
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground">No tasks found</p>
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}

