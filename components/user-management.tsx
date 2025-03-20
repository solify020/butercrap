"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

interface User {
  uid: string
  email: string
  displayName: string
  role: "owner" | "staff" | null
  disabled?: boolean
  approved?: boolean
  lastLogin?: any
  createdAt?: any
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<"owner" | "staff" | null>(null)
  const [addingUser, setAddingUser] = useState(false)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  const { toast } = useToast()
  const { user: currentUser, isOwner } = useAuth()

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isOwner) {
        throw new Error("You do not have permission to manage users")
      }

      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(usersQuery)

      const fetchedUsers = snapshot.docs.map((doc) => {
        const data = doc.data() as User
        return {
          ...data,
          uid: doc.id,
        }
      })

      setUsers(fetchedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [isOwner])

  const handleRoleChange = async (uid: string, newRole: "owner" | "staff" | null) => {
    try {
      if (!isOwner) {
        throw new Error("You do not have permission to update user roles")
      }

      // Update in Firestore
      await updateDoc(doc(db, "users", uid), {
        role: newRole,
      })

      // Update custom claims via API
      const response = await fetch("/api/auth/update-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUid: uid,
          newRole,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role in authentication")
      }

      // Update local state
      setUsers(users.map((user) => (user.uid === uid ? { ...user, role: newRole } : user)))

      toast({
        title: "Success",
        description: "User role updated successfully",
      })
    } catch (err) {
      console.error("Error updating user role:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user role",
        variant: "destructive",
      })

      // Refresh users to ensure UI is in sync with backend
      fetchUsers()
    }
  }

  const handleApprovalChange = async (uid: string, approved: boolean) => {
    try {
      if (!isOwner) {
        throw new Error("You do not have permission to approve users")
      }

      // Update in Firestore
      await updateDoc(doc(db, "users", uid), {
        approved,
      })

      // Update custom claims via API
      const response = await fetch("/api/auth/update-user-approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUid: uid,
          approved,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user approval in authentication")
      }

      // Update local state
      setUsers(users.map((user) => (user.uid === uid ? { ...user, approved } : user)))

      toast({
        title: "Success",
        description: `User ${approved ? "approved" : "unapproved"} successfully`,
      })
    } catch (err) {
      console.error("Error updating user approval:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user approval",
        variant: "destructive",
      })

      // Refresh users to ensure UI is in sync with backend
      fetchUsers()
    }
  }

  const handleDisableChange = async (uid: string, disabled: boolean) => {
    try {
      if (!isOwner) {
        throw new Error("You do not have permission to disable users")
      }

      // Don't allow disabling yourself
      if (uid === currentUser?.uid) {
        throw new Error("You cannot disable your own account")
      }

      // Update in Firestore
      await updateDoc(doc(db, "users", uid), {
        disabled,
      })

      // Update in Firebase Auth via API
      const response = await fetch("/api/auth/update-user-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUid: uid,
          disabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user status in authentication")
      }

      // Update local state
      setUsers(users.map((user) => (user.uid === uid ? { ...user, disabled } : user)))

      toast({
        title: "Success",
        description: `User ${disabled ? "disabled" : "enabled"} successfully`,
      })
    } catch (err) {
      console.error("Error updating user status:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user status",
        variant: "destructive",
      })

      // Refresh users to ensure UI is in sync with backend
      fetchUsers()
    }
  }

  const handleDeleteUser = async (uid: string) => {
    try {
      if (!isOwner) {
        throw new Error("You do not have permission to delete users")
      }

      // Don't allow deleting yourself
      if (uid === currentUser?.uid) {
        throw new Error("You cannot delete your own account")
      }

      setDeletingUser(uid)

      // Delete from Firestore
      await deleteDoc(doc(db, "users", uid))

      // Delete from Firebase Auth via API
      const response = await fetch("/api/auth/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUid: uid,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete user from authentication")
      }

      // Update local state
      setUsers(users.filter((user) => user.uid !== uid))

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting user:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      })

      // Refresh users to ensure UI is in sync with backend
      fetchUsers()
    } finally {
      setDeletingUser(null)
    }
  }

  const handleAddUser = async () => {
    try {
      if (!isOwner) {
        throw new Error("You do not have permission to add users")
      }

      if (!newUserEmail) {
        throw new Error("Email is required")
      }

      setAddingUser(true)

      // Add user via API
      const response = await fetch("/api/auth/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUserEmail,
          role: newUserRole,
          approved: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add user")
      }

      toast({
        title: "Success",
        description: "User added successfully",
      })

      // Reset form and close dialog
      setNewUserEmail("")
      setNewUserRole(null)
      setAddUserOpen(false)

      // Refresh users
      fetchUsers()
    } catch (err) {
      console.error("Error adding user:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add user",
        variant: "destructive",
      })
    } finally {
      setAddingUser(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchUsers}>Retry</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button onClick={() => setAddUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.displayName || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role || "none"}
                      onValueChange={(value) =>
                        handleRoleChange(user.uid, value === "none" ? null : (value as "owner" | "staff"))
                      }
                      disabled={user.uid === currentUser?.uid} // Can't change own role
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Select
                        value={user.approved ? "approved" : "pending"}
                        onValueChange={(value) => handleApprovalChange(user.uid, value === "approved")}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={user.disabled ? "disabled" : "enabled"}
                        onValueChange={(value) => handleDisableChange(user.uid, value === "disabled")}
                        disabled={user.uid === currentUser?.uid} // Can't disable own account
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.uid)}
                      disabled={user.uid === currentUser?.uid || deletingUser === user.uid} // Can't delete own account
                    >
                      {deletingUser === user.uid ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserRole || "none"}
                onValueChange={(value) => setNewUserRole(value === "none" ? null : (value as "owner" | "staff"))}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={addingUser}>
              {addingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

