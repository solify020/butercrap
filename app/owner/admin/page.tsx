"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Download, Plus, Trash, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminSettingsDialog } from "@/components/admin-settings-dialog"

export default function AdminSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState("")
  const [estimatedCompletion, setEstimatedCompletion] = useState("")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [signInLogs, setSignInLogs] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("staff")
  const { toast } = useToast()

  useEffect(() => {
    // Fetch maintenance settings
    const fetchMaintenanceSettings = async () => {
      try {
        const maintenanceDoc = await getDoc(doc(db, "settings", "maintenance"))
        if (maintenanceDoc.exists()) {
          const data = maintenanceDoc.data()
          setMaintenanceMode(data.enabled || false)
          setMaintenanceMessage(data.message || "")
          if (data.estimatedCompletion) {
            const date = data.estimatedCompletion.toDate()
            setEstimatedCompletion(date.toISOString().slice(0, 16))
          }
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching maintenance settings:", error)
        setLoading(false)
      }
    }

    // Fetch users
    const fetchUsers = () => {
      const q = query(collection(db, "users"))
      return onSnapshot(q, (querySnapshot) => {
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          lastLogin: doc.data().lastLogin?.toDate?.() || new Date(doc.data().lastLogin),
        }))
        setUsers(usersData)
      })
    }

    // Fetch sign-in logs
    const fetchSignInLogs = () => {
      const q = query(collection(db, "logs", "auth", "signIns"), orderBy("timestamp", "desc"))
      return onSnapshot(q, (querySnapshot) => {
        const logsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
        }))
        setSignInLogs(logsData)
      })
    }

    fetchMaintenanceSettings()
    const unsubscribeUsers = fetchUsers()
    const unsubscribeLogs = fetchSignInLogs()

    return () => {
      unsubscribeUsers()
      unsubscribeLogs()
    }
  }, [])

  const handleSaveMaintenanceSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "maintenance"), {
        enabled: maintenanceMode,
        message: maintenanceMessage,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Settings saved",
        description: "Maintenance settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving maintenance settings:", error)
      toast({
        title: "Error",
        description: "Failed to save maintenance settings.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteDoc(doc(db, "users", userId))

      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditingUser(true)
  }

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        await updateDoc(doc(db, "users", selectedUser.id), {
          role: selectedUser.role,
          updatedAt: serverTimestamp(),
        })

        toast({
          title: "User updated",
          description: "User has been updated successfully.",
        })
      } else {
        // Add new user
        // In a real app, you would create a user in Firebase Auth first
        // For now, we'll just add a placeholder in Firestore
        await setDoc(doc(db, "users", `placeholder-${Date.now()}`), {
          email: newUserEmail,
          role: newUserRole,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        toast({
          title: "User added",
          description: "User has been added successfully.",
        })

        setNewUserEmail("")
        setNewUserRole("staff")
      }

      setIsEditingUser(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: "Failed to save user.",
        variant: "destructive",
      })
    }
  }

  const handleExportLogs = () => {
    // Convert logs to CSV
    const headers = ["Date", "User", "Email", "IP Address", "Success"]
    const csvData = signInLogs.map((log) => [
      log.timestamp.toLocaleString(),
      log.displayName || "Unknown",
      log.email || "Unknown",
      log.ipAddress || "Unknown",
      log.success ? "Yes" : "No",
    ])

    const csv = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sign-in-logs-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 zoom-in">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="bg-[#333333] border-gray-700">
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="logs">Sign-in Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-4">
          <Card className="bg-[#333333] border-gray-700">
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Input
                  id="maintenance-message"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="The system is currently undergoing maintenance..."
                  className="bg-[#444444] border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-completion">Estimated Completion (optional)</Label>
                <Input
                  id="estimated-completion"
                  type="datetime-local"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  className="bg-[#444444] border-gray-600 text-white"
                />
              </div>

              <Button onClick={handleSaveMaintenanceSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="bg-[#333333] border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedUser(null)
                  setIsEditingUser(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "owner" ? (
                            <span className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded text-xs">
                              Owner
                            </span>
                          ) : user.role === "staff" ? (
                            <span className="bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded text-xs">
                              Staff
                            </span>
                          ) : (
                            <span className="bg-yellow-500 bg-opacity-20 text-yellow-400 px-2 py-1 rounded text-xs">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{user.lastLogin ? user.lastLogin.toLocaleString() : "Never"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === "owner"}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-[#333333] border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sign-in Logs</CardTitle>
              <Button size="sm" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signInLogs.map((log) => (
                      <TableRow key={log.id} className="border-gray-700">
                        <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                        <TableCell>{log.displayName || "Unknown"}</TableCell>
                        <TableCell>{log.email || "Unknown"}</TableCell>
                        <TableCell>{log.ipAddress || "Unknown"}</TableCell>
                        <TableCell>
                          {log.success ? (
                            <span className="bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded text-xs">
                              Success
                            </span>
                          ) : (
                            <span className="bg-red-500 bg-opacity-20 text-red-400 px-2 py-1 rounded text-xs">
                              Failed
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="bg-[#333333] border-gray-700">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-approve" />
                <Label htmlFor="auto-approve">Auto-approve new users</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="force-logout" />
                <Label htmlFor="force-logout">Force logout for all users</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="60"
                  className="bg-[#444444] border-gray-600 text-white"
                />
              </div>

              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
        <DialogContent className="bg-[#333333] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser ? "Update user role and permissions." : "Add a new user to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedUser ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    value={selectedUser.email}
                    disabled
                    className="bg-[#444444] border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Role</Label>
                  <select
                    id="user-role"
                    value={selectedUser.role || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full bg-[#444444] border border-gray-600 text-white rounded-md p-2"
                  >
                    <option value="">Pending Approval</option>
                    <option value="staff">Staff</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-user-email">Email</Label>
                  <Input
                    id="new-user-email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-[#444444] border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-user-role">Role</Label>
                  <select
                    id="new-user-role"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-[#444444] border border-gray-600 text-white rounded-md p-2"
                  >
                    <option value="">Pending Approval</option>
                    <option value="staff">Staff</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>{selectedUser ? "Update User" : "Add User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-4 right-4 bg-[#333333] text-white border-gray-700 hover:bg-[#444444] admin-settings-button"
      >
        <Settings className="h-5 w-5 mr-2" />
        Advanced Settings
      </Button>

      <AdminSettingsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}

