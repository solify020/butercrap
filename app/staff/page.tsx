"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, ExternalLink, Loader2 } from "lucide-react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

interface LinkType {
  id: string
  title: string
  url: string
  description: string
  category: "resource" | "app"
  icon: string
  order: number
}

export default function StaffDashboard() {
  const [resources, setResources] = useState<LinkType[]>([])
  const [apps, setApps] = useState<LinkType[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const { user, loading, isOwner, isStaff } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isOwner && !isStaff) {
      router.push("/")
    }
  }, [loading, isOwner, isStaff, router])

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "links"), where("portalType", "in", ["staff", "both"]), orderBy("order"))

        const querySnapshot = await getDocs(q)
        const fetchedLinks: LinkType[] = []

        querySnapshot.forEach((doc) => {
          fetchedLinks.push({
            id: doc.id,
            ...(doc.data() as Omit<LinkType, "id">),
          })
        })

        setResources(fetchedLinks.filter((link) => link.category === "resource"))
        setApps(fetchedLinks.filter((link) => link.category === "app"))
      } catch (error) {
        console.error("Error fetching links:", error)
      }
    }

    fetchLinks()
  }, [user])

  const LinkCard = ({ link }: { link: LinkType }) => (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <Link href={link.url} target="_blank" rel="noopener noreferrer">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{link.title}</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription className="line-clamp-2">{link.description}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isOwner && !isStaff) {
    return null
  }

  return (
    <>
      <Header title="Staff Dashboard" portalType="staff" />
      <div className="flex-1 overflow-hidden p-4 animate-in fade-in-50 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Welcome, {user?.displayName}</h2>
          <div className="flex gap-2">
            <Button variant={isEditMode ? "default" : "outline"} onClick={() => setIsEditMode(!isEditMode)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditMode ? "Done" : "Manage Links"}
            </Button>
            {isEditMode && (
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
          <div className="space-y-6 pb-8">
            <section>
              <h3 className="text-xl font-semibold mb-4">Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <LinkCard key={resource.id} link={resource} />
                ))}
                {resources.length === 0 && (
                  <Card className="col-span-full p-4 text-center text-muted-foreground">
                    No resources found. Add some using the "Add Link" button.
                  </Card>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Our Apps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map((app) => (
                  <LinkCard key={app.id} link={app} />
                ))}
                {apps.length === 0 && (
                  <Card className="col-span-full p-4 text-center text-muted-foreground">
                    No apps found. Add some using the "Add Link" button.
                  </Card>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

