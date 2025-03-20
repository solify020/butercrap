// Helper to ensure API routes use Node.js runtime
export const nodeJsRuntime = {
  runtime: "nodejs" as const,
}

// Helper for API response
export function apiResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// Helper for API error response
export function apiErrorResponse(error: string | Error, status = 500) {
  const message = error instanceof Error ? error.message : error
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

