import { db } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"

// Generic type for Firestore documents
export interface FirestoreDoc {
  id: string
  [key: string]: any
}

// Convert Firestore timestamps to ISO strings for JSON
export function formatDoc(doc: any): FirestoreDoc {
  const data = { ...doc }

  // Convert all Timestamp fields to ISO strings
  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate().toISOString()
    }
  })

  return data
}

// Get a single document by ID
export async function getDocument<T extends FirestoreDoc>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...formatDoc(docSnap.data()),
    } as T
  } catch (error) {
    console.error(`Error getting ${collectionName} document:`, error)
    return null
  }
}

// Get multiple documents with optional query
export async function getDocuments<T extends FirestoreDoc>(
  collectionName: string,
  conditions?: { field: string; operator: string; value: any }[],
  sortField?: string,
  sortDirection?: "asc" | "desc",
  limitCount?: number,
): Promise<T[]> {
  try {
    let q = collection(db, collectionName)

    // Apply conditions if provided
    if (conditions && conditions.length > 0) {
      q = query(q, ...conditions.map((c) => where(c.field, c.operator as any, c.value)))
    }

    // Apply sorting if provided
    if (sortField) {
      q = query(q, orderBy(sortField, sortDirection || "asc"))
    }

    // Apply limit if provided
    if (limitCount) {
      q = query(q, limit(limitCount))
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...formatDoc(doc.data()),
    })) as T[]
  } catch (error) {
    console.error(`Error getting ${collectionName} documents:`, error)
    return []
  }
}

// Add a new document
export async function addDocument<T>(collectionName: string, data: Omit<T, "id">): Promise<FirestoreDoc | null> {
  try {
    // Add timestamps
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, collectionName), docData)

    return {
      id: docRef.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error adding ${collectionName} document:`, error)
    return null
  }
}

// Update an existing document
export async function updateDocument(collectionName: string, docId: string, data: any): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId)

    // Add updated timestamp
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, updateData)
    return true
  } catch (error) {
    console.error(`Error updating ${collectionName} document:`, error)
    return false
  }
}

// Delete a document
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error(`Error deleting ${collectionName} document:`, error)
    return false
  }
}

