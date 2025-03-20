"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, Users, LogOut, Menu, X, Home, Link, MessageSquare, CheckSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, userRoles, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!user) {
    return null
  }

  // Check if user is owner, admin, or staff
  const isOwner = userRoles.includes("owner")
  const isAdmin = userRoles.includes("admin") || isOwner
  const isStaff = userRoles.includes("staff") || isAdmin

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-white">BUTERASCP</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push("/dashboard")}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push("/dashboard/calendar")}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Calendar
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push("/dashboard/messages")}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Messages
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push("/dashboard/tasks")}
            >
              <CheckSquare className="mr-3 h-5 w-5" />
              Tasks
            </Button>

            {isStaff && (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push("/dashboard/staff-links")}
              >
                <Link className="mr-3 h-5 w-5" />
                Staff Links
              </Button>
            )}

            {isOwner && (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push("/dashboard/owner-links")}
              >
                <Link className="mr-3 h-5 w-5" />
                Owner Links
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push("/dashboard/users")}
              >
                <Users className="mr-3 h-5 w-5" />
                Users
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Button>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow">
          <div className="flex h-16 items-center px-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4 md:ml-0">
              <h2 className="text-lg font-medium">Dashboard</h2>
            </div>
            <div className="ml-auto flex items-center">
              {user && (
                <div className="flex items-center">
                  <span className="mr-2 text-sm">{user.email}</span>
                  {user.photoURL ? (
                    <img src={user.photoURL || "/placeholder.svg"} alt="Profile" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}

