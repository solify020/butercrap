// Import firebase-admin
const admin = require("firebase-admin")

// Initialize Firebase Admin SDK if not already initialized
function initAdmin() {
  if (!admin.apps.length) {
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
      admin.initializeApp({
        credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })

      console.log("Firebase Admin SDK initialized successfully")
    } catch (error) {
      console.error("Firebase Admin SDK initialization error:", error)
    }
  }
  return admin
}

// Initialize admin
const adminInstance = initAdmin()
const adminApp = adminInstance.app()
const adminDb = adminInstance.firestore()
const adminAuth = adminInstance.auth()
const adminStorage = adminInstance.storage()

// Alias exports for compatibility
const db = adminDb
const auth = adminAuth
const storage = adminStorage

// Helper function to get admin auth
function getAdminAuth() {
  return adminAuth
}

// Helper function to get Firebase admin app
function getFirebaseAdminApp() {
  return adminApp
}

// Helper function to convert Firestore data
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

// Export all required items
module.exports = {
  admin: adminInstance,
  adminApp,
  adminDb,
  adminAuth,
  adminStorage,
  db,
  auth,
  storage,
  initAdmin,
  getAdminAuth,
  getFirebaseAdminApp,
  convertFirestoreData,
  default: adminInstance,
}

