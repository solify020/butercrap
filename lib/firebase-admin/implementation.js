// Create a placeholder object for client-side rendering
const clientSideStub = {
  auth: {},
  db: {},
  storage: {},
  adminAuth: {},
  adminDb: {},
  adminStorage: {},
  convertFirestoreData: () => null,
  getAdminAuth: () => ({}),
  getFirebaseAdminApp: () => ({}),
}

// Only load firebase-admin on the server
if (typeof window === "undefined") {
  // Server-side code
  try {
    // Use a function to isolate the require from webpack static analysis
    const loadAdmin = new Function('return require("firebase-admin")')
    const admin = loadAdmin()

    // Initialize Firebase Admin SDK if not already initialized
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

    // Export the admin SDK and its services
    module.exports = {
      auth: admin.auth(),
      db: admin.firestore(),
      storage: admin.storage(),
      adminAuth: admin.auth(),
      adminDb: admin.firestore(),
      adminStorage: admin.storage(),
      convertFirestoreData,
      getAdminAuth: () => admin.auth(),
      getFirebaseAdminApp: () => admin.app(),
    }
  } catch (error) {
    console.error("Error loading firebase-admin:", error)
    module.exports = clientSideStub
  }
} else {
  // Client-side code - export empty stubs
  module.exports = clientSideStub
}

