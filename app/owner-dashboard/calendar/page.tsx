"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { CalendarIcon, Plus, Loader2, User, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isToday } from "date-fns"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Improved CalendarEvent interface
interface CalendarEvent {
  id: string
  date: string // ISO string format
  title: string
  notes: string
  ownerUsername: string
  color?: string
}

export default function ContentCalendarPage() {
  // Use null as initial state to prevent SSR date issues
  const [date, setDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([])
  const [isViewingEvent, setIsViewingEvent] = useState(false)
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null)
  const [isClient, setIsClient] = useState(false)

  const [eventForm, setEventForm] = useState({
    title: "",
    notes: "",
    ownerUsername: "",
    color: "#3b82f6", // Default blue color
  })

  // Initialize dates only on client-side
  useEffect(() => {
    setIsClient(true)
    setDate(new Date())
    setCurrentMonth(new Date())
  }, [])

  // Predefined colors for events
  const eventColors = [
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Yellow" },
    { value: "#ef4444", label: "Red" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
    { value: "#6b7280", label: "Gray" },
  ]

  // Fetch events from Firestore
  const fetchEvents = async () => {
    if (!currentMonth) return

    setIsLoading(true)
    try {
      const eventsCollection = collection(db, "calendar-events")

      // Get the start and end of the current month
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)

      // Format dates for query
      const startStr = format(start, "yyyy-MM-dd")
      const endStr = format(end, "yyyy-MM-dd")

      // Query events for the current month
      const q = query(eventsCollection, where("date", ">=", startStr), where("date", "<=", endStr))

      const eventsSnapshot = await getDocs(q)
      const eventsList = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[]

      setEvents(eventsList)

      // Update selected date events
      if (date) {
        updateSelectedDateEvents(date, eventsList)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update selected date events when date changes
  const updateSelectedDateEvents = (selectedDate: Date, eventsList: CalendarEvent[] = events) => {
    const dateString = format(selectedDate, "yyyy-MM-dd")
    const filteredEvents = eventsList.filter((event) => event.date.startsWith(dateString))
    setSelectedDateEvents(filteredEvents)
  }

  // Fetch events when month changes
  useEffect(() => {
    if (currentMonth) {
      fetchEvents()
    }
  }, [currentMonth])

  // Update selected date events when date changes
  useEffect(() => {
    if (date) {
      updateSelectedDateEvents(date)
    }
  }, [date, events])

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate || null)
    if (newDate) {
      updateSelectedDateEvents(newDate)
    }
  }

  // Handle month navigation
  const handlePrevMonth = () => {
    if (currentMonth) {
      setCurrentMonth(subMonths(currentMonth, 1))
    }
  }

  const handleNextMonth = () => {
    if (currentMonth) {
      setCurrentMonth(addMonths(currentMonth, 1))
    }
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle add event
  const handleAddEvent = async () => {
    if (!date) return

    if (!eventForm.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a title for the event",
        variant: "destructive",
      })
      return
    }

    if (!eventForm.ownerUsername.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your username",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Create event object
      const newEvent = {
        date: format(date, "yyyy-MM-dd"),
        title: eventForm.title,
        notes: eventForm.notes,
        ownerUsername: eventForm.ownerUsername,
        color: eventForm.color,
      }

      const docRef = await addDoc(collection(db, "calendar-events"), newEvent)

      // Add the new event to the state
      setEvents((prev) => [...prev, { id: docRef.id, ...newEvent }])

      toast({
        title: "Post added",
        description: "Your post has been added to the calendar",
      })

      // Reset form and close dialog
      setEventForm({ title: "", notes: "", ownerUsername: "", color: "#3b82f6" })
      setIsAddEventOpen(false)
    } catch (error) {
      console.error("Error adding event:", error)
      toast({
        title: "Error",
        description: "Failed to add post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle edit event
  const handleEditEvent = async () => {
    if (!selectedEvent) return

    if (!eventForm.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a title for the post",
        variant: "destructive",
      })
      return
    }

    if (!eventForm.ownerUsername.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your username",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const updatedEvent = {
        title: eventForm.title,
        notes: eventForm.notes,
        ownerUsername: eventForm.ownerUsername,
        color: eventForm.color,
      }

      await updateDoc(doc(db, "calendar-events", selectedEvent.id), updatedEvent)

      // Update the event in the state
      setEvents((prev) => prev.map((event) => (event.id === selectedEvent.id ? { ...event, ...updatedEvent } : event)))

      toast({
        title: "Post updated",
        description: "Your post has been updated",
      })

      // Reset form and close dialog
      setEventForm({ title: "", notes: "", ownerUsername: "", color: "#3b82f6" })
      setIsEditEventOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      await deleteDoc(doc(db, "calendar-events", eventId))

      // Remove the event from the state
      setEvents((prev) => prev.filter((event) => event.id !== eventId))

      // Close the view dialog if we're deleting the currently viewed event
      if (viewingEvent?.id === eventId) {
        setIsViewingEvent(false)
        setViewingEvent(null)
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  // Get days with events for the current month view
  const daysWithEvents = useMemo(() => {
    if (!currentMonth) return {}

    const result: Record<string, CalendarEvent[]> = {}

    events.forEach((event) => {
      const dateStr = event.date
      if (!result[dateStr]) {
        result[dateStr] = []
      }
      result[dateStr].push(event)
    })

    return result
  }, [events, currentMonth])

  // Custom day rendering for the calendar - only run on client
  const renderDay = (day: Date) => {
    if (!isClient) return <div>{day.getDate()}</div>

    try {
      const dateStr = format(day, "yyyy-MM-dd")
      const dayEvents = daysWithEvents[dateStr] || []
      const hasEvents = dayEvents.length > 0

      return (
        <div className="relative w-full h-full">
          <div className={`absolute inset-0 flex items-center justify-center ${isToday(day) ? "font-bold" : ""}`}>
            {day.getDate()}
          </div>
          {hasEvents && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
              {dayEvents.slice(0, 3).map((event, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: event.color || "#3b82f6" }}
                />
              ))}
              {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
            </div>
          )}
        </div>
      )
    } catch (error) {
      console.error("Error rendering day:", error)
      return <div>{day.getDate()}</div>
    }
  }

  // If not client-side yet, show a loading state
  if (!isClient) {
    return (
      <div className="min-h-screen animate-fadeIn flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      <header className="p-6 bg-[#333333] shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight ml-8 md:ml-0">Content Calendar</h1>
        <Button
          onClick={() => {
            setEventForm({ title: "", notes: "", ownerUsername: "", color: "#3b82f6" })
            setIsAddEventOpen(true)
          }}
          className="bg-accent hover:bg-accent/90 text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md transform hover:translate-y-[-2px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Calendar - Expanded to full width on mobile, 5 columns on desktop */}
          <Card className="bg-[#333333] border-[#666666]/30 text-white md:col-span-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-lg hover:border-accent/40 transform hover:translate-y-[-2px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-accent" />
                  Content Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="h-8 w-8 p-0 bg-[#444444] border-[#666666]/30 text-white hover:bg-[#555555]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium min-w-[120px] text-center">
                    {currentMonth ? format(currentMonth, "MMMM yyyy") : ""}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0 bg-[#444444] border-[#666666]/30 text-white hover:bg-[#555555]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-gray-400">Select a date to view or add posts</CardDescription>
            </CardHeader>
            <CardContent>
              {currentMonth && isClient && (
                <Calendar
                  mode="single"
                  selected={date || undefined}
                  onSelect={handleDateChange}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border border-[#444444]"
                  components={{
                    Day: ({ day, ...props }) => {
                      try {
                        return (
                          <button
                            {...props}
                            className={`relative h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent/20 rounded-md ${
                              isClient && isToday(day) ? "bg-[#444444] text-white font-bold" : ""
                            }`}
                          >
                            {renderDay(day)}
                          </button>
                        )
                      } catch (error) {
                        console.error("Error rendering calendar day:", error)
                        return <button {...props}>{day.getDate()}</button>
                      }
                    },
                  }}
                  classNames={{
                    day_today: "bg-[#444444] text-white font-bold",
                    day_selected: "bg-accent/30 text-white font-bold",
                    nav_button: "text-accent hover:bg-accent/20",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    caption: "flex justify-center py-2 relative items-center",
                    caption_label: "text-sm font-medium",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Selected Date Events - 2 columns on desktop */}
          <Card className="bg-[#333333] border-[#666666]/30 text-white md:col-span-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-lg hover:border-accent/40 transform hover:translate-y-[-2px]">
            <CardHeader>
              <CardTitle>{date ? format(date, "MMMM d, yyyy") : "Select a date"}</CardTitle>
              <CardDescription className="text-gray-400">
                {selectedDateEvents.length === 0
                  ? "No posts scheduled for this date"
                  : `${selectedDateEvents.length} post${selectedDateEvents.length !== 1 ? "s" : ""} scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No posts scheduled for this date</p>
                      <Button
                        onClick={() => {
                          setEventForm({ title: "", notes: "", ownerUsername: "", color: "#3b82f6" })
                          setIsAddEventOpen(true)
                        }}
                        variant="outline"
                        className="mt-4 bg-transparent border-[#666666]/30 text-white hover:bg-[#444444]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Post
                      </Button>
                    </div>
                  ) : (
                    selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-[#444444] rounded-lg p-4 relative hover:bg-[#4a4a4a] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md transform hover:translate-y-[-2px] hover:scale-[1.01] cursor-pointer"
                        onClick={() => {
                          setViewingEvent(event)
                          setIsViewingEvent(true)
                        }}
                        style={{ borderLeft: `4px solid ${event.color || "#3b82f6"}` }}
                      >
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-[#555555]"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(event)
                              setEventForm({
                                title: event.title,
                                notes: event.notes,
                                ownerUsername: event.ownerUsername,
                                color: event.color || "#3b82f6",
                              })
                              setIsEditEventOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-[#555555]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEvent(event.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <h3 className="font-medium text-lg mb-2 pr-16">{event.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{event.ownerUsername}</span>
                        </div>
                        {event.notes && (
                          <p className="text-gray-300 text-sm mt-2 line-clamp-2 whitespace-pre-wrap">{event.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="bg-[#333333] text-white border-[#666666]/30">
          <DialogHeader>
            <DialogTitle>Add Post</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new post to the calendar for {date ? format(date, "MMMM d, yyyy") : "selected date"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Post Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter post title"
                value={eventForm.title}
                onChange={handleInputChange}
                className="bg-[#444444] border-[#666666]/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ownerUsername" className="text-sm font-medium">
                Owner Username
              </label>
              <Input
                id="ownerUsername"
                name="ownerUsername"
                placeholder="Your username"
                value={eventForm.ownerUsername}
                onChange={handleInputChange}
                className="bg-[#444444] border-[#666666]/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {eventColors.map((color) => (
                  <div
                    key={color.value}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${
                      eventForm.color === color.value ? "ring-2 ring-white scale-110" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEventForm((prev) => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any details about this post"
                value={eventForm.notes}
                onChange={handleInputChange}
                className="bg-[#444444] border-[#666666]/30 text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEventOpen(false)}
              className="bg-transparent border-[#666666]/30 text-white hover:bg-[#444444]"
            >
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="bg-[#333333] text-white border-[#666666]/30">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription className="text-gray-400">
              Edit post details for {date ? format(date, "MMMM d, yyyy") : "selected date"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Post Title
              </label>
              <Input
                id="edit-title"
                name="title"
                placeholder="Enter post title"
                value={eventForm.title}
                onChange={handleInputChange}
                className="bg-[#444444] border-[#666666]/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-ownerUsername" className="text-sm font-medium">
                Owner Username
              </label>
              <Input
                id="edit-ownerUsername"
                name="ownerUsername"
                placeholder="Your username"
                value={eventForm.ownerUsername}
                onChange={handleInputChange}
                className="bg-[#444444] border-[#666666]/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {eventColors.map((color) => (
                  <div
                    key={color.value}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${
                      eventForm.color === color.value ? "ring-2 ring-white scale-110" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEventForm((prev) => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="edit-notes"
                name="notes"
                placeholder="Add any details about this post"
                value={eventForm.notes}
                onChange={handleInputChange}
                className="bg-[#444444] border-[#666666]/30 text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditEventOpen(false)
                setSelectedEvent(null)
              }}
              className="bg-transparent border-[#666666]/30 text-white hover:bg-[#444444]"
            >
              Cancel
            </Button>
            <Button onClick={handleEditEvent} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewingEvent} onOpenChange={setIsViewingEvent}>
        <DialogContent className="bg-[#333333] text-white border-[#666666]/30">
          {viewingEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: viewingEvent.color || "#3b82f6" }} />
                  <DialogTitle>{viewingEvent.title}</DialogTitle>
                </div>
                <DialogDescription className="text-gray-400">
                  {format(new Date(viewingEvent.date), "MMMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{viewingEvent.ownerUsername}</span>
                </div>
                {viewingEvent.notes && (
                  <div className="bg-[#444444] p-4 rounded-md">
                    <p className="text-gray-300 whitespace-pre-wrap">{viewingEvent.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteEvent(viewingEvent.id)
                  }}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewingEvent(false)}
                    className="bg-transparent border-[#666666]/30 text-white hover:bg-[#444444]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedEvent(viewingEvent)
                      setEventForm({
                        title: viewingEvent.title,
                        notes: viewingEvent.notes,
                        ownerUsername: viewingEvent.ownerUsername,
                        color: viewingEvent.color || "#3b82f6",
                      })
                      setIsViewingEvent(false)
                      setIsEditEventOpen(true)
                    }}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

