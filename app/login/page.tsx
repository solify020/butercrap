"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, Unlock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Import the login background component
import { LoginBackground } from "@/components/login-background"

// Add the LoginBackground component at the beginning of the LoginPage component's return statement
// For example, your component might look like:
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [animationStage, setAnimationStage] = useState(1) // Start directly in scanning state
  const { signIn, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User already logged in, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      // Show unlock animation on success
      setAnimationStage(2) // Complete verification

      // Navigate after a short delay to show the animation
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
      // Reset to scanning animation on failed login
      setAnimationStage(1)
    } finally {
      setIsLoading(false)
    }
  }

  // If still loading auth state, show a loading indicator
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Only render the login form if not already logged in
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <>
      <LoginBackground />
      <div className="relative flex min-h-screen items-center justify-center bg-[#d9d9d9] p-4 overflow-hidden">
        {/* Background pattern container with subtle animation */}
        <div className="absolute inset-0 overflow-hidden animate-subtle-float">
          {/* Grid of text rotated at -40 degrees */}
          <div
            className="absolute inset-0 flex flex-wrap content-start"
            style={{
              transform: "rotate(-40deg)",
              transformOrigin: "center center",
              width: "300%",
              height: "300%",
              left: "-100%",
              top: "-100%",
              gap: "1.5rem",
              padding: "1.5rem",
            }}
          >
            {Array.from({ length: 700 }).map((_, i) => (
              <div
                key={i}
                className="text-[#646464] text-3xl font-bold opacity-60 animate-pulse-subtle"
                style={{
                  animationDelay: `${(i % 10) * 0.1}s`,
                  animationDuration: `${4 + (i % 4)}s`,
                }}
              >
                BUTERASCP
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Gaussian blur overlay with explicit blur styling */}
        <div
          className="absolute inset-0 bg-[#d9d9d9]/30"
          style={{
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }}
        ></div>

        {/* Login card with increased z-index to ensure it's above other elements */}
        <div className="w-full max-w-md transition-all duration-500 ease-out relative z-50">
          <Card className="bg-white border-none shadow-xl transition-all duration-500 hover:shadow-2xl">
            <CardHeader className="pb-2">
              <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                <div className="rounded-full bg-[#999999] p-5 shadow-md">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Scanning Lock */}
                    <Lock
                      className={`absolute h-10 w-10 text-white transition-all duration-500 ${
                        animationStage === 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
                      }`}
                    />

                    {/* Verified Unlock */}
                    <Unlock
                      className={`absolute h-10 w-10 text-white transition-all duration-500 ${
                        animationStage === 2 ? "opacity-100 scale-100 animate-verified-pulse" : "opacity-0 scale-75"
                      }`}
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#646464]">Buterascp Portal</h1>
              </div>
              <CardDescription className="text-[#646464] text-center">
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#646464]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-[#999999] focus:border-[#646464] focus:ring-[#646464] transition-all duration-300 hover:border-[#646464]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#646464]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-[#999999] focus:border-[#646464] focus:ring-[#646464] transition-all duration-300 hover:border-[#646464]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#999999] hover:bg-[#646464] text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-[#e0e0e0] pt-4">
              <p className="text-sm text-[#646464]">Secure access for authorized personnel only</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}

