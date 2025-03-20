"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { auth } from "@/lib/firebase"

export function DebugAuth() {
  const { user, refreshUserClaims } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  const getTokenInfo = async () => {
    try {
      if (!auth.currentUser) {
        setTokenInfo({ error: "No current user" })
        return
      }

      const idTokenResult = await auth.currentUser.getIdTokenResult()
      setTokenInfo({
        token: idTokenResult.token.substring(0, 20) + "...",
        claims: idTokenResult.claims,
        expirationTime: idTokenResult.expirationTime,
        issuedAtTime: idTokenResult.issuedAtTime,
        signInProvider: idTokenResult.signInProvider,
      })
    } catch (error) {
      setTokenInfo({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setShowDebug(true)} variant="outline" size="sm">
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Auth Debug</span>
            <Button onClick={() => setShowDebug(false)} variant="ghost" size="sm">
              Close
            </Button>
          </CardTitle>
          <CardDescription>Authentication debugging tools</CardDescription>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="space-y-2">
            <div>
              <strong>Authenticated:</strong> {user ? "Yes" : "No"}
            </div>
            {user && (
              <>
                <div>
                  <strong>User ID:</strong> {user.uid}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Role:</strong> {user.role || "None"}
                </div>
                <div>
                  <strong>Approved:</strong> {user.approved ? "Yes" : "No"}
                </div>
              </>
            )}
            {tokenInfo && (
              <div className="mt-4">
                <strong>Token Info:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(tokenInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={getTokenInfo} variant="outline" size="sm" className="w-full">
            Get Token Info
          </Button>
          <Button onClick={refreshUserClaims} variant="outline" size="sm" className="w-full">
            Refresh Claims
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

