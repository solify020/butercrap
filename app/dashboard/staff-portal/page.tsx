"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { collection, getDocs, updateDoc, doc, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { ZoomIn } from "@/components/animations/zoom-in"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StaffPortalPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user?.email) return

      try {
        const q = query(
          collection(db, "tasks"),
          where("assignedTo", "==", session.user.email),
          where("visible", "==", true),
          orderBy("createdAt", "desc"),
        )
        const querySnapshot = await getDocs(q)
        const tasksList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
        }))
        setTasks(tasksList)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          title: "Error",
          description: "An error occurred while fetching your tasks.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchTasks()
    }
  }, [session])

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status,
      })
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)))
      toast({
        title: "Status Updated",
        description: `Task marked as ${status}.`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the status.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return ""
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const filteredTasks = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading tasks...</h2>
          <p>Please wait while we load your tasks</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Staff Tasks</h1>
        <p className="text-muted-foreground">Tasks assigned to you by the owner</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks("pending").map((task, index) => (
              <ZoomIn key={task.id} delay={index * 50}>
                <Card className="bg-[#333333] border-[#444444]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                      <div className="flex items-center">{getStatusIcon(task.status)}</div>
                    </div>
                    <CardDescription>Assigned by: {task.createdBy}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm mb-2">{task.description}</p>
                    <div className="flex justify-between text-xs">
                      <span>Due: {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : "No date"}</span>
                      <span className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(task.id, "in-progress")}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(task.id, "completed")}
                      >
                        Complete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </ZoomIn>
            ))}
            {filteredTasks("pending").length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No pending tasks assigned to you.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks("in-progress").map((task, index) => (
              <ZoomIn key={task.id} delay={index * 50}>
                <Card className="bg-[#333333] border-[#444444]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                      <div className="flex items-center">{getStatusIcon(task.status)}</div>
                    </div>
                    <CardDescription>Assigned by: {task.createdBy}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm mb-2">{task.description}</p>
                    <div className="flex justify-between text-xs">
                      <span>Due: {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : "No date"}</span>
                      <span className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(task.id, "pending")}
                      >
                        Back to Pending
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(task.id, "completed")}
                      >
                        Complete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </ZoomIn>
            ))}
            {filteredTasks("in-progress").length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No tasks in progress.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks("completed").map((task, index) => (
              <ZoomIn key={task.id} delay={index * 50}>
                <Card className="bg-[#333333] border-[#444444]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                      <div className="flex items-center">{getStatusIcon(task.status)}</div>
                    </div>
                    <CardDescription>Assigned by: {task.createdBy}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm mb-2">{task.description}</p>
                    <div className="flex justify-between text-xs">
                      <span>Due: {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : "No date"}</span>
                      <span className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                      onClick={() => handleStatusChange(task.id, "pending")}
                    >
                      Reopen
                    </Button>
                  </CardFooter>
                </Card>
              </ZoomIn>
            ))}
            {filteredTasks("completed").length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No completed tasks.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

