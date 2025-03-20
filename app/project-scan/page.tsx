"use client"

import { useEffect, useState } from "react"

export default function ProjectScanPage() {
  const [scanResults, setScanResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function scanProject() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/scan-project")

        if (!response.ok) {
          throw new Error(`Failed to scan project: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setScanResults(data)
      } catch (err) {
        console.error("Error scanning project:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    scanProject()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Project Scan Results</h1>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error scanning project</p>
          <p className="text-sm">{error}</p>
          <p className="mt-2 text-sm">
            Note: This scanner can only run on the server. In the v0 preview environment, it may not have full access to
            scan the project files.
          </p>
        </div>
      ) : scanResults ? (
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Files with Prisma References</h2>
            {scanResults.findings && scanResults.findings.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {scanResults.findings.map((finding: any, index: number) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{finding.file}</span>: {finding.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600">No files with Prisma references found.</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Prisma-Related Environment Variables</h2>
            {scanResults.prismaRelatedEnvVars && scanResults.prismaRelatedEnvVars.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {scanResults.prismaRelatedEnvVars.map((envVar: any, index: number) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{envVar.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600">No Prisma-related environment variables found.</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Prisma-Related Dependencies</h2>
            {scanResults.prismaRelatedDependencies && scanResults.prismaRelatedDependencies.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {scanResults.prismaRelatedDependencies.map((dep: string, index: number) => (
                  <li key={index} className="text-sm font-medium">
                    {dep}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600">No Prisma-related dependencies found in package.json.</p>
            )}
          </section>

          <section className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="text-lg font-semibold text-amber-800">Deployment Troubleshooting</h3>
            <p className="mt-2 text-amber-700">
              If you're seeing a "v0 does not currently support deploying prisma" error but haven't explicitly added
              Prisma, check:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-700">
              <li>Look for any hidden Prisma configuration files (schema.prisma)</li>
              <li>Check if any third-party libraries you're using depend on Prisma</li>
              <li>Review your deployment settings for any database connection strings</li>
              <li>Check if there are any migration files that might be triggering Prisma detection</li>
            </ul>
          </section>
        </div>
      ) : (
        <p>No scan results available.</p>
      )}
    </div>
  )
}

