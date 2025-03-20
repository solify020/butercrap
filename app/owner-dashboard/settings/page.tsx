"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import AdminSettingsDialog from "@/components/admin-settings-dialog"

export default function SettingsPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen animate-fadeIn">
      <header className="p-6 bg-[#333333] shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="bg-[#333333] p-8 rounded-lg border border-[#666666]/30">
          <h2 className="text-xl font-medium mb-6">Admin Settings</h2>

          <Button onClick={() => setIsSettingsOpen(true)} className="bg-accent hover:bg-accent/90 text-white">
            Open Admin Settings
          </Button>

          <AdminSettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
      </main>
    </div>
  )
}

