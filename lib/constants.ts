// This file should only be imported by server-side code
// These constants should never be exposed to the client

export const COLLECTIONS = {
  // User collections
  OWNER_LINKS: "owner-links",
  STAFF_LINKS: "staff-links",
  USER_PROFILES: "user-profiles",

  // System collections
  ADMIN_SETTINGS: "admin-settings",
  SIGN_IN_LOGS: "sign-in-logs",
  CALENDAR_EVENTS: "calendar-events",
}

export const DOCUMENTS = {
  ADMIN_SETTINGS: "global",
  FORCE_LOGOUT: "force-logout",
}

