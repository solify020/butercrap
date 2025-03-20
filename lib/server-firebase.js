// Server-side Firebase operations using CommonJS
const admin = require("./firebase-admin")

// Helper function to get user by email
async function getUserByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email)
    return userRecord
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

// Helper function to get user by UID
async function getUserByUid(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid)
    return userRecord
  } catch (error) {
    console.error("Error fetching user by UID:", error)
    return null
  }
}

// Helper function to get user custom claims
async function getUserClaims(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid)
    return userRecord.customClaims || {}
  } catch (error) {
    console.error("Error fetching user claims:", error)
    return {}
  }
}

// Helper function to set user custom claims
async function setUserClaims(uid, claims) {
  try {
    await admin.auth().setCustomUserClaims(uid, claims)
    return true
  } catch (error) {
    console.error("Error setting user claims:", error)
    return false
  }
}

// Helper function to get document from Firestore
async function getDocument(collection, docId) {
  try {
    const docRef = admin.db.collection(collection).doc(docId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return {
      id: doc.id,
      ...doc.data(),
    }
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collection}:`, error)
    return null
  }
}

// Helper function to query documents from Firestore
async function queryDocuments(collection, queryFn) {
  try {
    let query = admin.db.collection(collection)

    if (queryFn) {
      query = queryFn(query)
    }

    const snapshot = await query.get()

    const results = []
    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return results
  } catch (error) {
    console.error(`Error querying documents from ${collection}:`, error)
    return []
  }
}

module.exports = {
  getUserByEmail,
  getUserByUid,
  getUserClaims,
  setUserClaims,
  getDocument,
  queryDocuments,
  admin,
}

