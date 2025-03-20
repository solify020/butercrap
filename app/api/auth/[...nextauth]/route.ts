import NextAuth from "next-auth"
import type { NextRequest } from "next/server"
import { authOptions } from "./options"

// Re-export authOptions for compatibility
export default { authOptions }

// Create explicit GET and POST functions with the correct signatures
export async function GET(request: NextRequest) {
  const handler = NextAuth(authOptions)
  return handler(request)
}

export async function POST(request: NextRequest) {
  const handler = NextAuth(authOptions)
  return handler(request)
}

