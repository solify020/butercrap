"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Trash, Edit, LinkIcon } from "lucide-react"
import { updateLink, deleteLink } from "@/lib/firestore"
import { toast } from "@/components/ui/use-toast"
import type { UserRole } from "@/types"

interface LinkItemProps {
  link: any
  onUpdate: () => void
  userRole?: UserRole
}

export default function LinkItem({ link, onUpdate, userRole }: LinkItemProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: link.title || "",
    url: link.url || "",
    description: link.description || "",
    category: link.category || "",
    isActive: link.isActive !== false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await updateLink(link.id, formData, link.linkType)

      if (result.success) {
        toast({
          title: "Success",
          description: "Link updated successfully",
        })

        setOpenEditDialog(false)
        onUpdate()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update link",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating link:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteLink(link.id, link.linkType)

      if (result.success) {
        toast({
          title: "Success",
          description: "Link deleted successfully",
        })

        onUpdate()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete link",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting link:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Check if user can edit this link
  const canEdit =
    userRole === "owner" || (userRole === "staff" && link.linkType === "staff" && link.createdBy === userRole)

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md card-hover animate-fade-in border-[#999999]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-[#646464] line-clamp-1">{link.title}</CardTitle>
          {link.linkType && (
            <Badge
              variant={link.linkType === "owner" ? "default" : "secondary"}
              className="ml-2 bg-[#999999] text-white"
            >
              {link.linkType}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#999999] hover:underline flex items-center"
          >
            <LinkIcon className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{link.url}</span>
          </a>

          {link.description && <p className="text-sm text-[#646464] line-clamp-2">{link.description}</p>}

          {link.category && (
            <Badge variant="outline" className="text-xs border-[#999999] text-[#646464]">
              {link.category}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#999999] hover:text-[#646464] transition-colors"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[#999999] hover:text-[#646464] hover:bg-[#99999910]"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Button>
        </a>

        <div className="flex space-x-1">
          {canEdit && (
            <>
              <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[#646464] hover:text-[#999999] hover:bg-[#64646410]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Link</DialogTitle>
                    <DialogDescription>Make changes to your link.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleUpdate} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Link Title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-url">URL</Label>
                      <Input
                        id="edit-url"
                        name="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the link"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Tools">Tools</SelectItem>
                          <SelectItem value="Resources">Resources</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-[#999999] hover:bg-[#646464] text-white">
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive/90">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the link.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

