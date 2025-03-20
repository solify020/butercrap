"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import SiteGrid from "@/components/site-grid"
import AppGrid from "@/components/app-grid"
import AddLinkDialog from "@/components/add-link-dialog"

export type LinkItem = {
  id: string
  name: string
  url: string
  type: "site" | "app"
  imageUrl?: string
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [linkType, setLinkType] = useState<"site" | "app">("site")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsLoading(false)

      if (!currentUser) {
        router.push("/")
      } else {
        fetchLinks()
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchLinks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "links"))
      const linksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LinkItem[]

      setLinks(linksData)
    } catch (error) {
      console.error("Error fetching links:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAddLink = async (name: string, url: string, type: "site" | "app") => {
    try {
      const docRef = await addDoc(collection(db, "links"), {
        name,
        url,
        type,
      })

      setLinks([...links, { id: docRef.id, name, url, type }])
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding link:", error)
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, "links", id))
      setLinks(links.filter((link) => link.id !== id))
    } catch (error) {
      console.error("Error deleting link:", error)
    }
  }

  const openAddSiteDialog = () => {
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
        <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
        <p className="text-white text-xl font-medium">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5a5a5a]">
        <div className="bg-[#4a4a4a] p-6 rounded-lg shadow-lg">
          <p className="text-white text-xl">Please log in to access the dashboard</p>
          <Button onClick={() => router.push("/")} className="mt-4 w-full bg-[#3a3a3a] hover:bg-[#2a2a2a]">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const siteLinks = links.filter((link) => link.type === "site")
  const appLinks = links.filter((link) => link.type === "app")

  return (
    <div className="min-h-screen bg-[#5a5a5a] text-white">
      <header className="flex justify-between items-center p-6 bg-[#4a4a4a] shadow-md">
        <h1 className="text-3xl font-bold tracking-tight">BUTERASCP STAFF</h1>
        <Button variant="ghost" onClick={handleSignOut} className="text-white hover:bg-[#3a3a3a] transition-colors">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-12">
        <section className="bg-[#4a4a4a] rounded-xl p-8 shadow-lg">
          <SiteGrid sites={siteLinks} onDelete={handleDeleteLink} onAdd={openAddSiteDialog} />
        </section>

        <section className="bg-[#4a4a4a] rounded-xl p-8 shadow-lg">
          <AppGrid apps={appLinks} onDelete={handleDeleteLink} onAdd={openAddAppDialog} />
        </section>
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

