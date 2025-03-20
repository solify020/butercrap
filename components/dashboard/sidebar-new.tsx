"use client"

import { useState, useEffect } from "react"
import { BarChart3, Calendar, Cog, FileText, LayoutDashboard, List, Menu, Settings, Users, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SidebarProps {
  userRole?: "owner" | "staff"
}

export function DashboardSidebarNew({ userRole = "owner" }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true) // Start collapsed by default

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const ownerNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Admin Settings",
      icon: Cog,
      href: "/dashboard/admin",
    },
    {
      title: "Follower Tracker",
      icon: Users,
      href: "/dashboard/follower-tracker",
    },
    {
      title: "Content Calendar",
      icon: Calendar,
      href: "/dashboard/content-calendar",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
    {
      title: "Staff Tasks",
      icon: List,
      href: "/dashboard/staff-tasks",
    },
    {
      title: "Mega Integration",
      icon: FileText,
      href: "/dashboard/mega",
    },
  ]

  const staffNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Tasks",
      icon: List,
      href: "/dashboard/tasks",
    },
    {
      title: "Content Calendar",
      icon: Calendar,
      href: "/dashboard/content-calendar",
    },
    {
      title: "Moderation Logs",
      icon: FileText,
      href: "/dashboard/moderation-logs",
    },
    {
      title: "Guidelines",
      icon: FileText,
      href: "/dashboard/guidelines",
    },
  ]

  const navItems = userRole === "owner" ? ownerNavItems : staffNavItems

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-[40] md:hidden backdrop-blur-md border-border"
        style={{
          backgroundColor: "rgba(51, 51, 51, 0.75)",
          color: "white",
          borderColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[30] bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - LOWER z-index to go UNDER apps and resources */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[20] transform transition-all duration-300 ease-in-out",
          "backdrop-blur-xl border-r border-border/30",
          "shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
        style={{
          backgroundColor: "rgba(51, 51, 51, 0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Close button (mobile only) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-2 md:hidden text-foreground hover:bg-accent/50"
          style={{ color: "white", backgroundColor: "transparent" }}
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Toggle button (desktop only) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-2 hidden md:flex text-foreground hover:bg-accent/50"
          style={{ color: "white", backgroundColor: "transparent" }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>

        {/* Header */}
        <div className={cn("p-4", isCollapsed ? "text-center" : "")}>
          <div className={cn("flex items-center", isCollapsed ? "flex-col justify-center gap-1" : "gap-2 mb-4")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <span className="text-lg font-bold">B</span>
            </div>
            {!isCollapsed && <span className="text-lg font-semibold text-white">BSCP Portal</span>}
            {isCollapsed && <span className="text-xs font-semibold text-white mt-1">BSCP</span>}
          </div>

          {/* Search - only show when not collapsed */}
          {!isCollapsed && (
            <div className="relative mt-4">
              <Input
                placeholder="Search..."
                className="pl-8 bg-background/50 border-border/50 text-white placeholder:text-white/50"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={cn("px-3 py-2", isCollapsed ? "px-2" : "")}>
          {!isCollapsed && <div className="mb-2 px-4 text-xs font-semibold text-white/70">Navigation</div>}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-[#333333] text-white"
                    : "text-white/80 hover:bg-[#404040]/50 hover:text-white",
                  isCollapsed ? "flex-col justify-center py-3 px-2" : "gap-3 px-3 py-2",
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6 mb-1" : "h-5 w-5")} />
                {!isCollapsed && <span>{item.title}</span>}
                {isCollapsed && <span className="text-xs">{item.title.split(" ")[0]}</span>}
              </Link>
            ))}
          </nav>

          <div className={cn("my-4 border-t border-white/10", isCollapsed ? "mx-2" : "")} />

          {!isCollapsed && <div className="mb-2 px-4 text-xs font-semibold text-white/70">Settings</div>}
          <nav className="space-y-1">
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                pathname === "/dashboard/settings"
                  ? "bg-[#333333] text-white"
                  : "text-white/80 hover:bg-[#404040]/50 hover:text-white",
                isCollapsed ? "flex-col justify-center py-3 px-2" : "gap-3 px-3 py-2",
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <Settings className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6 mb-1" : "h-5 w-5")} />
              {!isCollapsed && <span>Settings</span>}
              {isCollapsed && <span className="text-xs">Settings</span>}
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 border-t border-white/10 p-4",
            "backdrop-blur-xl",
            isCollapsed ? "flex flex-col items-center" : "",
          )}
          style={{
            backgroundColor: "rgba(50, 50, 50, 0.85)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className={cn("flex items-center", isCollapsed ? "flex-col" : "gap-2")}>
            <div className="h-8 w-8 overflow-hidden rounded-full bg-white/10">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="User avatar"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">User Name</span>
                <span className="text-xs text-white/70">{userRole === "owner" ? "Owner" : "Staff"}</span>
              </div>
            )}
            {isCollapsed && <span className="text-xs text-white mt-1">{userRole === "owner" ? "Owner" : "Staff"}</span>}
          </div>
        </div>
      </div>

      {/* Main content wrapper with proper margin */}
      <div
        className={cn("min-h-screen transition-all duration-300 ease-in-out", isCollapsed ? "md:ml-20" : "md:ml-64")}
      >
        {/* This div ensures the content is properly positioned */}
      </div>
    </>
  )
}

