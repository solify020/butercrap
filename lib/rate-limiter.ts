import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory rate limiter
// In production, use Redis or another distributed store
const ipRequests: Record<string, { count: number; timestamp: number }> = {}

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10 // 10 requests per minute

export function rateLimiter(req: NextRequest) {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()

  // Initialize or reset if window has passed
  if (!ipRequests[ip] || now - ipRequests[ip].timestamp > RATE_LIMIT_WINDOW) {
    ipRequests[ip] = { count: 1, timestamp: now }
    return null
  }

  // Increment request count
  ipRequests[ip].count++

  // Check if rate limit exceeded
  if (ipRequests[ip].count > MAX_REQUESTS) {
    return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 })
  }

  return null
}

// Apply rate limiter to an API route
export function withRateLimit(handler: Function) {
  return async (req: NextRequest) => {
    const rateLimitResponse = rateLimiter(req)

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    return handler(req)
  }
}

