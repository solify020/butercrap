"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, LinkIcon, ExternalLink } from "lucide-react"

interface MegaLink {
  id: string
  title: string
  url: string
  description: string
  createdAt: any
  createdBy: string
}

export default function MegaIntegrationPage() {
  const [links, setLinks] = useState<MegaLink[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  const fetchLinks = async () => {
    if (!user) return

    try {
      const q = query(collection(db, "mega"), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const fetchedLinks: MegaLink[] = []

      querySnapshot.forEach((doc) => {
        fetchedLinks.push({
          id: doc.id,
          ...(doc.data() as Omit<MegaLink, "id">),
        })
      })

      setLinks(fetchedLinks)
    } catch (error) {
      console.error("Error fetching Mega links:", error)
      toast({
        title: "Error",
        description: "Failed to load Mega links",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [user, toast])

  const handleAddLink = async () => {
    if (!user) return

    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title and URL",
        variant: "destructive",
      })
      return
    }

    // Basic validation for Mega link
    if (!newLink.url.includes("mega.nz")) {
      toast({
        title: "Error",
        description: "Please enter a valid Mega.nz URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, "mega"), {
        title: newLink.title,
        url: newLink.url,
        description: newLink.description,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })

      setNewLink({
        title: "",
        url: "",
        description: "",
      })
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Mega link added successfully",
      })

      fetchLinks()
    } catch (error) {
      console.error("Error adding Mega link:", error)
      toast({
        title: "Error",
        description: "Failed to add Mega link",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!user) return

    setDeleting(id)

    try {
      await deleteDoc(doc(db, "mega", id))

      toast({
        title: "Success",
        description: "Mega link deleted successfully",
      })

      fetchLinks()
    } catch (error) {
      console.error("Error deleting Mega link:", error)
      toast({
        title: "Error",
        description: "Failed to delete Mega link",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <Header title="Mega Integration" portalType="owner" />
      <div className="flex-1 p-4 animate-in fade-in-50 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mega Links</h2>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mega Link
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          {links.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link) => (
                <Card key={link.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={deleting === link.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{link.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[150px]">{link.url}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No Mega links found</p>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mega Link
                </Button>
              </CardContent>
            </Card>
          )}
        </ScrollArea>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Mega Link</DialogTitle>
              <DialogDescription>Add a new Mega.nz link to the portal.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter link title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Mega URL</Label>
                <Input
                  id="url"
                  placeholder="https://mega.nz/..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLink} disabled={loading}>
                {loading ? "Adding..." : "Add Link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

