"use client"

import { useEffect, useState } from "react"

export default function FileCheckPage() {
  const [fileResults, setFileResults] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkFiles() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/check-specific-files")

        if (!response.ok) {
          throw new Error(`Failed to check files: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setFileResults(data)
      } catch (err) {
        console.error("Error checking files:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    checkFiles()
  }, [])

  // Function to check if a file might be causing Prisma detection
  const mightCausePrismaDetection = (fileInfo: any): boolean => {
    if (!fileInfo.exists) return false

    if (fileInfo.hasPrismaReferences) return true

    if (fileInfo.dependencies) {
      const allDeps = {
        ...fileInfo.dependencies,
        ...fileInfo.devDependencies,
      }

      return Object.keys(allDeps).some((dep) => dep.includes("prisma") || dep === "@prisma/client")
    }

    if (fileInfo.content && typeof fileInfo.content === "string") {
      return (
        fileInfo.content.includes("prisma") ||
        fileInfo.content.includes("Prisma") ||
        fileInfo.content.includes("DATABASE_URL")
      )
    }

    return false
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">File Check Results</h1>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error checking files</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : fileResults ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Files That Might Cause Prisma Detection</h2>

          {Object.entries(fileResults).some(([_, info]) => mightCausePrismaDetection(info)) ? (
            <div className="space-y-4 mt-4">
              {Object.entries(fileResults)
                .filter(([_, info]) => mightCausePrismaDetection(info))
                .map(([file, info]) => (
                  <div key={file} className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <h3 className="font-medium text-amber-800">{file}</h3>

                    {info.dependencies && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Prisma-related dependencies:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {Object.entries({ ...info.dependencies, ...info.devDependencies })
                            .filter(([dep]) => dep.includes("prisma") || dep === "@prisma/client")
                            .map(([dep, version]) => (
                              <li key={dep} className="text-sm">
                                {dep}: {version as string}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {info.hasPrismaReferences && (
                      <p className="mt-2 text-sm">This file contains references to Prisma.</p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-green-600 mt-2">No files that might cause Prisma detection were found.</p>
          )}

          <h2 className="text-xl font-semibold mt-6 mb-2">All Checked Files</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">File</th>
                  <th className="px-4 py-2 border-b text-left">Exists</th>
                  <th className="px-4 py-2 border-b text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(fileResults).map(([file, info]) => (
                  <tr key={file} className={mightCausePrismaDetection(info) ? "bg-amber-50" : ""}>
                    <td className="px-4 py-2 border-b font-medium">{file}</td>
                    <td className="px-4 py-2 border-b">
                      {info.exists ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b text-sm">
                      {info.exists && (
                        <div>
                          {info.name && <div>Package name: {info.name}</div>}
                          {info.hasPrismaReferences && (
                            <div className="text-amber-600 font-medium">Contains Prisma references</div>
                          )}
                          {info.error && <div className="text-red-600">Error: {info.error}</div>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No file check results available.</p>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-semibold text-blue-800">Next Steps</h3>
        <p className="mt-2 text-blue-700">
          If you've identified files that might be causing Prisma detection, you can:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700">
          <li>Remove any Prisma schema files</li>
          <li>Remove Prisma dependencies from package.json</li>
          <li>Rename environment variables that might trigger Prisma detection</li>
          <li>Check for any frameworks or libraries that might be using Prisma internally</li>
        </ul>
      </div>
    </div>
  )
}

