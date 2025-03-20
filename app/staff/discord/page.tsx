"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { ExternalLink, Search } from "lucide-react"

// Mock Discord channels
const discordChannels = [
  { id: "1", name: "mod-logs", description: "Moderation actions log" },
  { id: "2", name: "join-leave", description: "Member join and leave events" },
  { id: "3", name: "message-delete", description: "Deleted messages log" },
  { id: "4", name: "message-edit", description: "Edited messages log" },
  { id: "5", name: "voice-events", description: "Voice channel activity" },
  { id: "6", name: "role-changes", description: "Role assignment and removal" },
]

export default function DiscordLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  const filteredChannels = discordChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Header title="Discord Logs" portalType="staff" />
      <div className="flex-1 p-4 animate-in fade-in-50 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Discord Moderation Logs</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => (
              <Card key={channel.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">#{channel.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a
                      href={`https://discord.com/channels/123456789/${channel.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Channel
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredChannels.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">No channels found matching "{searchTerm}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

