"use client"

import { useState } from "react"
import { Save, User, Bell, Shield, Palette, Globe, Key, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button
          className="bg-[#333333] hover:bg-[#444444] text-white border-none"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 bg-[#333333] text-white">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Site</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 data-[state=active]:bg-[#444444]">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription className="text-white/70">Manage your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="aspect-square w-full max-w-[200px] rounded-full bg-[#444444] flex items-center justify-center">
                    <User className="h-16 w-16 text-white/50" />
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      Change Avatar
                    </Button>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="bg-[#444444] border-[#555555] text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="bg-[#444444] border-[#555555] text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      defaultValue="John Doe"
                      className="bg-[#444444] border-[#555555] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      defaultValue="Content creator and digital marketer"
                      className="bg-[#444444] border-[#555555] text-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input id="twitter" defaultValue="@johndoe" className="bg-[#444444] border-[#555555] text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      defaultValue="@johndoe_official"
                      className="bg-[#444444] border-[#555555] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      defaultValue="JohnDoeOfficial"
                      className="bg-[#444444] border-[#555555] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input id="tiktok" defaultValue="@johndoe" className="bg-[#444444] border-[#555555] text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription className="text-white/70">Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    defaultValue="john.doe@example.com"
                    className="bg-[#444444] border-[#555555] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="johndoe" className="bg-[#444444] border-[#555555] text-white" />
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" className="bg-[#444444] border-[#555555] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="bg-[#444444] border-[#555555] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="bg-[#444444] border-[#555555] text-white" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription className="text-white/70">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  {["New followers", "Comments on your content", "Mentions", "Direct messages"].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <Label htmlFor={item.toLowerCase().replace(/\s+/g, "-")}>{item}</Label>
                      <Switch id={item.toLowerCase().replace(/\s+/g, "-")} defaultChecked={true} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-3">
                  {["New followers", "Comments on your content", "Mentions", "Direct messages"].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <Label htmlFor={`push-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</Label>
                      <Switch id={`push-${item.toLowerCase().replace(/\s+/g, "-")}`} defaultChecked={true} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription className="text-white/70">Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-white/70">Add an extra layer of security to your account</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Button
                  variant="outline"
                  disabled
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Set Up Two-Factor Authentication
                </Button>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>
                <p className="text-sm text-white/70">You're currently signed in on these devices</p>
                <div className="space-y-3">
                  {[
                    { device: "MacBook Pro", location: "New York, USA", lastActive: "Now" },
                    { device: "iPhone 13", location: "New York, USA", lastActive: "2 hours ago" },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-[#444444]"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-white/70">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100/20">
                        Sign Out
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                  Sign Out All Devices
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription className="text-white/70">Customize how the dashboard looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {["Light", "Dark", "System"].map((theme) => (
                    <div
                      key={theme}
                      className={`border border-white/10 rounded-lg p-4 cursor-pointer ${theme === "Dark" ? "bg-[#444444]" : ""}`}
                    >
                      <div className="aspect-video rounded-md bg-[#555555] mb-2"></div>
                      <p className="text-sm font-medium text-center">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Compact Mode</Label>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Reduced Motion</Label>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Reduced Animations</Label>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription className="text-white/70">Manage your site configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" defaultValue="BUTERASCP" className="bg-[#444444] border-[#555555] text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    defaultValue="Official portal for BUTERASCP"
                    className="bg-[#444444] border-[#555555] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    defaultValue="https://buterascp.com"
                    className="bg-[#444444] border-[#555555] text-white"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="bg-[#333333] text-white border-none">
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription className="text-white/70">Configure email templates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    defaultValue="no-reply@buterascp.com"
                    className="bg-[#444444] border-[#555555] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Reply-To Email</Label>
                  <Input
                    id="replyToEmail"
                    defaultValue="support@buterascp.com"
                    className="bg-[#444444] border-[#555555] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFooter">Email Footer Text</Label>
                  <Input
                    id="emailFooter"
                    defaultValue="© 2023 BUTERASCP. All rights reserved."
                    className="bg-[#444444] border-[#555555] text-white"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-[#333333] hover:bg-[#444444] text-white border-none"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

