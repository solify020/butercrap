// Test file to verify exports from firebase-admin.js
const firebaseAdmin = require("./firebase-admin.js")

console.log("Default export (admin):", typeof firebaseAdmin.default)
console.log("Named exports:")
console.log("- admin:", typeof firebaseAdmin.admin)
console.log("- auth:", typeof firebaseAdmin.auth)
console.log("- db:", typeof firebaseAdmin.db)
console.log("- adminAuth:", typeof firebaseAdmin.adminAuth)
console.log("- adminDb:", typeof firebaseAdmin.adminDb)
console.log("- adminStorage:", typeof firebaseAdmin.adminStorage)
console.log("- getAdminAuth:", typeof firebaseAdmin.getAdminAuth)
console.log("- getFirebaseAdminApp:", typeof firebaseAdmin.getFirebaseAdminApp)
console.log("- convertFirestoreData:", typeof firebaseAdmin.convertFirestoreData)

// Test the functions
try {
  const auth = firebaseAdmin.getAdminAuth()
  console.log("getAdminAuth() returned:", typeof auth)
} catch (e) {
  console.error("Error calling getAdminAuth():", e)
}

try {
  const app = firebaseAdmin.getFirebaseAdminApp()
  console.log("getFirebaseAdminApp() returned:", typeof app)
} catch (e) {
  console.error("Error calling getFirebaseAdminApp():", e)
}

// Create a mock Firestore document
const mockDoc = {
  exists: true,
  id: "test-doc",
  data: () => ({
    name: "Test Document",
    createdAt: {
      toDate: () => new Date(),
    },
  }),
}

try {
  const data = firebaseAdmin.convertFirestoreData(mockDoc)
  console.log("convertFirestoreData() returned:", data)
} catch (e) {
  console.error("Error calling convertFirestoreData():", e)
}

