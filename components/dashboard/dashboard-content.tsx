"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Settings, LogOut } from "lucide-react"
import { getResources } from "@/app/actions/resources"
import { getApplications } from "@/app/actions/applications"
import { toast } from "@/hooks/use-toast"

export function DashboardContent({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState([])
  const [applications, setApplications] = useState([])

  const userRole = user?.role || "staff"
  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin"

  useEffect(() => {
    async function fetchData() {
      if (isOwnerOrAdmin) {
        try {
          const [resourcesResult, applicationsResult] = await Promise.all([getResources(), getApplications()])

          if (resourcesResult.success) {
            setResources(resourcesResult.resources)
          } else {
            toast({
              title: "Error",
              description: resourcesResult.error || "Failed to load resources",
              variant: "destructive",
            })
          }

          if (applicationsResult.success) {
            setApplications(applicationsResult.applications)
          } else {
            toast({
              title: "Error",
              description: applicationsResult.error || "Failed to load applications",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          })
          signOut({ callbackUrl: "/login" })
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [isOwnerOrAdmin])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-[#222222]">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <header className="dashboard-header">
          <h1 className="dashboard-title">{isOwnerOrAdmin ? "OWNER DASHBOARD" : "STAFF DASHBOARD"}</h1>

          <div className="flex items-center gap-4">
            {isOwnerOrAdmin && (
              <Button
                variant="outline"
                className="admin-settings-button"
                onClick={() => router.push("/dashboard/admin-settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Settings
              </Button>
            )}

            <Button
              variant="outline"
              className="bg-[#333333] text-white border-gray-700 hover:bg-[#444444]"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Rest of the dashboard content */}
      </div>
    </div>
  )
}

