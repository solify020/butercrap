// Environment variables utility
export const env = {
  // Firebase config
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    useEmulator: process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true",
  },

  // Auth config
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    skipAuth: process.env.SKIP_AUTH === "true",
  },

  // App config
  app: {
    url: process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "http://localhost:3000",
    ownerEmail: process.env.OWNER_EMAIL || process.env.NEXT_PUBLIC_OWNER_EMAIL,
    staffEmail: process.env.STAFF_EMAIL || process.env.NEXT_PUBLIC_STAFF_EMAIL,
    enableForceLogout: process.env.ENABLE_FORCE_LOGOUT === "true",
  },

  // Check if we're in development mode
  isDev: process.env.NODE_ENV === "development",

  // Check if we're in production mode
  isProd: process.env.NODE_ENV === "production",
}

