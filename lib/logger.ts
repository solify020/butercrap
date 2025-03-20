/**
 * Simple logger utility for consistent logging across the application
 */

// Log levels
export type LogLevel = "debug" | "info" | "warn" | "error"

// Logger configuration
const config = {
  enabled: process.env.NODE_ENV !== "test",
  minLevel: (process.env.LOG_LEVEL || "info") as LogLevel,
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
}

// Determine if a log level should be displayed based on minimum level setting
const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false
  return config.levels[level] >= config.levels[config.minLevel]
}

// Safe stringification of objects for logging
const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        // Handle circular references and functions
        if (typeof value === "function") return "[Function]"
        if (typeof value === "object" && value !== null) {
          if (key === "password" || key === "token" || key.includes("secret")) {
            return "[REDACTED]"
          }
        }
        return value
      },
      2,
    )
  } catch (err) {
    return `[Object cannot be stringified: ${err}]`
  }
}

// Format log message with timestamp and level
const formatMessage = (level: LogLevel, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString()
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

  if (meta) {
    formattedMessage += ` ${safeStringify(meta)}`
  }

  return formattedMessage
}

// Logger methods
export const logger = {
  debug: (message: string, meta?: any) => {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", message, meta))
    }
  },

  info: (message: string, meta?: any) => {
    if (shouldLog("info")) {
      console.info(formatMessage("info", message, meta))
    }
  },

  warn: (message: string, meta?: any) => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, meta))
    }
  },

  error: (message: string, meta?: any) => {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message, meta))
    }
  },
}

export default logger

