import { NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const admin = getFirebaseAdminApp()
    const { uid, action } = await request.json()

    if (!uid) {
      return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 })
    }

    // Get the user
    const user = await admin.auth().getUser(uid)

    let result

    switch (action) {
      case "make_owner":
        // Set custom claims to make user an owner
        await admin.auth().setCustomUserClaims(uid, {
          role: "owner",
          approved: true,
        })

        // Update or create user document
        await admin.firestore().collection("users").doc(uid).set(
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "owner",
            approved: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )

        // Delete from pending users if exists
        await admin
          .firestore()
          .collection("pendingUsers")
          .doc(uid)
          .delete()
          .catch(() => {})

        result = "User has been made an owner"
        break

      case "approve_user":
        // Set custom claims to approve user
        await admin.auth().setCustomUserClaims(uid, {
          role: "staff",
          approved: true,
        })

        // Get pending user data
        const pendingUserDoc = await admin.firestore().collection("pendingUsers").doc(uid).get()
        const pendingUserData = pendingUserDoc.exists ? pendingUserDoc.data() : {}

        // Create user document
        await admin
          .firestore()
          .collection("users")
          .doc(uid)
          .set(
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: "staff",
              approved: true,
              createdAt: pendingUserData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          )

        // Delete from pending users
        await admin
          .firestore()
          .collection("pendingUsers")
          .doc(uid)
          .delete()
          .catch(() => {})

        result = "User has been approved and made staff"
        break

      case "create_system_settings":
        // Create system settings document if it doesn't exist
        await admin.firestore().collection("settings").doc("system").set(
          {
            autoApproveUsers: false,
            maintenanceMode: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: uid,
          },
          { merge: true },
        )

        result = "System settings document created/updated"
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    console.error("Error in fix-permissions debug endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix permissions",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

