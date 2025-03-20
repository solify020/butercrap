"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserRoleManagerProps {
  userId: string
  currentRole: string | null
  onRoleUpdated?: () => void
}

export function UserRoleManager({ userId, currentRole, onRoleUpdated }: UserRoleManagerProps) {
  const { user, refreshUserClaims } = useAuth()
  const [role, setRole] = useState<string | null>(currentRole)
  const [loading, setLoading] = useState(false)

  const updateUserRole = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Get the current user's ID token
      const idToken = await user.getIdToken()

      // Call the API to update the user's role
      const response = await fetch("/api/auth/update-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          targetUid: userId,
          newRole: role,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const data = await response.json()

      // Refresh the current user's claims if they updated their own role
      if (userId === user.uid) {
        await refreshUserClaims()
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${role}`,
      })

      // Call the onRoleUpdated callback if provided
      if (onRoleUpdated) {
        onRoleUpdated()
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role || "none"}
        onValueChange={(value) => setRole(value === "none" ? null : value)}
        disabled={loading}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={updateUserRole} disabled={loading || role === currentRole} size="sm" variant="outline">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
      </Button>
    </div>
  )
}

