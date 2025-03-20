"use client"

import { useEffect, useState } from "react"
import LinkList from "@/components/links/link-list"

export default function LinksPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <LinkList />
    </div>
  )
}

