"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function MegaPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to hide the loader after iframe has had time to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen animate-fadeIn">
      <header className="p-6 bg-[#333333] shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight ml-8 md:ml-0">Mega Cloud Storage</h1>
      </header>
      <div className="relative w-full h-[calc(100vh-8rem)]">
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-[#333333] z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] scale-100">
            <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
            <p className="text-white text-xl text-center">Loading Mega...</p>
          </div>
        </div>
        <div
          className={`w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isLoading ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
          }`}
        >
          <iframe
            src="https://mega.nz/login"
            className="w-full h-full border-none"
            title="Mega Cloud Storage"
            onLoad={() => setIsLoading(false)}
            allow="clipboard-write; clipboard-read"
          />
        </div>
      </div>
    </div>
  )
}

