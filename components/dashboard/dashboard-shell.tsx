import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "./dashboard-header"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className={cn("flex-1 p-6", className)}>{children}</main>
      </div>
    </div>
  )
}

