import { type NextRequest, NextResponse } from "next/server"
import { adminStorage } from "@/lib/firebase-admin"
import { getServerSession } from "@/lib/auth-utils"
import { v4 as uuidv4 } from "uuid"

// POST to get a signed URL for uploading a file
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the file data from the request
    const { fileName, contentType, folder } = await request.json()

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique file name
    const uniqueFileName = `${folder || "uploads"}/${session.uid}/${uuidv4()}-${fileName}`

    // Create a reference to the file
    const fileRef = adminStorage.bucket().file(uniqueFileName)

    // Generate a signed URL for uploading
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    })

    // Return the signed URL and the file path
    return NextResponse.json({
      signedUrl,
      filePath: uniqueFileName,
      downloadUrl: `https://storage.googleapis.com/${adminStorage.bucket().name}/${uniqueFileName}`,
    })
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

