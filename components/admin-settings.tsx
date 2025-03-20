"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserManagement } from "@/components/user-management"
import { SignInLogs } from "@/components/sign-in-logs"
import { SecuritySettings } from "@/components/security-settings"
import { SystemSettings } from "@/components/system-settings"
import { Loader2 } from "lucide-react"

interface AdminSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSettings({ open, onOpenChange }: AdminSettingsProps) {
  const { user, isOwner } = useAuth()
  const [activeTab, setActiveTab] = useState("users")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset state when dialog opens
    if (open) {
      setLoading(true)
      setError(null)

      // Simulate loading and check permissions
      const timer = setTimeout(() => {
        if (!isOwner) {
          setError("You do not have permission to access admin settings")
        }
        setLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [open, isOwner])

  // Debug information
  console.log("Admin Settings Debug:", {
    user,
    isOwner,
    open,
    activeTab,
    loading,
    error,
  })

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Admin Settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="logs">Sign-in Logs</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="users" className="p-1">
                <UserManagement />
              </TabsContent>

              <TabsContent value="logs" className="p-1">
                <SignInLogs />
              </TabsContent>

              <TabsContent value="security" className="p-1">
                <SecuritySettings />
              </TabsContent>

              <TabsContent value="system" className="p-1">
                <SystemSettings />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

