import { doc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { normalizeTimestampFields } from "@/lib/timestamp-utils"

/**
 * Creates a new document with normalized timestamp fields
 */
export async function createDocument(collectionPath: string, data: any, id?: string) {
  try {
    // Normalize any timestamp fields
    const normalizedData = normalizeTimestampFields(data)

    if (id) {
      // Create with specific ID
      const docRef = doc(db, collectionPath, id)
      await setDoc(docRef, normalizedData)
      return { id, ...normalizedData }
    } else {
      // Create with auto-generated ID
      const docRef = await addDoc(collection(db, collectionPath), normalizedData)
      return { id: docRef.id, ...normalizedData }
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionPath}:`, error)
    throw error
  }
}

/**
 * Updates a document with normalized timestamp fields
 */
export async function updateDocument(collectionPath: string, id: string, data: any) {
  try {
    // Normalize any timestamp fields
    const normalizedData = normalizeTimestampFields(data)

    const docRef = doc(db, collectionPath, id)
    await updateDoc(docRef, normalizedData)
    return { id, ...normalizedData }
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionPath}:`, error)
    throw error
  }
}

