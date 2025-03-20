"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZoomIn } from "@/components/animations/zoom-in"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ShieldAlert, ShieldCheck, User, UserPlus, UserX, Users } from "lucide-react"
import { PageTransition } from "@/components/animations/page-transition"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { collection, getDocs, doc, updateDoc, deleteDoc, getFirestore } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserType {
  id: string
  email: string
  name: string
  role: string
  status: string
  lastLogin?: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [lockdownEnabled, setLockdownEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<UserType[]>([])
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [userRole, setUserRole] = useState("")
  const [userStatus, setUserStatus] = useState("")
  const { toast } = useToast()
  const db = getFirestore()

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const usersCollection = collection(db, "admin")
      const usersSnapshot = await getDocs(usersCollection)
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserType[]

      setUsers(usersList)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLockdownToggle = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      // Call API to enable/disable lockdown
      const response = await fetch("/api/admin/lockdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) {
        throw new Error("Failed to update lockdown status")
      }

      setLockdownEnabled(enabled)
      toast({
        title: enabled ? "Lockdown Enabled" : "Lockdown Disabled",
        description: enabled
          ? "All users have been signed out and new logins are prevented."
          : "Users can now log in normally.",
        variant: enabled ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Error toggling lockdown:", error)
      toast({
        title: "Error",
        description: "Failed to update lockdown status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    setUserRole(user.role)
    setUserStatus(user.status)
    setIsUserDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      const userRef = doc(db, "admin", selectedUser.id)
      await updateDoc(userRef, {
        role: userRole,
        status: userStatus,
      })

      toast({
        title: "User Updated",
        description: `${selectedUser.name}'s information has been updated.`,
      })

      fetchUsers()
      setIsUserDialogOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    try {
      const userRef = doc(db, "admin", userId)
      await deleteDoc(userRef)

      toast({
        title: "User Deleted",
        description: `${userName} has been removed from the system.`,
      })

      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition>
      <ZoomIn>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          </div>

          <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="bg-[#333333] text-white border-gray-700">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage general settings for your application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Site Information</h3>
                    <p className="text-gray-400">Configure basic site information and appearance.</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Maintenance Mode</h3>
                    <p className="text-gray-400">Enable or disable maintenance mode for the site.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button variant="outline" className="bg-[#444444] border-gray-700 hover:bg-[#555555]">
                        Enable Maintenance Mode
                      </Button>
                      <Button variant="outline" className="bg-[#444444] border-gray-700 hover:bg-[#555555]">
                        Disable Maintenance Mode
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-[#333333] text-white border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-400">Manage user accounts and permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">User Accounts</h3>
                      <Button
                        className="bg-[#444444] hover:bg-[#555555]"
                        onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Adding new users will be available in a future update.",
                          })
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </div>

                    <div className="border border-gray-700 rounded-md">
                      <ScrollArea className="h-[400px] w-full">
                        <div className="p-4">
                          {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                            </div>
                          ) : users.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No users found</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {users.map((user) => (
                                <div
                                  key={user.id}
                                  className="p-4 bg-[#2a2a2a] rounded-md flex justify-between items-center"
                                >
                                  <div className="flex items-center">
                                    <div className="bg-[#444444] p-2 rounded-full mr-3">
                                      <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{user.name}</p>
                                      <p className="text-sm text-gray-400">{user.email}</p>
                                      <div className="flex space-x-2 mt-1">
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            user.role === "admin"
                                              ? "bg-purple-900/30 text-purple-400 border border-purple-800/50"
                                              : user.role === "staff"
                                                ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                                                : "bg-gray-800 text-gray-400 border border-gray-700"
                                          }`}
                                        >
                                          {user.role}
                                        </span>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            user.status === "active"
                                              ? "bg-green-900/30 text-green-400 border border-green-800/50"
                                              : "bg-red-900/30 text-red-400 border border-red-800/50"
                                          }`}
                                        >
                                          {user.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-[#444444] border-gray-700 hover:bg-[#555555]"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                    >
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-[#333333] text-white border-gray-700">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage security settings and access controls.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Authentication</h3>
                      <p className="text-gray-400">Configure authentication methods and settings.</p>
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="auto-approve">Auto-approve new users</Label>
                              <p className="text-xs text-gray-400">Automatically approve new user registrations</p>
                            </div>
                            <Switch id="auto-approve" className="data-[state=checked]:bg-green-500" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="two-factor">Require 2FA for admins</Label>
                              <p className="text-xs text-gray-400">Enforce two-factor authentication for admin users</p>
                            </div>
                            <Switch id="two-factor" className="data-[state=checked]:bg-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Access Logs</h3>
                      <p className="text-gray-400">View and manage access logs.</p>
                      <Button className="mt-2 bg-[#444444] hover:bg-[#555555]">View Access Logs</Button>
                    </div>

                    <div className="space-y-4 border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                            <h3 className="text-lg font-medium">Lockdown Mode</h3>
                          </div>
                          <p className="text-gray-400">
                            When enabled, all users will be signed out and prevented from logging in.
                          </p>
                        </div>
                        <Switch
                          checked={lockdownEnabled}
                          onCheckedChange={handleLockdownToggle}
                          disabled={isLoading}
                          className="data-[state=checked]:bg-red-500"
                        />
                      </div>

                      <div
                        className={`p-4 rounded-md ${lockdownEnabled ? "bg-red-900/20" : "bg-green-900/20"} border ${lockdownEnabled ? "border-red-800" : "border-green-800"}`}
                      >
                        <div className="flex items-start">
                          {lockdownEnabled ? (
                            <ShieldAlert className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          ) : (
                            <ShieldCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium">{lockdownEnabled ? "Lockdown Active" : "Normal Operation"}</h4>
                            <p className="text-sm text-gray-400">
                              {lockdownEnabled
                                ? "All users are currently locked out of the system. Only administrators can access the portal."
                                : "The portal is operating normally. All authorized users can log in."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {lockdownEnabled && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleLockdownToggle(false)}
                          disabled={isLoading}
                        >
                          Disable Lockdown Mode
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ZoomIn>

      {/* Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="bg-[#333333] text-white border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">Update user information and permissions</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  value={selectedUser.name}
                  readOnly
                  className="bg-[#222222] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  value={selectedUser.email}
                  readOnly
                  className="bg-[#222222] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger className="bg-[#222222] border-gray-700 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222222] border-gray-700 text-white">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-status">Status</Label>
                <Select value={userStatus} onValueChange={setUserStatus}>
                  <SelectTrigger className="bg-[#222222] border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222222] border-gray-700 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserDialogOpen(false)}
              className="bg-[#444444] border-gray-700 text-white hover:bg-[#555555]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={isLoading}
              className="bg-[#555555] hover:bg-[#666666] text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

