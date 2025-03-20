import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#222222] text-white">
      <div className="w-full max-w-md p-8 bg-[#333333] rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <FileQuestion className="h-16 w-16 text-[#999999]" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-6">The page you are looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col gap-4">
          <Button asChild className="w-full bg-[#444444] hover:bg-[#555555]">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent border-gray-700 hover:bg-[#444444]">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

