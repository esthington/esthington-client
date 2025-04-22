"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedCard } from "@/components/ui/animated-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import FadeIn from "@/components/animations/fade-in"
import Image from "next/image"

interface Message {
  id: string
  content: string
  sender: "user" | "admin"
  timestamp: Date
  status: "sent" | "delivered" | "read"
  attachments?: {
    type: "image" | "file"
    url: string
    name: string
    size?: string
  }[]
}

export default function ChatWithAdminComponent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: "read",
    },
    {
      id: "2",
      content: "I have a question about investing in the Royal Gardens Estate property.",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: "read",
    },
    {
      id: "3",
      content: "Sure, I'd be happy to help with that. What would you like to know about Royal Gardens Estate?",
      sender: "admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      status: "read",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    }

    setMessages([...messages, userMessage])
    setNewMessage("")

    // Simulate admin typing
    setIsTyping(true)

    // Simulate admin response after a delay
    setTimeout(() => {
      setIsTyping(false)

      const adminMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thank you for your message. An admin will get back to you shortly.",
        sender: "admin",
        timestamp: new Date(),
        status: "delivered",
      }

      setMessages((prev) => [...prev, adminMessage])
    }, 3000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat with Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Get help from our support team</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chat with Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="flex-1 flex flex-col">
        <AnimatedCard className="p-4 flex-1 flex flex-col">
          <div className="border-b pb-3 mb-4">
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="Admin"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#0F0F12]"></div>
              </div>
              <div>
                <h2 className="font-medium text-gray-900 dark:text-white">Support Team</h2>
                <p className="text-xs text-green-600 dark:text-green-400">Online</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-lg rounded-tr-lg rounded-br-lg"
                  } p-3 shadow-sm`}
                >
                  {message.content}
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    {message.sender === "user" && (
                      <span className="text-xs">
                        {message.status === "sent" && "✓"}
                        {message.status === "delivered" && "✓✓"}
                        {message.status === "read" && "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-end gap-2">
              <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-blue-600 dark:text-blue-400"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </FadeIn>
    </div>
  )
}
