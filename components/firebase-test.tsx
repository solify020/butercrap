"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FirebaseTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    try {
      // Check if Firebase auth and db are defined
      if (auth && db) {
        setStatus("success")
        setMessage("Firebase imports are working correctly")
      } else {
        setStatus("error")
        setMessage("Firebase imports are not defined")
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error testing Firebase imports: ${error.message}`)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Import Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`p-4 rounded-md ${
            status === "loading" ? "bg-yellow-100" : status === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <p>{message}</p>
        </div>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </CardContent>
    </Card>
  )
}

