// Import firebase-admin
const admin = require("firebase-admin")

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

// Export the initialized admin
module.exports = admin

