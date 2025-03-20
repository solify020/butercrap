"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PendingUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string | null
  lastLogin: string | null
}

export default function PendingUsers() {
  const [pendingUsers, set_pendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/get-pending-users")

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      set_pendingUsers(data.pendingUsers || [])

      // Initialize selected roles
      const roles: Record<string, string> = {}
      data.pendingUsers.forEach((user: PendingUser) => {
        roles[user.uid] = "staff" // Default to staff
      })
      setSelectedRoles(roles)
    } catch (error) {
      console.error("Error fetching pending users:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const handleRoleChange = (uid: string, role: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [uid]: role,
    }))
  }

  const handleApprove = async (uid: string) => {
    try {
      const response = await fetch("/api/auth/approve-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          role: selectedRoles[uid] || "staff",
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "User Approved",
        description: "The user has been approved successfully.",
      })

      // Refresh the list
      fetchPendingUsers()
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve user",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (uid: string) => {
    try {
      const response = await fetch("/api/auth/reject-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "User Rejected",
        description: "The user has been rejected successfully.",
      })

      // Refresh the list
      fetchPendingUsers()
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject user",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Users</CardTitle>
        <CardDescription>Approve or reject users who have signed up and are waiting for approval.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No pending users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <span>{user.displayName || "Unknown"}</span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selectedRoles[user.uid] || "staff"}
                        onValueChange={(value) => handleRoleChange(user.uid, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleApprove(user.uid)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-destructive"
                          onClick={() => handleReject(user.uid)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

