"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function AdminSettingsContent() {
  const [activeTab, setActiveTab] = useState("general")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [autoApproveUsers, setAutoApproveUsers] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const settingsRef = doc(db, "settings", "system")
        const settingsDoc = await getDoc(settingsRef)

        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setMaintenanceMode(data.maintenanceMode || false)
          setAutoApproveUsers(data.autoApproveUsers || false)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true)
      const settingsRef = doc(db, "settings", "system")

      await setDoc(
        settingsRef,
        {
          maintenanceMode,
          autoApproveUsers,
          updatedAt: new Date(),
        },
        { merge: true },
      )

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Toggle maintenance mode
  const toggleMaintenanceMode = async (checked: boolean) => {
    setMaintenanceMode(checked)
  }

  // Toggle auto approve users
  const toggleAutoApproveUsers = async (checked: boolean) => {
    setAutoApproveUsers(checked)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">When enabled, only owners can access the site</p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={maintenanceMode}
                  onCheckedChange={toggleMaintenanceMode}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security and access settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-approve-users">Auto Approve Users</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new user registrations</p>
                </div>
                <Switch
                  id="auto-approve-users"
                  checked={autoApproveUsers}
                  onCheckedChange={toggleAutoApproveUsers}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your site</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Appearance settings coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading || saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

