import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// Specify Node.js runtime
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  console.log("TEST FIRESTORE API ROUTE CALLED")

  try {
    // Test if we can access Firestore
    console.log("Testing Firestore access...")

    // Try to get a document from a test collection
    try {
      const testDoc = await adminDb.collection("test").doc("test").get()
      console.log("Test document fetched, exists:", testDoc.exists)

      // If the test document doesn't exist, create it
      if (!testDoc.exists) {
        console.log("Test document does not exist, creating it...")

        try {
          await adminDb.collection("test").doc("test").set({
            message: "Firestore is working!",
            timestamp: new Date(),
          })
          console.log("Test document created successfully")
        } catch (createError) {
          console.error("Error creating test document:", createError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create test document",
              details: createError.message,
            },
            { status: 500 },
          )
        }
      } else {
        // Update the test document
        console.log("Test document exists, updating it...")

        try {
          await adminDb.collection("test").doc("test").update({
            message: "Firestore is working!",
            timestamp: new Date(),
          })
          console.log("Test document updated successfully")
        } catch (updateError) {
          console.error("Error updating test document:", updateError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to update test document",
              details: updateError.message,
            },
            { status: 500 },
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: "Firestore is working properly!",
      })
    } catch (firestoreError) {
      console.error("Error accessing Firestore:", firestoreError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to access Firestore",
          details: firestoreError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected error in test-firestore API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

