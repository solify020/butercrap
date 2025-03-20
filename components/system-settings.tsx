"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SystemSettings {
  autoApproveUsers: boolean
  maintenanceMode: boolean
}

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    autoApproveUsers: false, // Default to false
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/settings/system")

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error("Error fetching system settings:", err)
      setError(err instanceof Error ? err.message : "Failed to load settings")
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof SystemSettings, value: boolean) => {
    try {
      setSaving(true)

      // Optimistically update UI
      setSettings((prev) => ({ ...prev, [key]: value }))

      const response = await fetch("/api/settings/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [key]: value,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update setting: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "Success",
        description: "Setting updated successfully",
      })
    } catch (err) {
      console.error("Error updating setting:", err)

      // Revert optimistic update
      setSettings((prev) => ({ ...prev, [key]: !value }))

      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchSettings}>Retry</Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure global system settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-approve">Auto Approve Users</Label>
            <p className="text-sm text-muted-foreground">Automatically approve new users when they sign up</p>
          </div>
          <Switch
            id="auto-approve"
            checked={settings.autoApproveUsers}
            onCheckedChange={(checked) => updateSetting("autoApproveUsers", checked)}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">Put the site in maintenance mode (only owners can access)</p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
            disabled={saving}
          />
        </div>
      </CardContent>
    </Card>
  )
}

