"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Settings,
  Calendar,
  LinkIcon,
  Menu,
  X,
  UserCheck,
  FileText,
  ImageIcon,
} from "lucide-react"

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isOwner = user?.role === "owner"
  const isStaff = user?.role === "staff"

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Links",
      href: "/links",
      icon: <LinkIcon className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Content",
      href: "/content",
      icon: <FileText className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Images",
      href: "/images",
      icon: <ImageIcon className="h-5 w-5" />,
      show: true,
    },
    {
      title: "Followers",
      href: "/followers",
      icon: <UserCheck className="h-5 w-5" />,
      show: true,
    },
    {
      title: "User Management",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
      show: isOwner,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      show: isOwner,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-[#646464]"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          mounted ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/dashboard" onClick={closeSidebar}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#999999] flex items-center justify-center">
                  <span className="text-white font-semibold">B</span>
                </div>
                <span className="text-lg font-semibold text-[#646464]">Butera SCP</span>
              </div>
            </Link>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems
                .filter((item) => item.show)
                .map((item, index) => (
                  <Link key={item.href} href={item.href} onClick={closeSidebar}>
                    <div
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        pathname === item.href ? "bg-[#999999] text-white" : "text-[#646464] hover:bg-[#64646410]",
                        "animate-in",
                        { "delay-100": index === 0 },
                        { "delay-150": index === 1 },
                        { "delay-200": index === 2 },
                        { "delay-250": index === 3 },
                        { "delay-300": index === 4 },
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                  </Link>
                ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#646464] flex items-center justify-center">
                <span className="text-white text-sm">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#646464] truncate">{user?.email || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={closeSidebar} />}
    </>
  )
}

