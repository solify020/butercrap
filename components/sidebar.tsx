"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Settings,
  FileText,
  CheckSquare,
  Database,
  Shield,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  portalType: "owner" | "staff"
}

export function Sidebar({ portalType }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { isOwner } = useAuth()
  const isMobile = useMobile()

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  const ownerNavItems = [
    {
      title: "Dashboard",
      href: "/owner",
      icon: LayoutDashboard,
    },
    {
      title: "Content Calendar",
      href: "/owner/calendar",
      icon: Calendar,
    },
    {
      title: "Tasks",
      href: "/owner/tasks",
      icon: CheckSquare,
    },
    {
      title: "Team Chat",
      href: "/owner/chat",
      icon: MessageSquare,
    },
    {
      title: "Mega Integration",
      href: "/owner/mega",
      icon: Database,
    },
    {
      title: "Followers",
      href: "/owner/followers",
      icon: FileText,
    },
    {
      title: "Admin Settings",
      href: "/owner/admin",
      icon: Settings,
    },
  ]

  const staffNavItems = [
    {
      title: "Dashboard",
      href: "/staff",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      href: "/staff/tasks",
      icon: CheckSquare,
    },
    {
      title: "Team Chat",
      href: "/staff/chat",
      icon: MessageSquare,
    },
    {
      title: "Discord Logs",
      href: "/staff/discord",
      icon: Shield,
    },
  ]

  const navItems = portalType === "owner" ? ownerNavItems : staffNavItems

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background border-r transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b">
        <h1
          className={cn("font-bold text-xl transition-all duration-300 overflow-hidden", collapsed ? "w-0" : "w-full")}
        >
          {collapsed ? "" : "BUTERASCP"}
        </h1>
        {collapsed && <span className="font-bold text-sm">BSCP</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                collapsed && "justify-center",
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}

