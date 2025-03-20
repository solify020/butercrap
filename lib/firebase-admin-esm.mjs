import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Parse the service account key from environment variable
    let serviceAccount;
    try {
      if (process.env.FIREBASE_ADMIN_SDK_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_SERVICE_ACCOUNT_KEY);
      } else if (process.env.FIREBASE_PRIVATE_KEY) {
        // Fallback to individual credential components
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        };
      }
    } catch (e) {
      console.error("Error parsing Firebase service account:", e);
      serviceAccount = undefined;
    }

    // Initialize the app with the service account
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}

// Create all the required exports
const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();
const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

// Helper functions
const getAdminAuth = () => admin.auth();
const getFirebaseAdminApp = () => admin.app();

// Helper function to convert Firestore data
const convertFirestoreData = (doc) => {
  if (!doc || !doc.exists) {
    return null;
  }

  const data = doc.data();
  const id = doc.id;

  // Convert Firestore Timestamps to JavaScript Dates
  const formattedData = {};

  for (const key in data) {
    if (data[key] && typeof data[key].toDate === "function") {
      formattedData[key] = data[key].toDate();
    } else {
      formattedData[key] = data[key];
    }
  }

  return {
    ...formattedData,
    id,
  };
};

// Export everything
export default admin;
export {
  admin,
  auth,
  db,
  storage,
  adminAuth,
  adminDb,
  adminStorage,
  getAdminAuth,
  getFirebaseAdminApp,
  convertFirestoreData
};

