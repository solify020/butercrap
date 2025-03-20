// Static exports for all required items
const admin = {}
const adminApp = {}
const adminDb = {}
const adminAuth = {}
const adminStorage = {}
const db = {}
const auth = {}
const storage = {}

// Helper functions
function initAdmin() {
  return admin
}

function getAdminAuth() {
  return adminAuth
}

function getFirebaseAdminApp() {
  return adminApp
}

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
  admin,
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
}

// Set default export
module.exports.default = admin

