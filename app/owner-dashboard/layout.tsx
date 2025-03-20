import type React from "react"
import type { Metadata } from "next"
import OwnerSidebar from "@/components/owner-sidebar"

export const metadata: Metadata = {
  title: "BUTERASCP Owner Dashboard",
  description: "Owner dashboard for BUTERASCP",
}

// Update the layout to prevent sidebar overlap
export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#5a5a5a] text-white flex">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main content */}
      <div className="flex-1 transition-all duration-500 pl-[60px] md:pl-0">{children}</div>
    </div>
  )
}

