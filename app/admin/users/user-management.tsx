"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("approved")

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        // Fetch approved users
        const usersRef = collection(db, "users")
        const usersSnapshot = await getDocs(usersRef)
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUsers(usersData)

        // Fetch pending users
        const pendingUsersRef = collection(db, "pendingUsers")
        const pendingUsersSnapshot = await getDocs(pendingUsersRef)
        const pendingUsersData = pendingUsersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPendingUsers(pendingUsersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Handle user edit
  const handleEditUser = (user: any) => {
    setEditUser(user)
    setIsEditDialogOpen(true)
  }

  // Handle user update
  const handleUpdateUser = async () => {
    try {
      if (!editUser) return

      const userRef = doc(db, "users", editUser.id)
      await updateDoc(userRef, {
        displayName: editUser.displayName,
        role: editUser.role,
        updatedAt: new Date(),
      })

      // Update local state
      setUsers(users.map((user) => (user.id === editUser.id ? { ...user, ...editUser } : user)))

      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  // Handle user approval
  const handleApproveUser = async (user: any) => {
    try {
      // Call the API to approve the user
      const response = await fetch(`/api/auth/approve-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve user")
      }

      // Update local state
      setPendingUsers(pendingUsers.filter((u) => u.id !== user.id))
      setUsers([...users, { ...user, approved: true }])

      toast({
        title: "Success",
        description: "User approved successfully",
      })
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      })
    }
  }

  // Handle user rejection
  const handleRejectUser = async (user: any) => {
    try {
      // Call the API to reject the user
      const response = await fetch(`/api/auth/reject-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject user")
      }

      // Update local state
      setPendingUsers(pendingUsers.filter((u) => u.id !== user.id))

      toast({
        title: "Success",
        description: "User rejected successfully",
      })
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="approved" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="approved">Approved Users</TabsTrigger>
            <TabsTrigger value="pending">Pending Users ({pendingUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="approved">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.displayName || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role || "User"}</TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pending">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Signed Up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : pendingUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No pending users
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.displayName || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleString() : "Unknown"}
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleApproveUser(user)}>
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRejectUser(user)}>
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={editUser.displayName || ""}
                  onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={editUser.role || "user"}
                  onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

