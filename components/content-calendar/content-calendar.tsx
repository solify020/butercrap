"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Set up the localizer
const localizer = momentLocalizer(moment)

// Define event interface
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  platform?: string
  allDay?: boolean
}

export function ContentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Sample Content Post",
      start: new Date(2023, 5, 15, 10, 0),
      end: new Date(2023, 5, 15, 11, 0),
      description: "This is a sample content post",
      platform: "Twitter",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    start: new Date(),
    end: new Date(),
    description: "",
    platform: "",
    allDay: false,
  })

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({
      title: "",
      start,
      end,
      description: "",
      platform: "",
      allDay: false,
    })
    setIsDialogOpen(true)
  }

  const handleSaveEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      setEvents([
        ...events,
        {
          id: Date.now().toString(),
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          platform: newEvent.platform,
          allDay: newEvent.allDay,
        } as CalendarEvent,
      ])
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Content Calendar</h2>
        <Button
          onClick={() => {
            setNewEvent({
              title: "",
              start: new Date(),
              end: new Date(),
              description: "",
              platform: "",
              allDay: false,
            })
            setIsDialogOpen(true)
          }}
        >
          Add Event
        </Button>
      </div>

      <div className="flex-1 rounded-md border">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          selectable
          onSelectSlot={handleSelect}
          eventPropGetter={(event) => {
            let backgroundColor = "#3182ce"

            switch (event.platform) {
              case "Twitter":
                backgroundColor = "#1DA1F2"
                break
              case "Instagram":
                backgroundColor = "#E1306C"
                break
              case "Facebook":
                backgroundColor = "#4267B2"
                break
              case "YouTube":
                backgroundColor = "#FF0000"
                break
              case "TikTok":
                backgroundColor = "#000000"
                break
              default:
                backgroundColor = "#3182ce"
            }

            return {
              style: {
                backgroundColor,
              },
            }
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Content Event</DialogTitle>
            <DialogDescription>Create a new content event for your calendar.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={newEvent.start ? moment(newEvent.start).format("YYYY-MM-DDTHH:mm") : ""}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={newEvent.end ? moment(newEvent.end).format("YYYY-MM-DDTHH:mm") : ""}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description || ""}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={newEvent.platform || ""}
                onValueChange={(value) => setNewEvent({ ...newEvent, platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-day"
                checked={newEvent.allDay || false}
                onCheckedChange={(checked) => setNewEvent({ ...newEvent, allDay: checked as boolean })}
              />
              <Label htmlFor="all-day">All day event</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

