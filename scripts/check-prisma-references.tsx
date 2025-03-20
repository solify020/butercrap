"use client"

import { useEffect, useState } from "react"

export default function CheckPrismaReferences() {
  const [findings, setFindings] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkForPrismaReferences() {
      try {
        setIsChecking(true)
        const findings: string[] = []

        // Check for common Prisma imports in the codebase
        // This is a client-side simulation - in a real scenario, this would be a server-side script

        // Check if window object contains any Prisma references
        const globalKeys = Object.keys(window)
        const prismaRelatedGlobals = globalKeys.filter(
          (key) =>
            key.toLowerCase().includes("prisma") ||
            key.toLowerCase().includes("database") ||
            key.toLowerCase().includes("orm"),
        )

        if (prismaRelatedGlobals.length > 0) {
          findings.push(`Found potential Prisma-related globals: ${prismaRelatedGlobals.join(", ")}`)
        }

        // Check for environment variables that might be related to Prisma
        const envVarsThatMightExist = [
          "DATABASE_URL",
          "PRISMA_DATABASE_URL",
          "POSTGRES_URL",
          "MYSQL_URL",
          "PRISMA_SCHEMA_PATH",
        ]

        findings.push("Note: Cannot check environment variables client-side")

        // Check for common file paths that might exist
        findings.push("Potential files to check manually:")
        findings.push("- prisma/schema.prisma")
        findings.push("- .env (for DATABASE_URL)")
        findings.push("- package.json (for @prisma/client dependency)")

        setFindings(findings)
      } catch (error) {
        console.error("Error checking for Prisma references:", error)
        setFindings(["Error checking for Prisma references"])
      } finally {
        setIsChecking(false)
      }
    }

    checkForPrismaReferences()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prisma Reference Checker</h1>

      {isChecking ? (
        <p>Checking for Prisma references...</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Findings:</h2>
          {findings.length === 0 ? (
            <p>No Prisma references found in client-side code.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {findings.map((finding, index) => (
                <li key={index} className="text-sm">
                  {finding}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="text-lg font-semibold text-amber-800">Deployment Troubleshooting</h3>
            <p className="mt-2 text-amber-700">
              If you're seeing a "v0 does not currently support deploying prisma" error but haven't explicitly added
              Prisma, check:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-700">
              <li>Any dependencies in your package.json that might include Prisma as a sub-dependency</li>
              <li>Any database-related code that might be interpreted as requiring Prisma</li>
              <li>Third-party libraries that might use Prisma internally</li>
              <li>Environment variables that might suggest a Prisma configuration</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

