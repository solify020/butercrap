"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, Timestamp, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDate, formatTime, dateToTimestamp } from "@/lib/timestamp-utils"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, CalendarIcon, List, Trash2, Edit, AlertTriangle } from "lucide-react"

interface ContentItem {
  id: string
  title: string
  description: string
  date: Timestamp
  time: Timestamp
  platform: string
  formattedDate?: string
  formattedTime?: string
}

export default function ContentCalendarPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("12:00")
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "Instagram",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchContentItems()
  }, [])

  async function fetchContentItems() {
    try {
      setLoading(true)
      const q = query(collection(db, "contentCalendar"), orderBy("date", "asc"))
      const querySnapshot = await getDocs(q)

      const items: ContentItem[] = []
      for (const doc of querySnapshot.docs) {
        const data = doc.data() as Omit<ContentItem, "id" | "formattedDate" | "formattedTime">
        const formattedDateStr = await formatDate(data.date)
        const formattedTimeStr = await formatTime(data.time)

        items.push({
          id: doc.id,
          ...data,
          formattedDate: formattedDateStr,
          formattedTime: formattedTimeStr,
        })
      }

      setContentItems(items)
    } catch (err) {
      console.error("Error fetching content items:", err)
      setError("Failed to load content calendar. Please try again later.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load content calendar",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrUpdateItem = async () => {
    try {
      if (!selectedDate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date",
        })
        return
      }

      // Parse time string to create a Date object
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const timeDate = new Date()
      timeDate.setHours(hours, minutes, 0, 0)

      // Convert to Firestore Timestamps
      const dateTimestamp = await dateToTimestamp(selectedDate)
      const timeTimestamp = await dateToTimestamp(timeDate)

      if (!dateTimestamp || !timeTimestamp) {
        throw new Error("Failed to convert date/time to Timestamp")
      }

      const itemData = {
        title: formData.title,
        description: formData.description,
        platform: formData.platform,
        date: dateTimestamp,
        time: timeTimestamp,
        updatedAt: Timestamp.now(),
      }

      if (selectedItem) {
        // Update existing item
        await updateDoc(doc(db, "contentCalendar", selectedItem.id), itemData)
        toast({
          title: "Success",
          description: "Content item updated successfully",
        })
      } else {
        // Add new item
        await addDoc(collection(db, "contentCalendar"), {
          ...itemData,
          createdAt: Timestamp.now(),
        })
        toast({
          title: "Success",
          description: "Content item added successfully",
        })
      }

      // Reset form and refresh data
      resetForm()
      fetchContentItems()
    } catch (err) {
      console.error("Error saving content item:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save content item",
      })
    }
  }

  const handleDeleteItem = async () => {
    try {
      if (!selectedItem) return

      await deleteDoc(doc(db, "contentCalendar", selectedItem.id))

      toast({
        title: "Success",
        description: "Content item deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      resetForm()
      fetchContentItems()
    } catch (err) {
      console.error("Error deleting content item:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete content item",
      })
    }
  }

  const openEditDialog = (item: ContentItem) => {
    setSelectedItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      platform: item.platform,
    })

    // Convert Firestore Timestamp to Date
    const date = item.date.toDate()
    setSelectedDate(date)

    // Format time from Timestamp
    const timeDate = item.time.toDate()
    const hours = timeDate.getHours().toString().padStart(2, "0")
    const minutes = timeDate.getMinutes().toString().padStart(2, "0")
    setSelectedTime(`${hours}:${minutes}`)

    setIsDialogOpen(true)
  }

  const openDeleteDialog = (item: ContentItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      platform: "Instagram",
    })
    setSelectedDate(new Date())
    setSelectedTime("12:00")
    setSelectedItem(null)
    setIsDialogOpen(false)
  }

  const getItemsForDate = (date: Date) => {
    return contentItems.filter((item) => {
      const itemDate = item.date.toDate()
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const renderCalendarView = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center p-6 text-red-500">
          <AlertTriangle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-[400px] w-full" />
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-3">
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
        </div>
        <div className="md:col-span-4">
          <h3 className="text-lg font-medium mb-4">
            {selectedDate ? (
              <span>Content for {selectedDate.toLocaleDateString()}</span>
            ) : (
              <span>Select a date to view content</span>
            )}
          </h3>

          {selectedDate && (
            <div className="space-y-4">
              {getItemsForDate(selectedDate).length === 0 ? (
                <p className="text-muted-foreground">No content scheduled for this date</p>
              ) : (
                getItemsForDate(selectedDate).map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.platform} • {item.formattedTime}
                          </p>
                          <p className="text-sm">{item.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openDeleteDialog(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              <Button
                onClick={() => {
                  setSelectedItem(null)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center p-6 text-red-500">
          <AlertTriangle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
      )
    }

    if (contentItems.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No content items found. Click the "Add Content" button to create your first item.
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {contentItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.platform} • {item.formattedDate} • {item.formattedTime}
                  </p>
                  <p className="text-sm">{item.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openDeleteDialog(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <Button
          onClick={() => {
            setSelectedItem(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          {renderCalendarView()}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {renderListView()}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Content" : "Add New Content"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Content title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex items-center">
                <Input
                  id="date"
                  type="date"
                  value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Content description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateItem}>{selectedItem ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

