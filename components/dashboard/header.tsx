"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { signOut, user } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split("/")[1]
    if (!path || path === "dashboard") return "Dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header
      className={`bg-background border-b px-4 py-3 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#646464] animate-fade-in">{getPageTitle()}</h1>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-[#646464] hover:text-[#999999] hover:bg-[#64646410] transition-all duration-300"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#646464] hover:text-[#999999] hover:bg-[#64646410] transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full bg-[#646464] text-white hover:bg-[#999999] transition-all duration-300"
              >
                <span className="font-semibold">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#646464]">
                  <span className="text-sm font-medium text-white">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium text-[#646464]">{user?.email || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

