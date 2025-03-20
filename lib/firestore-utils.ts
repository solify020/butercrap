// Utility functions for Firestore operations

/**
 * Safely converts a Firestore timestamp to a Date object
 */
export function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null

  // If it's already a Date, return it
  if (timestamp instanceof Date) return timestamp

  // If it has a toDate method (Firestore Timestamp), use it
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate()
  }

  // If it's a number (seconds or milliseconds), convert to Date
  if (typeof timestamp === "number") {
    // If it's seconds (Firestore uses seconds), convert to milliseconds
    if (timestamp < 10000000000) {
      return new Date(timestamp * 1000)
    }
    return new Date(timestamp)
  }

  // If it's an object with seconds and nanoseconds (Firestore Timestamp format)
  if (timestamp.seconds && typeof timestamp.seconds === "number") {
    return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000)
  }

  // If all else fails, try to parse it
  try {
    return new Date(timestamp)
  } catch (e) {
    console.error("Failed to convert timestamp to date:", e)
    return null
  }
}

/**
 * Safely handles Firestore errors
 */
export function handleFirestoreError(error: any): { message: string; code: string } {
  console.error("Firestore error:", error)

  // Default error
  let errorMessage = "An error occurred while accessing Firestore"
  let errorCode = "unknown"

  if (error.code) {
    errorCode = error.code

    // Handle common Firestore error codes
    switch (error.code) {
      case "permission-denied":
        errorMessage = "You do not have permission to access this data"
        break
      case "not-found":
        errorMessage = "The requested document was not found"
        break
      case "already-exists":
        errorMessage = "The document already exists"
        break
      case "resource-exhausted":
        errorMessage = "Quota exceeded or rate limit reached"
        break
      case "failed-precondition":
        errorMessage = "Operation failed due to a precondition"
        break
      case "aborted":
        errorMessage = "Operation was aborted"
        break
      case "out-of-range":
        errorMessage = "Operation was attempted past the valid range"
        break
      case "unimplemented":
        errorMessage = "Operation is not implemented or supported"
        break
      case "internal":
        errorMessage = "Internal server error"
        break
      case "unavailable":
        errorMessage = "Service is currently unavailable"
        break
      case "data-loss":
        errorMessage = "Unrecoverable data loss or corruption"
        break
      case "unauthenticated":
        errorMessage = "Authentication required"
        break
      default:
        errorMessage = error.message || "An error occurred while accessing Firestore"
    }
  } else if (error.message) {
    errorMessage = error.message
  }

  return { message: errorMessage, code: errorCode }
}

/**
 * Creates a safe Firestore document data object
 */
export function createSafeDocumentData(data: any): any {
  // Remove undefined values
  const safeData = Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, any>,
  )

  return safeData
}

