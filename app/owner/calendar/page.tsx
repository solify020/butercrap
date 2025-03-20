"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface CalendarNote {
  id: string
  title: string
  notes: string
  date: Timestamp
  createdBy: string
  createdAt: Timestamp
}

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [notes, setNotes] = useState<CalendarNote[]>([])
  const [newNote, setNewNote] = useState({ title: "", notes: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  const fetchNotes = async () => {
    if (!user) return

    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const q = query(
        collection(db, "calendar"),
        where("date", ">=", Timestamp.fromDate(startOfMonth)),
        where("date", "<=", Timestamp.fromDate(endOfMonth)),
      )

      const querySnapshot = await getDocs(q)
      const fetchedNotes: CalendarNote[] = []

      querySnapshot.forEach((doc) => {
        fetchedNotes.push({
          id: doc.id,
          ...(doc.data() as Omit<CalendarNote, "id">),
        })
      })

      setNotes(fetchedNotes)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar notes",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [currentDate, user, toast])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const handleAddNote = async () => {
    if (!user || !selectedDate) return

    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the note",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, "calendar"), {
        title: newNote.title,
        notes: newNote.notes,
        date: Timestamp.fromDate(selectedDate),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setNewNote({ title: "", notes: "" })
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Note added successfully",
      })

      fetchNotes()
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderCalendar = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDate = new Date(monthStart)
    const endDate = new Date(monthEnd)

    // Adjust start date to begin on Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    // Adjust end date to end on Saturday
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const rows = []
    let days_array = []
    const day = new Date(startDate)

    // Add days of week header
    rows.push(
      <div key="header" className="grid grid-cols-7 gap-1 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center font-medium text-sm py-2">
            {d}
          </div>
        ))}
      </div>,
    )

    // Create calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day)
        const formattedDate = cloneDay.getDate()
        const isCurrentMonth = cloneDay.getMonth() === currentDate.getMonth()

        // Check if there are notes for this day
        const hasNotes = notes.some((note) => {
          const noteDate = note.date.toDate()
          return (
            noteDate.getDate() === cloneDay.getDate() &&
            noteDate.getMonth() === cloneDay.getMonth() &&
            noteDate.getFullYear() === cloneDay.getFullYear()
          )
        })

        days_array.push(
          <div
            key={cloneDay.toString()}
            className={`
              relative min-h-[80px] p-2 border rounded-md transition-all
              ${isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground"}
              ${hasNotes ? "ring-2 ring-primary/20" : ""}
              hover:bg-accent hover:text-accent-foreground cursor-pointer
            `}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="text-right">{formattedDate}</div>
            {hasNotes && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="h-1 bg-primary rounded-full"></div>
              </div>
            )}
          </div>,
        )
        day.setDate(day.getDate() + 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1">
          {days_array}
        </div>,
      )
      days_array = []
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{dateFormat.format(currentDate)}</h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {rows}
      </div>
    )
  }

  return (
    <>
      <Header title="Content Calendar" portalType="owner" />
      <div className="flex-1 p-4 animate-in fade-in-50 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Content Calendar</h2>
          <Button
            onClick={() => {
              setSelectedDate(new Date())
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <Card>
            <CardHeader>
              <CardTitle>Monthly View</CardTitle>
            </CardHeader>
            <CardContent>{renderCalendar()}</CardContent>
          </Card>
        </ScrollArea>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDate ? `Add Note for ${selectedDate.toLocaleDateString()}` : "Add Note"}
              </DialogTitle>
              <DialogDescription>Create a new note for the selected date.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter note details"
                  value={newNote.notes}
                  onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={loading}>
                {loading ? "Adding..." : "Add Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

