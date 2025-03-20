import { NextResponse } from "next/server"
import { logDetailedError } from "./debug-utils"

type ApiResponse<T> = {
  success: boolean
  message?: string
  error?: string
  data?: T
}

/**
 * Creates a standardized API response
 */
export function createApiResponse<T>(data: T, success = true, message?: string, status = 200): NextResponse {
  const response: ApiResponse<T> = {
    success,
    data,
  }

  if (message) {
    response.message = message
  }

  return NextResponse.json(response, { status })
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(error: any, context: string, status = 500): NextResponse {
  // Log the error for debugging
  logDetailedError(context, error)

  // Create a user-friendly error message
  let errorMessage = "An unexpected error occurred"

  if (typeof error === "string") {
    errorMessage = error
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (error?.message) {
    errorMessage = error.message
  }

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status },
  )
}

/**
 * Safely handles API requests with standardized error handling
 */
export async function safeApiHandler<T>(
  handler: () => Promise<T>,
  context: string,
  successMessage?: string,
): Promise<NextResponse> {
  try {
    const result = await handler()
    return createApiResponse(result, true, successMessage)
  } catch (error) {
    return createErrorResponse(error, context)
  }
}

