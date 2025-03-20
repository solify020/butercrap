import { Timestamp } from "firebase/firestore"

/**
 * Formats a Firestore Timestamp into a readable date and time string
 */
export async function formatTimestamp(timestamp: Timestamp | null | undefined): Promise<string> {
  if (!timestamp) return "N/A"

  const date = timestamp.toDate()
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}

/**
 * Formats a Firestore Timestamp into a readable date string
 */
export async function formatDate(timestamp: Timestamp | null | undefined): Promise<string> {
  if (!timestamp) return "N/A"

  const date = timestamp.toDate()
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

/**
 * Formats a Firestore Timestamp into a readable time string
 */
export async function formatTime(timestamp: Timestamp | null | undefined): Promise<string> {
  if (!timestamp) return "N/A"

  const date = timestamp.toDate()
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}

/**
 * Converts a Firestore Timestamp to a JavaScript Date object
 */
export async function timestampToDate(timestamp: Timestamp | null | undefined): Promise<Date | null> {
  if (!timestamp) return null
  return timestamp.toDate()
}

/**
 * Converts a JavaScript Date object to a Firestore Timestamp
 */
export async function dateToTimestamp(date: Date | null | undefined): Promise<Timestamp | null> {
  if (!date) return null
  return Timestamp.fromDate(date)
}

/**
 * Normalizes timestamp fields in a document to be Firestore Timestamp objects.
 * This function recursively traverses the data object and converts any fields
 * that are already Firestore Timestamps, or that can be converted to valid
 * JavaScript Date objects, into Firestore Timestamp objects.
 *
 * @param data The data object to normalize.
 * @returns A new object with normalized timestamp fields.
 */
export function normalizeTimestampFields(data: any): any {
  if (!data || typeof data !== "object") {
    return data
  }

  const normalizedData = { ...data }

  for (const key in normalizedData) {
    if (normalizedData.hasOwnProperty(key)) {
      const value = normalizedData[key]

      if (value instanceof Timestamp) {
        // Already a Timestamp, no need to change
        continue
      } else if (value instanceof Date) {
        // Convert Date to Timestamp
        normalizedData[key] = Timestamp.fromDate(value)
      } else if (typeof value === "string" || typeof value === "number") {
        // Attempt to parse string or number to Date, then to Timestamp
        try {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            normalizedData[key] = Timestamp.fromDate(date)
          }
        } catch (e) {
          // Ignore invalid date strings
        }
      } else if (typeof value === "object") {
        // Recursively normalize nested objects
        normalizedData[key] = normalizeTimestampFields(value)
      }
    }
  }

  return normalizedData
}

