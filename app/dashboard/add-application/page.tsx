"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export default function AddApplicationPage() {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await addDoc(collection(db, "applications"), {
        title,
        url,
      })

      toast({
        title: "Success",
        description: "Application added successfully",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error adding application:", error)
      toast({
        title: "Error",
        description: "Failed to add application",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card className="bg-[#444444] text-white border-gray-600">
        <CardHeader>
          <CardTitle>Add Application</CardTitle>
          <CardDescription className="text-gray-300">Add a new application to your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter application title"
                className="bg-[#333333] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-[#333333] border-gray-600 text-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-[#555555] text-white border-gray-600 hover:bg-[#666666]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#555555] text-white hover:bg-[#666666]">
              {isSubmitting ? "Adding..." : "Add Application"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

