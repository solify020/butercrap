"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import SiteGrid from "@/components/site-grid"
import AppGrid from "@/components/app-grid"
import AddLinkDialog from "@/components/add-link-dialog"
import { toast } from "@/hooks/use-toast"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Cookies from "js-cookie"

// Update the LinkItem type to include a color property
export type LinkItem = {
  id: string
  name: string
  url: string
  type: "site" | "app"
  imageUrl?: string
  color?: string
}

export default function StaffDashboard() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [linkType, setLinkType] = useState<"site" | "app">("site")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardReady, setDashboardReady] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // If no user, redirect to login
        router.push("/")
        return
      }

      // Check if we have valid cookies
      const authCookie = Cookies.get("auth")
      const roleCookie = Cookies.get("user-role")

      if (!authCookie || !roleCookie) {
        // If cookies are missing, sign out and redirect
        handleSignOut(false)
        return
      }

      // Set the user and fetch links
      setUser(currentUser)
      setIsLoading(false)
      fetchLinks()
    })

    return () => unsubscribe()
  }, [router])

  // Add a separate effect to trigger the dashboard animation after data is loaded
  useEffect(() => {
    if (!isLoading && links.length >= 0) {
      // Short delay to ensure smooth animation after loading
      const timer = setTimeout(() => {
        setDashboardReady(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading, links])

  const fetchLinks = async () => {
    try {
      setIsLoading(true)

      // Use the secure API endpoint
      const response = await fetch("/api/links/fetch", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch links")
      }

      const data = await response.json()
      console.log("Fetched links:", data.links)
      setLinks(data.links || [])
    } catch (error: any) {
      console.error("Error fetching links:", error)
      toast({
        title: "Error",
        description: `Failed to load links: ${error.message}`,
        variant: "destructive",
      })

      // Set empty links array to prevent UI issues
      setLinks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async (showToast = true) => {
    try {
      // Show signing out screen
      setIsSigningOut(true)

      // Wait a moment before actual sign out to show the animation
      setTimeout(async () => {
        // Call the logout API to clear server-side cookies
        await fetch("/api/auth/logout", { method: "POST" })

        // Sign out from Firebase
        if (auth.currentUser) {
          await firebaseSignOut(auth)
        }

        // Clear client-side cookies
        Cookies.remove("auth")
        Cookies.remove("user-role")
        Cookies.remove("session-token")

        // Show toast if requested
        if (showToast) {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
            variant: "default",
          })
        }

        // Redirect to login page
        router.push("/")
      }, 1000)
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddLink = async (name: string, url: string, type: "site" | "app", imageUrl?: string, color?: string) => {
    // Optimistically update UI first for faster feedback
    const tempId = `temp-${Date.now()}`
    const newLink = { id: tempId, name, url, type, imageUrl, color }

    // Update state immediately
    setLinks((prevLinks) => [...prevLinks, newLink])
    setIsAddDialogOpen(false)

    // Show toast immediately
    toast({
      title: "Adding...",
      description: `Adding ${type === "site" ? "site" : "app"}: ${name}`,
      variant: "default",
    })

    try {
      // Use the API endpoint
      const response = await fetch("/api/links/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, url, type, imageUrl, color }),
      })

      if (!response.ok) {
        throw new Error("Failed to add link")
      }

      const data = await response.json()

      // Update with real ID once we have it
      setLinks((prevLinks) => prevLinks.map((link) => (link.id === tempId ? { ...link, id: data.id } : link)))

      toast({
        title: "Success",
        description: `${type === "site" ? "Site" : "App"} added successfully.`,
        variant: "default",
      })
    } catch (error: any) {
      // Remove temporary item if there was an error
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== tempId))

      console.error("Error adding link:", error)
      toast({
        title: "Error",
        description: `Failed to add ${type === "site" ? "site" : "app"}: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      // Optimistically update UI
      setLinks(links.filter((link) => link.id !== id))

      // Use the API endpoint
      const response = await fetch(`/api/links/delete?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete link")
      }

      toast({
        title: "Success",
        description: "Item deleted successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error deleting link:", error)

      // Revert the optimistic update
      fetchLinks()

      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const openAddResourceDialog = () => {
    setLinkType("site")
    setIsAddDialogOpen(true)
  }

  const openAddAppDialog = () => {
    setLinkType("app")
    setIsAddDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#5a5a5a]">
        <div className="bg-[#454545] p-8 rounded-full shadow-lg mb-6 pulse-glow">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </div>
        <p className="text-white text-xl font-medium slide-in-up">Loading your dashboard...</p>
      </div>
    )
  }

  if (isSigningOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#5a5a5a]">
        <div className="bg-[#454545] p-8 rounded-full shadow-lg mb-6 pulse-glow">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </div>
        <p className="text-white text-xl font-medium slide-in-up">Signing out...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5a5a5a]">
        <div className="bg-[#454545] p-8 rounded-xl shadow-lg border border-[#666666] max-w-md slide-in-up">
          <p className="text-center text-white text-xl mb-6">Please log in to access the dashboard</p>
          <Button onClick={() => router.push("/")} className="w-full bg-accent hover:bg-accent/90 text-white py-6">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const siteLinks = links.filter((link) => link.type === "site")
  const appLinks = links.filter((link) => link.type === "app")

  return (
    <div
      className={`min-h-screen bg-[#5a5a5a] text-white ${dashboardReady ? "dashboard-container-animation" : "opacity-0"}`}
    >
      <header
        className="flex justify-between items-center p-6 bg-[#333333] shadow-md ios-zoom-in force-animation"
        style={{ animationDelay: "100ms", opacity: dashboardReady ? 1 : 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">BUTERASCP STAFF</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSignOut()}
            className="bg-[#333333] text-white border-[#666666]/30 hover:bg-[#3a3a3a] hover:border-white/50 transition-colors rounded-md px-4 py-2 h-auto ios-zoom-in force-animation"
            style={{ animationDelay: "200ms", opacity: dashboardReady ? 1 : 0 }}
          >
            <LogOut className="mr-2 h-5 w-5 text-accent" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Sites Section - No surrounding box */}
        <div className="relative z-50">
          <SiteGrid sites={siteLinks} onDelete={handleDeleteLink} onAdd={openAddResourceDialog} />
        </div>

        {/* Horizontal Divider */}
        <div
          className="h-0.5 bg-[#666666]/80 mx-2 rounded-full shadow-sm ios-zoom-in force-animation"
          style={{ animationDelay: "500ms", opacity: dashboardReady ? 1 : 0 }}
        ></div>

        {/* Apps Section - No surrounding box */}
        <div className="relative z-50">
          <AppGrid apps={appLinks} onDelete={handleDeleteLink} onAdd={openAddAppDialog} />
        </div>
      </main>

      <AddLinkDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddLink}
        type={linkType}
      />
    </div>
  )
}

