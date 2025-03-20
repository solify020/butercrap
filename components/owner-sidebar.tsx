"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, Home, Calendar, Users, Settings, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function OwnerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Add a slight delay before starting animations
    const timer = setTimeout(() => {
      setIsAnimated(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/owner",
      icon: Home,
    },
    {
      name: "Content Calendar",
      href: "/content-calendar",
      icon: Calendar,
    },
    {
      name: "Follower Tracker",
      href: "/owner/follower-tracker",
      icon: Users,
    },
    {
      name: "Mega",
      href: "/owner/mega",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/owner/settings",
      icon: Settings,
    },
  ]

  return (
    <div
      className={cn(
        "sidebar sidebar-z-index-fix fixed",
        isCollapsed ? "collapsed" : "",
        isAnimated ? "opacity-100" : "opacity-0",
        "transition-opacity duration-500",
      )}
    >
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="sidebar-logo slide-in-left" style={{ animationDelay: "400ms" }}>
            {isCollapsed ? "BSCP" : "BUTERASCP PORTAL"}
          </div>
          <button
            onClick={toggleSidebar}
            className="sidebar-toggle slide-in-right"
            style={{ animationDelay: "400ms" }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight /> : <X />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-link", pathname === item.href ? "active" : "", "slide-in-left")}
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <item.icon className="h-5 w-5" />
              <span className="sidebar-link-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user slide-in-left" style={{ animationDelay: "1000ms" }}>
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-xs text-[#999999]">Owner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

