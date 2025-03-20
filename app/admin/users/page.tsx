"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserManagement from "./user-management"
import PendingUsers from "./pending-users"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function UsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("approved")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "pending" || tab === "approved") {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/admin/users?tab=${value}`)
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="approved">Approved Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Users</TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <UserManagement />
        </TabsContent>

        <TabsContent value="pending">
          <PendingUsers />
        </TabsContent>
      </Tabs>
    </div>
  )
}

