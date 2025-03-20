"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { testFirestorePermissions, testCollectionsExist, getCurrentAuthState } from "@/lib/firebase-debug"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function DebugPage() {
  const { user, loading, isOwner } = useAuth()
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const runTest = async (test: string) => {
    setIsLoading(true)
    setResults(null)

    try {
      let result

      switch (test) {
        case "permissions":
          result = await testFirestorePermissions()
          break
        case "collections":
          result = await testCollectionsExist()
          break
        case "auth":
          result = await getCurrentAuthState()
          break
        default:
          throw new Error("Unknown test")
      }

      setResults(result)
    } catch (error) {
      setResults({ success: false, message: error.message || "Test failed" })
    } finally {
      setIsLoading(false)
    }
  }

  const runServerAction = async (action: string) => {
    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          email: user?.email || email,
        }),
      })

      const result = await response.json()
      setResults(result)
    } catch (error) {
      setResults({ success: false, message: error.message || "Action failed" })
    } finally {
      setIsLoading(false)
    }
  }

  const forceCreatePendingUser = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "force-create-pending-user",
          email: user?.email || email,
        }),
      })

      const result = await response.json()
      setResults(result)
    } catch (error) {
      setResults({ success: false, message: error.message || "Failed to create pending user" })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to access the debug tools.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Debug Tools</h1>

      <Tabs defaultValue="client">
        <TabsList className="mb-4">
          <TabsTrigger value="client">Client-Side Tests</TabsTrigger>
          <TabsTrigger value="server">Server-Side Tests</TabsTrigger>
          <TabsTrigger value="fixes">Quick Fixes</TabsTrigger>
        </TabsList>

        <TabsContent value="client">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Firestore Permissions</CardTitle>
                <CardDescription>Checks if you have permission to write to Firestore</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => runTest("permissions")} disabled={isLoading}>
                  {isLoading ? "Running..." : "Run Test"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Collections</CardTitle>
                <CardDescription>Checks if required collections exist and are accessible</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => runTest("collections")} disabled={isLoading}>
                  {isLoading ? "Running..." : "Run Test"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check Authentication State</CardTitle>
                <CardDescription>Retrieves your current authentication state and token</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => runTest("auth")} disabled={isLoading}>
                  {isLoading ? "Running..." : "Run Test"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="server">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Check Firestore Rules</CardTitle>
                <CardDescription>Tests if Firestore security rules are properly configured</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => runServerAction("check-firestore-rules")} disabled={isLoading}>
                  {isLoading ? "Running..." : "Run Test"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check User Status</CardTitle>
                <CardDescription>Checks if your user exists in Auth and Firestore collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email to check"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => runServerAction("check-user-exists")} disabled={isLoading}>
                  {isLoading ? "Running..." : "Check User"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fixes">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Missing Collections</CardTitle>
                <CardDescription>Creates essential collections and documents if they're missing</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => runServerAction("fix-missing-collections")} disabled={isLoading}>
                  {isLoading ? "Running..." : "Fix Collections"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Force Create Pending User</CardTitle>
                <CardDescription>Forcefully adds your user to the pendingUsers collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="force-email">Email</Label>
                    <Input
                      id="force-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email to add"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={forceCreatePendingUser} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Force Create"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {results && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={results.success ? "default" : "destructive"}>
              <AlertTitle>{results.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{results.message}</AlertDescription>
            </Alert>

            <ScrollArea className="h-[300px] mt-4 p-4 rounded-md border">
              <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

