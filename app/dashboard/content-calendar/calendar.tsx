"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  subMonths,
  addMonths,
} from "date-fns"

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const header = () => {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="col-start-1 col-end-3">
          <h2 className="text-lg font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  const days = () => {
    const dateFormat = "EEE"
    const daysArray = []

    const startDate = startOfWeek(currentMonth)

    for (let i = 0; i < 7; i++) {
      daysArray.push(
        <div key={i} className="col-start-auto col-end-auto text-center p-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>,
      )
    }

    return <div className="grid grid-cols-7">{daysArray}</div>
  }

  const cells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const rows = []

    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat)
        const cloneDay = day

        days.push(
          <div
            className={`min-h-[100px] bg-[#3A3A3A] p-2 rounded-md border border-gray-600 ${
              isSameDay(day, new Date()) ? "ring-2 ring-blue-500" : ""
            }`}
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={`number ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}>{formattedDate}</span>
            {/* Event cards */}
            <div className="mt-2">
              <div className="bg-[#555555] p-2 rounded text-sm mb-1 border border-gray-600">Event 1</div>
              <div className="bg-[#555555] p-2 rounded text-sm mb-1 border border-gray-600">Event 2</div>
            </div>
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>,
      )
      days = []
    }
    return <div className="">{rows}</div>
  }

  return (
    <div className="bg-[#444444] rounded-lg border border-gray-600 p-4">
      {header()}
      {days()}
      {cells()}
    </div>
  )
}

export default Calendar

