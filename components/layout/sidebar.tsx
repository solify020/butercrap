"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, ChevronLeft, ChevronRight, FileText, Home, LinkIcon, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/dashboard/follower-tracker",
      icon: Users,
      label: "Follower Tracker",
    },
    {
      href: "/content-calendar",
      icon: Calendar,
      label: "Content Calendar",
    },
    {
      href: "/dashboard/mega",
      icon: LinkIcon,
      label: "Mega Integration",
    },
    {
      href: "/dashboard/staff-tasks",
      icon: FileText,
      label: "Staff Tasks",
    },
    {
      href: "/dashboard/admin",
      icon: Settings,
      label: "Admin Settings",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "bg-[#444444] text-white flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-[250px]",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h1
            className={cn(
              "font-bold text-xl transition-all duration-300 pl-1",
              collapsed ? "scale-0 w-0" : "scale-100 w-auto",
            )}
          >
            BUTERASCP
          </h1>
          <h1
            className={cn(
              "font-bold text-xl transition-all duration-300 absolute left-4",
              collapsed ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          >
            BSCP
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white hover:bg-gray-700 ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            <TooltipProvider>
              {routes.map((route) => (
                <Tooltip key={route.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md transition-colors",
                        pathname === route.href
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#555555]",
                        collapsed ? "justify-center" : "justify-start",
                      )}
                    >
                      <route.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                      {!collapsed && <span>{route.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{route.label}</TooltipContent>}
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#333333]">{children}</main>
    </div>
  )
}

