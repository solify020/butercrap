"use client"

import { Button } from "@/components/ui/button"
import "./globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
          <p className="mb-8 max-w-md text-gray-600">
            A critical error has occurred. Please try again or contact support if the problem persists.
          </p>
          <div className="flex space-x-4">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/login")}>
              Return to Login
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

