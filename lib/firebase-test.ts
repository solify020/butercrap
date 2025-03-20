import { auth, db, storage } from "./firebase"

// Simple function to test if Firebase imports work
export function testFirebaseImports() {
  return {
    auth: !!auth,
    db: !!db,
    storage: !!storage,
    message: "Firebase imports are working correctly",
  }
}

