"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, limit, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatTimestamp } from "@/lib/timestamp-utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Download, AlertTriangle } from "lucide-react"

interface SignInLog {
  id: string
  email: string
  ipAddress: string
  userAgent: string
  status: "success" | "failure"
  timestamp: Timestamp
  formattedTimestamp?: string
}

export default function SecurityPage() {
  const [signInLogs, setSignInLogs] = useState<SignInLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSignInLogs() {
      try {
        setLoading(true)
        const q = query(collection(db, "signInLogs"), orderBy("timestamp", "desc"), limit(100))
        const querySnapshot = await getDocs(q)

        const logs: SignInLog[] = []
        for (const doc of querySnapshot.docs) {
          const data = doc.data() as Omit<SignInLog, "id" | "formattedTimestamp">
          const formattedTime = await formatTimestamp(data.timestamp)
          logs.push({
            id: doc.id,
            ...data,
            formattedTimestamp: formattedTime,
          })
        }

        setSignInLogs(logs)
      } catch (err) {
        console.error("Error fetching sign-in logs:", err)
        setError("Failed to load sign-in logs. Please try again later.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sign-in logs",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSignInLogs()
  }, [toast])

  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Email", "IP Address", "User Agent", "Status", "Timestamp"]
      const csvContent = [
        headers.join(","),
        ...signInLogs.map((log) =>
          [
            log.email,
            log.ipAddress,
            `"${log.userAgent.replace(/"/g, '""')}"`, // Escape quotes in user agent
            log.status,
            log.formattedTimestamp,
          ].join(","),
        ),
      ].join("\n")

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `sign-in-logs-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Sign-in logs have been exported to CSV",
      })
    } catch (err) {
      console.error("Error exporting to CSV:", err)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export sign-in logs",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <Button onClick={exportToCSV} disabled={loading || signInLogs.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Tabs defaultValue="signin-logs">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="signin-logs">Sign-in Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="signin-logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Sign-in Activity
              </CardTitle>
              <CardDescription>View recent sign-in attempts to monitor account security</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex items-center justify-center p-6 text-red-500">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  {error}
                </div>
              ) : loading ? (
                <div className="space-y-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
              ) : signInLogs.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No sign-in logs found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signInLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.email}</TableCell>
                          <TableCell>{log.ipAddress}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.status === "success"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {log.status === "success" ? "Success" : "Failed"}
                            </span>
                          </TableCell>
                          <TableCell>{log.formattedTimestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security settings for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Additional security settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

