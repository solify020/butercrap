import { NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const admin = getFirebaseAdminApp()
    const { uid } = await request.json()

    if (!uid) {
      return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 })
    }

    // Get the user's custom claims
    const user = await admin.auth().getUser(uid)
    const customClaims = user.customClaims || {}

    // Get the user document from Firestore
    const userDoc = await admin.firestore().collection("users").doc(uid).get()
    const pendingUserDoc = await admin.firestore().collection("pendingUsers").doc(uid).get()

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        providerData: user.providerData,
        metadata: user.metadata,
      },
      customClaims,
      firestoreData: {
        inUsersCollection: userDoc.exists,
        userData: userDoc.exists ? userDoc.data() : null,
        inPendingUsersCollection: pendingUserDoc.exists,
        pendingUserData: pendingUserDoc.exists ? pendingUserDoc.data() : null,
      },
      permissionStatus: {
        isOwner: customClaims.role === "owner" || customClaims.adminBypass === true,
        isStaff: customClaims.role === "staff" || customClaims.role === "owner" || customClaims.adminBypass === true,
        isApproved: customClaims.approved === true || customClaims.adminBypass === true,
      },
    })
  } catch (error) {
    console.error("Error in user-claims debug endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get user claims",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

