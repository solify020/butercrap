import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"

export default function ContentCalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px]">{children}</div>
    </div>
  )
}

