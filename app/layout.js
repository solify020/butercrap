import "./globals.css"

export const metadata = {
  title: "BUTERASCP Portal",
  description: "Admin portal for BUTERASCP",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

