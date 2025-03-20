"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SlideUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4",
        className,
      )}
    >
      {children}
    </div>
  )
}

