"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: string
  senderRole: "owner" | "staff"
  createdAt: any
  senderName?: string
  senderPhoto?: string
}

interface User {
  id: string
  displayName: string
  photoURL: string
  role: "owner" | "staff"
}

export default function TeamChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [users, setUsers] = useState<Record<string, User>>({})
  const [sending, setSending] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch users for display names and photos
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"))
        const querySnapshot = await getDocs(q)
        const usersData: Record<string, User> = {}

        querySnapshot.forEach((doc) => {
          usersData[doc.id] = {
            id: doc.id,
            displayName: doc.data().displayName,
            photoURL: doc.data().photoURL,
            role: doc.data().role,
          }
        })

        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  // Subscribe to messages
  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedMessages.push({
          id: doc.id,
          content: data.content,
          sender: data.sender,
          senderRole: data.senderRole,
          createdAt: data.createdAt,
          senderName: users[data.sender]?.displayName,
          senderPhoto: users[data.sender]?.photoURL,
        })
      })

      // Reverse to show oldest first
      setMessages(fetchedMessages.reverse())
    })

    return () => unsubscribe()
  }, [user, users])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !messageText.trim()) return

    setSending(true)

    try {
      await addDoc(collection(db, "messages"), {
        content: messageText,
        sender: user.uid,
        senderRole: "owner",
        createdAt: serverTimestamp(),
        readBy: [user.uid],
      })

      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate()
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      <Header title="Team Chat" portalType="owner" />
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="flex-1 p-4 overflow-hidden">
          <Card className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.sender === user?.uid ? "justify-end" : ""}`}
                  >
                    {message.sender !== user?.uid && (
                      <Avatar>
                        <AvatarImage src={message.senderPhoto} alt={message.senderName || "User"} />
                        <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] ${
                        message.sender === user?.uid
                          ? "bg-primary text-primary-foreground"
                          : message.senderRole === "staff"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted"
                      } rounded-lg p-3`}
                    >
                      {message.sender !== user?.uid && (
                        <div className="font-medium text-sm mb-1">{message.senderName || "Unknown User"}</div>
                      )}
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 text-right mt-1">{formatTime(message.createdAt)}</div>
                    </div>
                    {message.sender === user?.uid && (
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "You"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <CardContent className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !messageText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

