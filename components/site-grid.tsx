"use client"

import { useState, useEffect } from "react"
import { X, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SiteLink {
  id: string
  title: string
  url: string
  imageUrl: string
}

interface SiteGridProps {
  links: SiteLink[]
  onDelete?: (id: string) => void
  onEdit?: (link: SiteLink) => void
}

export default function SiteGrid({ links = [], onDelete, onEdit }: SiteGridProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  return (
    <div className="site-grid-container grid-z-index-fix">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sites</h2>
        <Button onClick={toggleEditMode} className="bg-[#333333] hover:bg-[#444444] text-white border-none" size="sm">
          {isEditMode ? "Done" : "Edit Links"}
        </Button>
      </div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      >
        {links.map((link, index) => (
          <div
            key={link.id}
            className={`relative group ${isEditMode ? "edit-mode-shake" : ""}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {isEditMode && (
              <button
                onClick={() => onDelete && onDelete(link.id)}
                className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 shadow-lg"
                aria-label={`Delete ${link.title}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <a
              href={isEditMode ? undefined : link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block bg-[#333333] rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl ${isEditMode ? "cursor-move" : "cursor-pointer"}`}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault()
                  onEdit && onEdit(link)
                }
              }}
            >
              <div className="aspect-video bg-[#444444] relative overflow-hidden">
                {link.imageUrl ? (
                  <img
                    src={link.imageUrl || "/placeholder.svg"}
                    alt={link.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#444444] text-white/50">
                    No Image
                  </div>
                )}

                {!isEditMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#333333] text-white border-[#444444]">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit && onEdit(link)
                        }}
                        className="hover:bg-[#444444]"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete && onDelete(link.id)
                        }}
                        className="text-red-500 hover:bg-[#444444] hover:text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-white truncate">{link.title}</h3>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

