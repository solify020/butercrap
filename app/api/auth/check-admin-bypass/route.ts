import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ bypass: false }, { status: 400 })
    }

    // Check if admin bypass is enabled
    const enableAdminBypass = process.env.ENABLE_ADMIN_BYPASS === "true"

    // Check if the email matches the admin bypass email
    const adminBypassEmail = process.env.ADMIN_BYPASS_EMAIL
    const isAdminBypassEmail = adminBypassEmail && email.toLowerCase() === adminBypassEmail.toLowerCase()

    // Return the result
    return NextResponse.json({
      bypass: enableAdminBypass && isAdminBypassEmail,
    })
  } catch (error) {
    console.error("Error checking admin bypass:", error)
    return NextResponse.json({ bypass: false }, { status: 500 })
  }
}

