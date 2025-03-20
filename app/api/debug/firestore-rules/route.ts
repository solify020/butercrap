import { NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const admin = getFirebaseAdminApp()

    // This endpoint provides information about recommended Firestore rules
    // and helps diagnose permission issues

    return NextResponse.json({
      success: true,
      message: "Firestore rules debugging information",
      recommendedRules: {
        description: "These rules are recommended for your application structure",
        rulesLocation: "Firebase Console > Firestore Database > Rules",
        howToApply: "Copy the rules from /lib/firebase-rules.txt and paste them in the Firebase Console",
        commonIssues: [
          "Missing role or approved claims in Firebase Auth custom claims",
          "Incorrect collection structure",
          "Missing documents in settings collection",
          "User trying to access data they don't have permission for",
        ],
        troubleshooting: [
          "Check if user has correct custom claims using the /api/debug/user-claims endpoint",
          "Verify collection and document structure matches what the rules expect",
          "Ensure system settings document exists with correct fields",
          "Check if user is properly authenticated before accessing protected data",
        ],
      },
    })
  } catch (error) {
    console.error("Error in firestore-rules debug endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get Firestore rules debugging information",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

