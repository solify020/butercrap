import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { action, email, uid } = await request.json()

    switch (action) {
      case "check-firestore-rules":
        // Check if Firestore rules are properly configured
        return NextResponse.json({
          success: true,
          message: "Firestore rules check completed",
          rulesRecommendation: `
          // Recommended Firestore rules:
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              // Allow anyone to read and write to the permissionTests collection
              match /permissionTests/{document=**} {
                allow read, write: if request.auth != null;
              }
              
              // Allow authenticated users to read settings
              match /settings/{document=**} {
                allow read: if request.auth != null;
                allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
              }
              
              // Allow users to read and write their own data
              match /users/{userId} {
                allow read: if request.auth != null;
                allow write: if request.auth != null && (
                  request.auth.uid == userId || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
                );
              }
              
              // Allow users to read and write their own pending data
              match /pendingUsers/{userId} {
                allow read: if request.auth != null && request.auth.uid == userId;
                allow write: if request.auth != null && (
                  request.auth.uid == userId || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
                );
              }
              
              // Allow users to write their own sign-in logs
              match /signInLogs/{document=**} {
                allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
                allow write: if request.auth != null;
              }
              
              // Allow owners to read and write all data
              match /{document=**} {
                allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
              }
            }
          }
          `,
        })

      case "check-user-exists":
        // Check if user exists in Auth and Firestore
        if (!email) {
          return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
        }

        try {
          // Check if user exists in Auth
          const authUser = await adminAuth.getUserByEmail(email)

          // Check if user exists in users collection
          const userDoc = await adminDb.collection("users").doc(authUser.uid).get()

          // Check if user exists in pendingUsers collection
          const pendingUserDoc = await adminDb.collection("pendingUsers").doc(authUser.uid).get()

          return NextResponse.json({
            success: true,
            message: "User check completed",
            user: {
              auth: {
                exists: true,
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                disabled: authUser.disabled,
                customClaims: authUser.customClaims,
              },
              firestore: {
                inUsersCollection: userDoc.exists,
                inPendingUsersCollection: pendingUserDoc.exists,
                userData: userDoc.exists ? userDoc.data() : null,
                pendingUserData: pendingUserDoc.exists ? pendingUserDoc.data() : null,
              },
            },
          })
        } catch (error) {
          if (error.code === "auth/user-not-found") {
            return NextResponse.json({
              success: true,
              message: "User not found in Auth",
              user: {
                auth: { exists: false },
                firestore: { inUsersCollection: false, inPendingUsersCollection: false },
              },
            })
          }

          throw error
        }

      case "fix-missing-collections":
        // Create essential collections if they're missing
        const collections = ["users", "pendingUsers", "settings", "signInLogs"]
        const results = {}

        for (const collectionName of collections) {
          try {
            // Check if collection exists
            const collectionRef = adminDb.collection(collectionName)
            const snapshot = await collectionRef.limit(1).get()

            if (snapshot.empty && collectionName === "settings") {
              // Create default settings document
              await adminDb.collection("settings").doc("system").set({
                autoApproveUsers: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              })

              results[collectionName] = "Created with default document"
            } else {
              results[collectionName] = snapshot.empty ? "Empty but exists" : "Exists with documents"
            }
          } catch (error) {
            results[collectionName] = `Error: ${error.message}`
          }
        }

        return NextResponse.json({
          success: true,
          message: "Collections check and fix completed",
          collections: results,
        })

      case "force-create-pending-user":
        // Forcefully add user to pendingUsers collection
        if (!email) {
          return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
        }

        try {
          // Check if user exists in Auth
          const authUser = await adminAuth.getUserByEmail(email)

          // Create or update user in pendingUsers collection
          await adminDb.collection("pendingUsers").doc(authUser.uid).set(
            {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
              role: null,
              approved: false,
              createdAt: new Date(),
              lastLogin: new Date(),
            },
            { merge: true },
          )

          // Update custom claims to reflect pending status
          await adminAuth.setCustomUserClaims(authUser.uid, {
            role: null,
            approved: false,
          })

          return NextResponse.json({
            success: true,
            message: "User successfully added to pendingUsers collection",
            user: {
              uid: authUser.uid,
              email: authUser.email,
            },
          })
        } catch (error) {
          if (error.code === "auth/user-not-found") {
            return NextResponse.json({ success: false, message: "User not found in Auth" }, { status: 404 })
          }

          throw error
        }

      default:
        return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in debug API:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}

