// Use modular imports to avoid node: scheme issues
const { initializeApp, getApps, cert } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")
const { getAuth } = require("firebase-admin/auth")
const { getStorage } = require("firebase-admin/storage")

// Initialize Firebase Admin SDK if not already initialized
let adminApp

if (getApps().length === 0) {
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
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }
      } catch (e) {
        console.error("Error creating service account from env vars:", e)
      }
    }

    // Initialize the app with the service account
    adminApp = initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin SDK initialized successfully")
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error)
  }
} else {
  adminApp = getApps()[0]
}

// Create the auth and firestore instances
const auth = getAuth(adminApp)
const db = getFirestore(adminApp)
const storage = getStorage(adminApp)

// Helper functions
function convertFirestoreData(doc) {
  if (!doc || !doc.exists) {
    return null
  }

  const data = doc.data()
  const id = doc.id

  // Convert Firestore Timestamps to JavaScript Dates
  const formattedData = {}

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

// Export everything
module.exports = {
  app: adminApp,
  auth,
  db,
  storage,
  adminAuth: auth,
  adminDb: db,
  adminStorage: storage,
  convertFirestoreData,
}

