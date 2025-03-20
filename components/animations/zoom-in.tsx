"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ZoomInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function ZoomIn({ children, className, delay = 0 }: ZoomInProps) {
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
        isVisible ? "opacity-100 transform scale-100" : "opacity-0 transform scale-95",
        className,
      )}
    >
      {children}
    </div>
  )
}

