"use client"

import { useState, useEffect } from "react"
import { LinkIcon, Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ZoomIn } from "@/components/animations/zoom-in"

export default function MegaIntegrationPage() {
  const [links, setLinks] = useState<any[]>([])
  const [newLinkName, setNewLinkName] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [megaEmail, setMegaEmail] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const linksCollection = collection(db, "megaLinks")
        const linksSnapshot = await getDocs(linksCollection)
        const linksList = linksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setLinks(linksList)

        // Fetch settings
        const settingsCollection = collection(db, "settings")
        const settingsSnapshot = await getDocs(settingsCollection)
        const settingsDoc = settingsSnapshot.docs.find((doc) => doc.id === "mega")

        if (settingsDoc) {
          const data = settingsDoc.data()
          setMegaEmail(data.email || "")
          setApiKey(data.apiKey || "")
        }
      } catch (error) {
        console.error("Error fetching Mega data:", error)
        toast({
          title: "Error",
          description: "Failed to load Mega integration data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLinks()
  }, [])

  const addLink = async () => {
    if (!newLinkName || !newLinkUrl) {
      toast({
        title: "Missing Fields",
        description: "Please enter both a name and URL for the link",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const docRef = await addDoc(collection(db, "megaLinks"), {
        name: newLinkName,
        url: newLinkUrl,
        createdAt: new Date(),
      })

      setLinks([
        ...links,
        {
          id: docRef.id,
          name: newLinkName,
          url: newLinkUrl,
          createdAt: new Date(),
        },
      ])

      setNewLinkName("")
      setNewLinkUrl("")

      toast({
        title: "Link Added",
        description: "Your Mega link has been added successfully",
      })
    } catch (error) {
      console.error("Error adding link:", error)
      toast({
        title: "Error",
        description: "Failed to add Mega link",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const removeLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, "megaLinks", id))
      setLinks(links.filter((link) => link.id !== id))

      toast({
        title: "Link Removed",
        description: "Your Mega link has been removed successfully",
      })
    } catch (error) {
      console.error("Error removing link:", error)
      toast({
        title: "Error",
        description: "Failed to remove Mega link",
        variant: "destructive",
      })
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)

      // Check if settings document exists
      const settingsCollection = collection(db, "settings")
      const settingsSnapshot = await getDocs(settingsCollection)
      const settingsDoc = settingsSnapshot.docs.find((doc) => doc.id === "mega")

      if (settingsDoc) {
        // Update existing document
        await updateDoc(doc(db, "settings", "mega"), {
          email: megaEmail,
          apiKey: apiKey,
          updatedAt: new Date(),
        })
      } else {
        // Create new document
        await addDoc(collection(db, "settings"), {
          id: "mega",
          email: megaEmail,
          apiKey: apiKey,
          createdAt: new Date(),
        })
      }

      toast({
        title: "Settings Saved",
        description: "Your Mega settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save Mega settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-semibold">Loading Mega integration...</h2>
          <p>Please wait while we load your data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 animate-fadeIn">
      <h1 className="mb-6 text-3xl font-bold">Mega Integration</h1>

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="links">Mega Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ZoomIn>
              <Card className="bg-[#333333] border-[#444444]">
                <CardHeader>
                  <CardTitle>Add New Mega Link</CardTitle>
                  <CardDescription>Add links to your Mega storage for easy access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Link Name</Label>
                      <Input
                        id="name"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        placeholder="Project Files"
                        className="bg-[#222222] border-[#444444]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="url">Mega URL</Label>
                      <Input
                        id="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://mega.nz/folder/..."
                        className="bg-[#222222] border-[#444444]"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={addLink}
                    disabled={saving}
                    className="w-full bg-[#999999] hover:bg-[#777777] text-white"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Link
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </ZoomIn>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Mega Links</h3>
              {links.length === 0 ? (
                <ZoomIn>
                  <Card className="bg-[#333333] border-[#444444] flex items-center justify-center h-[200px]">
                    <div className="text-center text-muted-foreground">
                      <LinkIcon className="mx-auto h-10 w-10 mb-2" />
                      <p>No Mega links added yet</p>
                      <p className="text-sm">Add your first link using the form</p>
                    </div>
                  </Card>
                </ZoomIn>
              ) : (
                <div className="grid gap-4">
                  {links.map((link, index) => (
                    <ZoomIn key={link.id} delay={index * 50}>
                      <Card className="bg-[#333333] border-[#444444]">
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-medium text-white">{link.name}</h3>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#999999] hover:text-white transition-colors flex items-center"
                            >
                              <LinkIcon className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[200px]">{link.url}</span>
                            </a>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLink(link.id)}
                            className="h-8 w-8 text-[#999999] hover:text-red-500 hover:bg-[#444444]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </ZoomIn>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ZoomIn>
            <Card className="bg-[#333333] border-[#444444]">
              <CardHeader>
                <CardTitle>Mega Account Settings</CardTitle>
                <CardDescription>Configure your Mega account settings for integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Mega Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={megaEmail}
                      onChange={(e) => setMegaEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="bg-[#222222] border-[#444444]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apiKey">API Key (Optional)</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="bg-[#222222] border-[#444444]"
                    />
                    <p className="text-xs text-muted-foreground">
                      The API key can be found in your Mega account settings
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="w-full bg-[#999999] hover:bg-[#777777] text-white"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </ZoomIn>
        </TabsContent>
      </Tabs>
    </div>
  )
}

