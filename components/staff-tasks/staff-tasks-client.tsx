"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CheckCircle, Clock, PlusCircle, Trash2 } from "lucide-react"

// Define the task schema
const taskSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  assignedTo: z.string().min(1, {
    message: "Please select an assignee.",
  }),
  dueDate: z.string().min(1, {
    message: "Please select a due date.",
  }),
  priority: z.string().min(1, {
    message: "Please select a priority.",
  }),
})

type Task = {
  id: string
  title: string
  description: string
  assignedTo: string
  dueDate: Timestamp
  priority: string
  status: string
  createdAt: Timestamp
  createdBy: string
}

export function StaffTasksClient() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      priority: "medium",
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    const fetchTasks = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          let tasksQuery

          if (session.user.role === "owner") {
            // Owners can see all tasks
            tasksQuery = query(collection(db, "tasks"), orderBy("createdAt", "desc"))
          } else {
            // Staff can only see tasks assigned to them
            tasksQuery = query(
              collection(db, "tasks"),
              where("assignedTo", "==", session.user.email),
              orderBy("createdAt", "desc"),
            )
          }

          const tasksSnapshot = await getDocs(tasksQuery)
          const tasksData = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[]

          setTasks(tasksData)
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching tasks:", error)
          toast({
            title: "Error",
            description: "Failed to load tasks. Please try again.",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      }
    }

    fetchTasks()
  }, [session, status])

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    if (!session?.user) return

    try {
      const newTask = {
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: Timestamp.fromDate(new Date(values.dueDate)),
        priority: values.priority,
        status: "pending",
        createdAt: Timestamp.now(),
        createdBy: session.user.email,
      }

      const docRef = await addDoc(collection(db, "tasks"), newTask)

      setTasks((prev) => [
        {
          id: docRef.id,
          ...newTask,
        } as Task,
        ...prev,
      ])

      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      })

      form.reset()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: newStatus,
      })

      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

      toast({
        title: "Task updated",
        description: `Task marked as ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId))

      setTasks((prev) => prev.filter((task) => task.id !== taskId))

      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return task.status === "pending"
    if (activeTab === "completed") return task.status === "completed"
    return true
  })

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const isOwner = session.user.role === "owner"

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Create a new task for yourself or team members.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Task description" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a person" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={session.user.email || ""}>Me ({session.user.email})</SelectItem>
                          {isOwner && (
                            <>
                              <SelectItem value="staff@example.com">Staff Member (staff@example.com)</SelectItem>
                              <SelectItem value="team@example.com">Team (team@example.com)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {filteredTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{task.title}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </CardTitle>
                    <CardDescription>Assigned to: {task.assignedTo}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{task.description}</p>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      Due: {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {task.status === "pending" ? (
                      <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, "pending")}>
                        <Clock className="mr-2 h-4 w-4" />
                        Mark Pending
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="text-center">
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "Create a new task to get started"
                    : activeTab === "pending"
                      ? "No pending tasks"
                      : "No completed tasks"}
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

