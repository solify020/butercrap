import type React from "react"
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This empty layout prevents any parent layouts from affecting the login page
  return children
}

