import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "@/lib/firebase"

// Initialize Firebase Storage with better error handling
let storage
try {
  // Only initialize if app is defined
  if (app) {
    storage = getStorage(app)
    console.log("Firebase Storage initialized successfully")
  } else {
    console.error("Firebase app is not initialized, cannot initialize storage")
  }
} catch (error) {
  console.error("Error initializing Firebase Storage:", error)
}

/**
 * Uploads an image to Firebase Storage and returns the download URL
 * @param file The file to upload
 * @param path The path in storage where the file should be stored
 * @returns Promise with the download URL
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  // Check if storage is initialized
  if (!storage) {
    console.error("Firebase Storage is not initialized")
    throw new Error("Storage service is not available. Please try again later.")
  }

  try {
    // Create a storage reference
    const storageRef = ref(storage, path)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    console.log("File uploaded successfully:", snapshot.ref.fullPath)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("Download URL obtained:", downloadURL)

    return downloadURL
  } catch (error: any) {
    console.error("Error uploading image:", error)

    // More detailed error messages based on error code
    if (error.code === "storage/unauthorized") {
      throw new Error("Permission denied: You don't have permission to access this storage location.")
    } else if (error.code === "storage/canceled") {
      throw new Error("Upload canceled: The upload operation was canceled.")
    } else if (error.code === "storage/unknown") {
      throw new Error("Upload failed: The storage service is currently unavailable. Please try again later.")
    } else {
      throw new Error(`Failed to upload image: ${error.message || "Unknown error"}`)
    }
  }
}

