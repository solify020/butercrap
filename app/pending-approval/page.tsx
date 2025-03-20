"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function PendingApprovalPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Pending Approval</CardTitle>
          <CardDescription>Your account is pending approval by an administrator.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Thank you for registering. Your account has been created but requires approval before you can access the
            portal. An administrator will review your account shortly.
          </p>
          <p className="mt-4 text-gray-600">
            You will receive an email notification once your account has been approved.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

