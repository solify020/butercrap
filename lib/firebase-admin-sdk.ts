import { cookies } from "next/headers"

// Import firebase-admin
let admin: any
try {
  // Use dynamic import to avoid webpack processing
  admin = require("firebase-admin")
} catch (error) {
  console.error("Error importing firebase-admin:", error)
  admin = {}
}

// Types for our Firebase Admin SDK
interface FirebaseAdminAuth {
  verifyIdToken: (token: string) => Promise<any>
  createCustomToken: (uid: string) => Promise<string>
  getUserByEmail: (email: string) => Promise<any>
  // Add other methods as needed
}

interface FirebaseAdminFirestore {
  collection: (path: string) => any
  doc: (path: string) => any
  // Add other methods as needed
}

interface FirebaseAdminStorage {
  bucket: (name?: string) => any
  // Add other methods as needed
}

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps && !admin.apps.length) {
  try {
    // Parse the service account key from environment variable
    let serviceAccount

    if (process.env.FIREBASE_ADMIN_SDK_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_SERVICE_ACCOUNT_KEY)
      } catch (e) {
        console.error("Error parsing service account key:", e)
      }
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      try {
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }
      } catch (e) {
        console.error("Error creating service account from env vars:", e)
      }
    }

    // Initialize the app with the service account
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin SDK initialized successfully")
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error)
  }
}

// Create the auth and firestore instances
const auth = admin.auth ? admin.auth() : {}
const db = admin.firestore ? admin.firestore() : {}
const storage = admin.storage ? admin.storage() : {}

// Helper functions
async function getAdminAuth(): Promise<FirebaseAdminAuth> {
  return admin.auth ? admin.auth() : {}
}

async function getAdminFirestore(): Promise<FirebaseAdminFirestore> {
  return admin.firestore ? admin.firestore() : {}
}

async function getAdminStorage(): Promise<FirebaseAdminStorage> {
  return admin.storage ? admin.storage() : {}
}

async function convertFirestoreData(doc: any) {
  if (!doc || !doc.exists) {
    return null
  }

  const data = doc.data ? doc.data() : {}
  const id = doc.id

  // Convert Firestore Timestamps to JavaScript Dates
  const formattedData: Record<string, any> = {}

  for (const key in data) {
    if (data[key] && typeof data[key].toDate === "function") {
      formattedData[key] = data[key].toDate()
    } else {
      formattedData[key] = data[key]
    }
  }

  return {
    ...formattedData,
    id,
  }
}

// Helper function to get the current user from the session cookie
async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      return null
    }

    const auth = await getAdminAuth()
    const decodedClaims = await auth.verifyIdToken(sessionCookie, true)

    if (!decodedClaims) {
      return null
    }

    return decodedClaims
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Export everything
// import admin from './firebase-admin/index.js';

export default admin
export { admin }
export { auth, db, storage, getAdminAuth, getAdminFirestore, getAdminStorage, convertFirestoreData, getCurrentUser }

