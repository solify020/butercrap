"use client"

import { useState } from "react"

export default function CleanupPrisma() {
  const [status, setStatus] = useState<"idle" | "cleaning" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleCleanup = async () => {
    try {
      setStatus("cleaning")
      setMessage("Cleaning up Prisma files...")

      // This is a client-side component, so we need to call an API route
      const response = await fetch("/api/cleanup-prisma", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to clean up: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setStatus("success")
      setMessage(`Successfully cleaned up ${data.removedCount} Prisma-related files.`)
    } catch (error) {
      console.error("Error cleaning up:", error)
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prisma Cleanup</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          This utility will scan your project for any Prisma-related files and remove them. This includes schema files,
          migration directories, and any other files that might be causing deployment issues.
        </p>

        <button
          onClick={handleCleanup}
          disabled={status === "cleaning"}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "cleaning" ? "Cleaning..." : "Clean Up Prisma Files"}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              status === "success"
                ? "bg-green-50 text-green-700"
                : status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

