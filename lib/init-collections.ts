import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import Cookies from "js-cookie"

// Function to ensure collections exist with at least one document
export async function initializeCollections() {
  try {
    if (!db) {
      console.error("Firestore not initialized")
      return false
    }

    // Get the user role to determine which collections to initialize
    const userRole = Cookies.get("user-role")

    // Initialize only the collections the user has access to
    if (userRole === "owner") {
      try {
        // Owner can only initialize owner-links
        const ownerLinksRef = collection(db, "owner-links")
        const ownerLinksSnapshot = await getDocs(ownerLinksRef)

        // If empty, add a sample link
        if (ownerLinksSnapshot.empty) {
          await setDoc(doc(db, "owner-links", "sample"), {
            name: "BUTERASCP Website",
            url: "https://buterascp.com",
            type: "site",
            createdAt: new Date(),
          })
        }

        // Check if admin settings document exists
        const adminSettingsRef = doc(db, "admin", "settings")
        await setDoc(
          adminSettingsRef,
          {
            maintenanceMode: false,
            notificationsEnabled: true,
            sessionTimeoutMinutes: 60,
            requireTwoFactor: false,
            allowedDomains: "buterascp.com",
            updatedAt: new Date(),
          },
          { merge: true },
        )

        console.log("Owner collections initialized successfully")
      } catch (error) {
        console.error("Error initializing owner collections:", error)
      }
    } else if (userRole === "staff") {
      try {
        // Staff can only initialize staff-links
        const staffLinksRef = collection(db, "staff-links")
        const staffLinksSnapshot = await getDocs(staffLinksRef)

        // If empty, add a sample link
        if (staffLinksSnapshot.empty) {
          await setDoc(doc(db, "staff-links", "sample"), {
            name: "Staff Portal",
            url: "https://staff.buterascp.com",
            type: "site",
            createdAt: new Date(),
          })
        }

        console.log("Staff collections initialized successfully")
      } catch (error) {
        console.error("Error initializing staff collections:", error)
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing collections:", error)
    return false
  }
}

