import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#404040] z-50">
      <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
      <p className="text-white text-lg">{message}</p>
    </div>
  )
}

