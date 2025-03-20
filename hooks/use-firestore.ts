"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import type { FirestoreError } from "firebase/firestore"

// Check if we're running on the client side
const isBrowser = typeof window !== "undefined"

type FirestoreData<T> = {
  id: string
  data: T
}

type FirestoreState<T> = {
  data: FirestoreData<T>[]
  loading: boolean
  error: FirestoreError | null
}

export function useFirestore<T>(collectionName: string, constraints: any[] = []) {
  const [state, setState] = useState<FirestoreState<T>>({
    data: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Only run on the client side
    if (!isBrowser) {
      return
    }

    // Import Firebase modules dynamically to avoid SSR issues
    const {
      collection,
      query,
      onSnapshot,
      addDoc,
      updateDoc,
      deleteDoc,
      doc,
      Timestamp,
      getDocs,
      where,
    } = require("firebase/firestore")

    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...constraints)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as T,
        }))
        setState({
          data,
          loading: false,
          error: null,
        })
      },
      (error) => {
        console.error("Firestore error:", error)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as FirestoreError,
        }))
      },
    )

    return () => unsubscribe()
  }, [collectionName, JSON.stringify(constraints)])

  const add = async (data: Omit<T, "id">) => {
    if (!isBrowser) return null

    try {
      const { collection, addDoc, Timestamp } = require("firebase/firestore")
      const collectionRef = collection(db, collectionName)
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding document:", error)
      throw error
    }
  }

  const update = async (id: string, data: Partial<T>) => {
    if (!isBrowser) return

    try {
      const { doc, updateDoc, Timestamp } = require("firebase/firestore")
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating document:", error)
      throw error
    }
  }

  const remove = async (id: string) => {
    if (!isBrowser) return

    try {
      const { doc, deleteDoc } = require("firebase/firestore")
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting document:", error)
      throw error
    }
  }

  const getById = async (id: string) => {
    if (!isBrowser) return null

    try {
      const { collection, query, where, getDocs } = require("firebase/firestore")
      const docSnap = await getDocs(query(collection(db, collectionName), where("__name__", "==", id)))
      if (docSnap.empty) {
        return null
      }
      const document = docSnap.docs[0]
      return {
        id: document.id,
        data: document.data() as T,
      }
    } catch (error) {
      console.error("Error getting document:", error)
      throw error
    }
  }

  return {
    ...state,
    add,
    update,
    remove,
    getById,
  }
}

