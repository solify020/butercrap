"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This is a placeholder - in a real app, you'd fetch search results from your API
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (query) {
        // Mock results
        setResults([
          { id: 1, title: `Result for "${query}" 1`, type: "Task" },
          { id: 2, title: `Result for "${query}" 2`, type: "Calendar Event" },
          { id: 3, title: `Result for "${query}" 3`, type: "Analytics Report" },
        ])
      } else {
        setResults([])
      }
      setLoading(false)
    }, 1000)
  }, [query])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>{query ? `Showing results for "${query}"` : "No search query provided"}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((result) => (
                <li key={result.id} className="rounded-md border p-3">
                  <div className="font-medium">{result.title}</div>
                  <div className="text-sm text-muted-foreground">{result.type}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

