"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SecuritySettings } from "./security-settings"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

interface AdminSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSettingsDialog({ open, onOpenChange }: AdminSettingsDialogProps) {
  const [settings, setSettings] = useState({
    allowSignups: true,
    autoApproveUsers: false,
    defaultUserRole: "",
    maintenanceMode: false,
    notifications: {
      newUserSignup: true,
      userApproved: true,
    },
    securitySettings: {
      forceLogout: false,
      maxLoginAttempts: 5,
    },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const settingsDoc = await getDoc(doc(db, "settings", "general"))

        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as any)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchSettings()
    }
  }, [open])

  const handleSaveSettings = async () => {
    try {
      await updateDoc(doc(db, "settings", "general"), settings)
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Admin Settings</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">Loading settings...</div>
        ) : (
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">
                      Enable maintenance mode to prevent users from accessing the portal
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500">Configure notification settings</p>
                  </div>
                </div>

                <div className="ml-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">New User Signup</label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.newUserSignup}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            newUserSignup: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">User Approved</label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.userApproved}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            userApproved: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Allow Signups</h3>
                    <p className="text-sm text-gray-500">Allow new users to sign up for the portal</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowSignups}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowSignups: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto Approve Users</h3>
                    <p className="text-sm text-gray-500">Automatically approve new user signups</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoApproveUsers}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoApproveUsers: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <h3 className="font-medium">Default User Role</h3>
                  <p className="text-sm text-gray-500">Set the default role for new users</p>
                  <select
                    value={settings.defaultUserRole}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultUserRole: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="">None</option>
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="py-4">
              <SecuritySettings
                settings={settings.securitySettings}
                onChange={(securitySettings) =>
                  setSettings({
                    ...settings,
                    securitySettings,
                  })
                }
              />
            </TabsContent>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AdminSettingsDialog

