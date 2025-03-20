"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CalendarIcon, Trash2, Edit, Plus, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ZoomIn } from "@/components/animations/zoom-in"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContentCalendarPage() {
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [platform, setPlatform] = useState("instagram")
  const [status, setStatus] = useState("planned")
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editPost, setEditPost] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const fetchPosts = async () => {
    try {
      setError(null)
      setLoading(true)

      // Get user role from session
      const userEmail = session?.user?.email

      // First check if user exists in the users collection
      const usersRef = collection(db, "users")
      const userQuery = query(usersRef, where("email", "==", userEmail))
      const userSnapshot = await getDocs(userQuery)

      if (userSnapshot.empty) {
        setError("User not found. Please contact an administrator.")
        setLoading(false)
        return
      }

      // Get user role
      const userData = userSnapshot.docs[0].data()
      const userRole = userData.role

      // Query content calendar
      const q = query(collection(db, "contentCalendar"), orderBy("date", "desc"))

      const querySnapshot = await getDocs(q)
      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
      }))

      setPosts(postsList)
    } catch (error: any) {
      console.error("Error fetching posts:", error)
      setError(
        "Error loading calendar data. This might be due to insufficient permissions or a network issue. Please try again later or contact support.",
      )
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchPosts()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !date || !platform || !status) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const postData = {
        title,
        description,
        date,
        platform,
        status,
        createdAt: new Date(),
        createdBy: session?.user?.email,
        updatedAt: new Date(),
      }

      if (editPost) {
        await updateDoc(doc(db, "contentCalendar", editPost.id), postData)
        toast({
          title: "Post Updated",
          description: "The post has been updated successfully.",
        })
      } else {
        await addDoc(collection(db, "contentCalendar"), postData)
        toast({
          title: "Post Created",
          description: "The post has been created successfully.",
        })
      }

      // Reset form
      setTitle("")
      setDescription("")
      setDate(undefined)
      setPlatform("instagram")
      setStatus("planned")
      setEditPost(null)
      setIsEditDialogOpen(false)

      // Refresh posts
      fetchPosts()
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving the post.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (post: any) => {
    setEditPost(post)
    setTitle(post.title)
    setDescription(post.description)
    setDate(post.date)
    setPlatform(post.platform)
    setStatus(post.status)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "contentCalendar", postId))
      setPosts(posts.filter((post) => post.id !== postId))
      toast({
        title: "Post Deleted",
        description: "The post has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the post.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "contentCalendar", postId), {
        status: newStatus,
        updatedAt: new Date(),
      })
      setPosts(posts.map((post) => (post.id === postId ? { ...post, status: newStatus } : post)))
      toast({
        title: "Status Updated",
        description: `Post marked as ${newStatus}.`,
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "text-pink-500"
      case "twitter":
        return "text-blue-500"
      case "facebook":
        return "text-blue-700"
      case "tiktok":
        return "text-purple-500"
      case "youtube":
        return "text-red-500"
      default:
        return ""
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "planned":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const filteredPosts = (status: string) => {
    return posts.filter((post) => post.status === status)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-semibold">Loading calendar...</h2>
          <p>Please wait while we load your content calendar</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-red-500">Error Loading Calendar</h2>
          <p className="mt-2">{error}</p>
          <Button
            onClick={() => {
              setRetrying(true)
              fetchPosts()
            }}
            className="mt-4 bg-[#999999] hover:bg-[#777777] text-white"
            disabled={retrying}
          >
            {retrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditPost(null)
                setTitle("")
                setDescription("")
                setDate(undefined)
                setPlatform("instagram")
                setStatus("planned")
              }}
              className="bg-[#999999] hover:bg-[#777777] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editPost ? "Edit Post" : "Create New Post"}</DialogTitle>
              <DialogDescription>
                {editPost
                  ? "Update the post details below."
                  : "Fill in the details to create a new content calendar post."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    required
                    className="bg-[#222222] border-[#444444]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Post description"
                    required
                    className="bg-[#222222] border-[#444444]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-[#222222] border-[#444444] ${!date ? "text-muted-foreground" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" className="bg-[#222222] border-[#444444]">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="bg-[#222222] border-[#444444]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-[#999999] hover:bg-[#777777] text-white">
                  {isSubmitting ? "Saving..." : editPost ? "Update Post" : "Create Post"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="planned" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value="planned" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts("planned").map((post, index) => (
              <ZoomIn key={post.id} delay={index * 50}>
                <Card className="bg-[#333333] border-[#444444]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{post.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                          className="h-8 w-8 text-[#999999] hover:text-white hover:bg-[#444444]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="h-8 w-8 text-[#999999] hover:text-red-500 hover:bg-[#444444]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      <span className={getPlatformColor(post.platform)}>
                        {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm mb-2">{post.description}</p>
                    <div className="text-xs">
                      <span>Date: {post.date ? format(post.date, "MMM d, yyyy") : "No date"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(post.id, "in-progress")}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(post.id, "published")}
                      >
                        Publish
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </ZoomIn>
            ))}
            {filteredPosts("planned").length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No planned posts found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts("in-progress").map((post, index) => (
              <ZoomIn key={post.id} delay={index * 50}>
                <Card className="bg-[#333333] border-[#444444]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{post.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                          className="h-8 w-8 text-[#999999] hover:text-white hover:bg-[#444444]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="h-8 w-8 text-[#999999] hover:text-red-500 hover:bg-[#444444]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      <span className={getPlatformColor(post.platform)}>
                        {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm mb-2">{post.description}</p>
                    <div className="text-xs">
                      <span>Date: {post.date ? format(post.date, "MMM d, yyyy") : "No date"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(post.id, "planned")}
                      >
                        Back to Planned
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                        onClick={() => handleStatusChange(post.id, "published")}
                      >
                        Publish
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </ZoomIn>
            ))}
            {filteredPosts("in-progress").length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No posts in progress.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts("published").map((post, index) => (
              <ZoomIn key={post.id} delay={index * 50}>
                <Card className="bg-[#333333] border-[#444444]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{post.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="h-8 w-8 text-[#999999] hover:text-red-500 hover:bg-[#444444]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      <span className={getPlatformColor(post.platform)}>
                        {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm mb-2">{post.description}</p>
                    <div className="text-xs">
                      <span>Date: {post.date ? format(post.date, "MMM d, yyyy") : "No date"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#444444] bg-[#333333] text-white hover:bg-[#444444]"
                      onClick={() => handleStatusChange(post.id, "planned")}
                    >
                      Replan
                    </Button>
                  </CardFooter>
                </Card>
              </ZoomIn>
            ))}
            {filteredPosts("published").length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No published posts.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

