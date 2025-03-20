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
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// Type definitions based on the Firestore collections
export interface CalendarEvent {
  id?: string
  colour: string
  createdAt: Timestamp
  createdBy: string
  date: Timestamp
  notes: string
  title: string
  updatedAt: Timestamp
}

export interface Message {
  id?: string
  content: string
  sender: string
  senderRole: "owner" | "staff"
  createdAt: Timestamp
  readBy: string[]
  attachments: Array<{
    name: string
    url: string
    type: string
  }>
}

export interface Link {
  id?: string
  category: string
  createdAt: Timestamp
  createdBy: string
  description: string
  isActive: boolean
  title: string
  url: string
}

export interface User {
  id?: string
  approved: boolean
  approvedAt?: Timestamp
  approvedBy?: string
  createdAt: Timestamp
  disabled: boolean
  displayName?: string
  email: string
  lastLogin?: Timestamp
  notes?: string
  photoURL?: string
  role: string
  settings?: {
    language?: string
    notifications?: boolean
    theme?: string
  }
  uid: string
  updatedAt?: Timestamp
}

export interface Task {
  id?: string
  assignedBy: string
  assignedTo: string
  completedAt?: Timestamp
  createdAt: Timestamp
  description: string
  dueDate: Timestamp
  priority: string
  status: string
  title: string
  updatedAt: Timestamp
}

export interface Settings {
  id?: string
  allowSignups: boolean
  autoApproveUsers: boolean
  defaultUserRole: string
  maintenanceMode: boolean
  notifications: {
    newUserSignup: boolean
    userApproved: boolean
  }
  securitySettings: {
    forceLogout: boolean
    maxLoginAttempts: number
  }
  updatedAt: Timestamp
  updatedBy: string
}

// Helper function to convert Firestore data
export function convertFirestoreData<T>(doc: QueryDocumentSnapshot<DocumentData>): T {
  const data = doc.data()
  return {
    ...data,
    id: doc.id,
  } as T
}

// Links functions
export async function getLinks(type: "owner" | "staff", activeOnly = true) {
  const collectionName = type === "owner" ? "ownerLinks" : "staffLinks"
  let q = collection(db, collectionName)

  if (activeOnly) {
    q = query(collection(db, collectionName), where("isActive", "==", true))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => convertFirestoreData<Link>(doc))
}

export async function getLink(type: "owner" | "staff", id: string) {
  const collectionName = type === "owner" ? "ownerLinks" : "staffLinks"
  const docRef = doc(db, collectionName, id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  } as Link
}

export async function addLink(type: "owner" | "staff", link: Omit<Link, "id" | "createdAt">) {
  const collectionName = type === "owner" ? "ownerLinks" : "staffLinks"
  const docRef = await addDoc(collection(db, collectionName), {
    ...link,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateLink(type: "owner" | "staff", id: string, link: Partial<Link>) {
  const collectionName = type === "owner" ? "ownerLinks" : "staffLinks"
  const docRef = doc(db, collectionName, id)

  await updateDoc(docRef, {
    ...link,
    updatedAt: serverTimestamp(),
  })

  return true
}

export async function deleteLink(type: "owner" | "staff", id: string) {
  const collectionName = type === "owner" ? "ownerLinks" : "staffLinks"
  const docRef = doc(db, collectionName, id)

  await deleteDoc(docRef)
  return true
}

// Export collections for direct access
export const getLinksCollection = (type: "owner" | "staff") => {
  return collection(db, type === "owner" ? "ownerLinks" : "staffLinks")
}

export const getUsersCollection = () => collection(db, "users")
export const getCalendarCollection = () => collection(db, "calendar")
export const getTasksCollection = () => collection(db, "tasks")
export const getMessagesCollection = () => collection(db, "messages")
export const getSettingsCollection = () => collection(db, "settings")
export const getSignInLogsCollection = () => collection(db, "signInLogs")

