import type React from "react"
import { Suspense } from "react"
import ContentCalendarClient from "./client"

export default function ContentCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContentCalendarClient />
    </Suspense>
  )
}

