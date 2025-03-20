"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Save } from "lucide-react"

interface EditLinksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionName: string
  title: string
  onSuccess?: () => void
}

export function EditLinksDialog({ open, onOpenChange, collectionName, title, onSuccess }: EditLinksDialogProps) {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinks = async () => {
      if (open) {
        try {
          setLoading(true)
          const linksCollection = collection(db, collectionName)
          const linksSnapshot = await getDocs(linksCollection)
          const linksList = linksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isEditing: false,
            originalTitle: doc.data().title,
            originalUrl: doc.data().url,
          }))
          setLinks(linksList)
        } catch (error) {
          console.error("Error fetching links:", error)
          toast({
            title: "Error",
            description: "Failed to load links. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLinks()
  }, [open, collectionName])

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id))
      setLinks(links.filter((link) => link.id !== id))
      toast({
        title: "Link deleted",
        description: "The link has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting link:", error)
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleEdit = (id: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, isEditing: !link.isEditing } : link)))
  }

  const handleChange = (id: string, field: string, value: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, [field]: value } : link)))
  }

  const handleSave = async (id: string) => {
    const link = links.find((link) => link.id === id)

    if (!link) return

    try {
      await updateDoc(doc(db, collectionName, id), {
        title: link.title,
        url: link.url,
      })

      setLinks(
        links.map((l) =>
          l.id === id
            ? {
                ...l,
                isEditing: false,
                originalTitle: l.title,
                originalUrl: l.url,
              }
            : l,
        ),
      )

      toast({
        title: "Link updated",
        description: "The link has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating link:", error)
      toast({
        title: "Error",
        description: "Failed to update link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = (id: string) => {
    setLinks(
      links.map((link) =>
        link.id === id
          ? {
              ...link,
              isEditing: false,
              title: link.originalTitle,
              url: link.originalUrl,
            }
          : link,
      ),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Edit or delete your links.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : links.length === 0 ? (
            <div className="py-4 text-center">No links found</div>
          ) : (
            <div className="space-y-4 py-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  {link.isEditing ? (
                    <>
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor={`title-${link.id}`} className="sr-only">
                          Title
                        </Label>
                        <Input
                          id={`title-${link.id}`}
                          value={link.title}
                          onChange={(e) => handleChange(link.id, "title", e.target.value)}
                          placeholder="Title"
                        />
                      </div>
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor={`url-${link.id}`} className="sr-only">
                          URL
                        </Label>
                        <Input
                          id={`url-${link.id}`}
                          value={link.url}
                          onChange={(e) => handleChange(link.id, "url", e.target.value)}
                          placeholder="URL"
                        />
                      </div>
                      <Button variant="outline" size="icon" onClick={() => handleSave(link.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleCancel(link.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 truncate">{link.title}</div>
                      <div className="flex-1 truncate text-muted-foreground">{link.url}</div>
                      <Button variant="outline" size="icon" onClick={() => toggleEdit(link.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              onOpenChange(false)
              if (onSuccess) onSuccess()
            }}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

