"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

interface AddLinkDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, url: string, type: "site" | "app", imageUrl?: string, color?: string) => void
  type: "site" | "app"
}

export default function AddLinkDialog({ open, onClose, onAdd, type }: AddLinkDialogProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [color, setColor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setName("")
    setUrl("")
    setImageUrl("")
    setColor("")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !url.trim()) {
      toast({
        title: "Error",
        description: `Please enter both name and URL for the ${type}.`,
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Add a slight delay for better UX
    setTimeout(() => {
      onAdd(name, url, type, imageUrl || undefined, color || undefined)
      resetForm()
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#333333] border border-[#666666]/30 text-white sm:max-w-md zoom-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Add {type === "site" ? "Resource" : "Application"}</DialogTitle>
          <DialogDescription className="text-[#999999]">
            Enter the details for the new {type === "site" ? "resource" : "application"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${type === "site" ? "Resource" : "Application"} name`}
              className="bg-[#454545] border-[#666666]/30 text-white placeholder:text-[#999999] focus:border-[#999999] focus:ring-[#999999]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-white">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-[#454545] border-[#666666]/30 text-white placeholder:text-[#999999] focus:border-[#999999] focus:ring-[#999999]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-white">
              Image URL <span className="text-[#999999]">(optional)</span>
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="bg-[#454545] border-[#666666]/30 text-white placeholder:text-[#999999] focus:border-[#999999] focus:ring-[#999999]"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-white">
              Color <span className="text-[#999999]">(optional)</span>
            </Label>
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#FFFFFF"
              className="bg-[#454545] border-[#666666]/30 text-white placeholder:text-[#999999] focus:border-[#999999] focus:ring-[#999999]"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-[#454545] text-white hover:bg-[#555555] border-[#666666]/30"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#5a5a5a] hover:bg-[#666666] text-white btn-hover-effect"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

