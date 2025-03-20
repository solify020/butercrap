"use client"

import { useState, useEffect } from "react"

export function PrismaDetector() {
  const [findings, setFindings] = useState<string[]>([])

  useEffect(() => {
    // Check for Prisma-related objects in the global scope
    const globalObjects = Object.keys(window).filter(
      (key) => key.toLowerCase().includes("prisma") || key.toLowerCase().includes("database"),
    )

    const newFindings: string[] = []

    if (globalObjects.length > 0) {
      newFindings.push(`Found global objects that might be related to Prisma: ${globalObjects.join(", ")}`)
    }

    // Check for script tags that might be loading Prisma
    const scripts = document.querySelectorAll("script")
    scripts.forEach((script) => {
      const src = script.getAttribute("src") || ""
      const content = script.textContent || ""

      if (src.includes("prisma") || content.includes("prisma") || content.includes("Prisma")) {
        newFindings.push(`Found script that might be related to Prisma: ${src || "[inline script]"}`)
      }
    })

    // Check for meta tags that might indicate Prisma usage
    const metas = document.querySelectorAll("meta")
    metas.forEach((meta) => {
      const name = meta.getAttribute("name") || ""
      const content = meta.getAttribute("content") || ""

      if (
        name.includes("prisma") ||
        content.includes("prisma") ||
        name.includes("database") ||
        content.includes("database")
      ) {
        newFindings.push(`Found meta tag that might be related to Prisma: ${name}`)
      }
    })

    setFindings(newFindings)
  }, [])

  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="text-lg font-semibold">Client-Side Prisma Detection</h3>

      {findings.length > 0 ? (
        <div className="mt-2">
          <p className="font-medium text-amber-600">Potential Prisma references detected:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {findings.map((finding, index) => (
              <li key={index} className="text-sm">
                {finding}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-green-600">No client-side Prisma references detected.</p>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Note: This is a client-side check and can only detect Prisma references in the browser environment. Server-side
        code and configuration files cannot be checked this way.
      </p>
    </div>
  )
}

