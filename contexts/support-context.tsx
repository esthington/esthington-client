"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for support/chat
export type MessageType = "text" | "image" | "document" | "system"

export type Message = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: MessageType
  attachmentUrl?: string
  attachmentType?: string
  timestamp: string
  isRead: boolean
  isAdmin: boolean
}

export type Conversation = {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  subject: string
  status: "open" | "closed" | "pending"
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  createdAt: string
  closedAt?: string
  priority: "low" | "medium" | "high"
  assignedTo?: string
  category?: string
}

// Context type
type SupportContextType = {
  // State
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isSubmitting: boolean

  // Conversation actions
  getConversations: () => Promise<Conversation[]>
  getConversation: (id: string) => Promise<Conversation | null>
  createConversation: (subject: string, initialMessage: string) => Promise<Conversation | null>
  closeConversation: (id: string) => Promise<boolean>
  reopenConversation: (id: string) => Promise<boolean>
  setActiveConversation: (conversation: Conversation | null) => void

  // Message actions
  getMessages: (conversationId: string) => Promise<Message[]>
  sendMessage: (
    conversationId: string,
    content: string,
    type?: MessageType,
    attachment?: File,
  ) => Promise<Message | null>
  markMessagesAsRead: (conversationId: string) => Promise<boolean>

  // Admin actions
  assignConversation: (conversationId: string, adminId: string) => Promise<boolean>
  setPriority: (conversationId: string, priority: Conversation["priority"]) => Promise<boolean>
  setCategory: (conversationId: string, category: string) => Promise<boolean>
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "conv1",
    userId: "user123",
    userName: "John Doe",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Question about property investment",
    status: "open",
    lastMessage: "Thank you for your response. I have one more question...",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    unreadCount: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    priority: "medium",
    category: "Investment",
  },
  {
    id: "conv2",
    userId: "user456",
    userName: "Jane Smith",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Issue with payment",
    status: "pending",
    lastMessage: "I'm still waiting for the payment to be processed...",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unreadCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    priority: "high",
    assignedTo: "admin1",
    category: "Payment",
  },
  {
    id: "conv3",
    userId: "user789",
    userName: "Robert Johnson",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Document verification",
    status: "closed",
    lastMessage: "Thank you for your help. My issue has been resolved.",
    lastMessageTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    unreadCount: 0,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    closedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    priority: "low",
    assignedTo: "admin2",
    category: "Documentation",
  },
]

const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: "msg1",
      conversationId: "conv1",
      senderId: "user123",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content: "Hello, I have a question about investing in properties on your platform.",
      type: "text",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
      isAdmin: false,
    },
    {
      id: "msg2",
      conversationId: "conv1",
      senderId: "admin1",
      senderName: "Support Agent",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Hello John, thank you for reaching out. I'd be happy to help with your investment questions. What would you like to know?",
      type: "text",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 2 days ago + 30 minutes
      isRead: true,
      isAdmin: true,
    },
    {
      id: "msg3",
      conversationId: "conv1",
      senderId: "user123",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content: "I'm interested in the minimum investment amount and the expected returns for residential properties.",
      type: "text",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isRead: true,
      isAdmin: false,
    },
    {
      id: "msg4",
      conversationId: "conv1",
      senderId: "admin1",
      senderName: "Support Agent",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "The minimum investment amount for residential properties starts at ₦100,000. The expected returns vary between 10-15% annually depending on the property location and type. Here's a document with more details.",
      type: "text",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 1 day ago + 45 minutes
      isRead: true,
      isAdmin: true,
    },
    {
      id: "msg5",
      conversationId: "conv1",
      senderId: "admin1",
      senderName: "Support Agent",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content: "Investment Guide.pdf",
      type: "document",
      attachmentUrl: "#",
      attachmentType: "application/pdf",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 46 * 60 * 1000).toISOString(), // 1 day ago + 46 minutes
      isRead: true,
      isAdmin: true,
    },
    {
      id: "msg6",
      conversationId: "conv1",
      senderId: "user123",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Thank you for your response. I have one more question about the investment duration and withdrawal options.",
      type: "text",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      isRead: false,
      isAdmin: false,
    },
  ],
  conv2: [
    {
      id: "msg7",
      conversationId: "conv2",
      senderId: "user456",
      senderName: "Jane Smith",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "I made a payment for the Lekki property investment but it's been 24 hours and it's still not showing in my account.",
      type: "text",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      isRead: true,
      isAdmin: false,
    },
    {
      id: "msg8",
      conversationId: "conv2",
      senderId: "admin2",
      senderName: "Payment Support",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Hello Jane, I'm sorry to hear about the issue with your payment. Could you please provide the transaction reference number so I can look into this for you?",
      type: "text",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 5 days ago + 2 hours
      isRead: true,
      isAdmin: true,
    },
    {
      id: "msg9",
      conversationId: "conv2",
      senderId: "user456",
      senderName: "Jane Smith",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content: "The reference number is EST-TRX-12345. I've also attached a screenshot of the payment confirmation.",
      type: "text",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      isRead: true,
      isAdmin: false,
    },
    {
      id: "msg10",
      conversationId: "conv2",
      senderId: "user456",
      senderName: "Jane Smith",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content: "Payment Confirmation",
      type: "image",
      attachmentUrl: "/placeholder.svg?height=300&width=400",
      attachmentType: "image/png",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1 * 60 * 1000).toISOString(), // 4 days ago + 1 minute
      isRead: true,
      isAdmin: false,
    },
    {
      id: "msg11",
      conversationId: "conv2",
      senderId: "admin2",
      senderName: "Payment Support",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Thank you for providing the reference number and screenshot. I can see the payment in our system, but it's currently pending verification. I'll escalate this to our finance team for immediate processing.",
      type: "text",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      isRead: true,
      isAdmin: true,
    },
    {
      id: "msg12",
      conversationId: "conv2",
      senderId: "user456",
      senderName: "Jane Smith",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "It's been another day and I'm still waiting for the payment to be processed. Could you please provide an update?",
      type: "text",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: true,
      isAdmin: false,
    },
  ],
}

// Create context
const SupportContext = createContext<SupportContextType | undefined>(undefined)

// Provider component
export function SupportProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize conversations
  useEffect(() => {
    const initConversations = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setConversations(mockConversations)
      } catch (error) {
        console.error("Failed to initialize conversations:", error)
        errorToast("Failed to load support conversations")
      } finally {
        setIsLoading(false)
      }
    }

    initConversations()
  }, [])

  // Get conversations
  const getConversations = async (): Promise<Conversation[]> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return conversations
    } catch (error) {
      console.error("Failed to get conversations:", error)
      errorToast("Failed to load support conversations")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Get conversation by ID
  const getConversation = async (id: string): Promise<Conversation | null> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const conversation = conversations.find((conv) => conv.id === id) || null

      if (conversation) {
        setActiveConversationState(conversation)
        // Load messages for this conversation
        await getMessages(id)
      }

      return conversation
    } catch (error) {
      console.error("Failed to get conversation:", error)
      errorToast("Failed to load conversation")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Create conversation
  const createConversation = async (subject: string, initialMessage: string): Promise<Conversation | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new conversation
      const newConversation: Conversation = {
        id: `conv${conversations.length + 1}`,
        userId: "currentUser", // In a real app, this would be the current user's ID
        userName: "Current User", // In a real app, this would be the current user's name
        userAvatar: "/placeholder.svg?height=40&width=40",
        subject,
        status: "open",
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        priority: "medium",
      }

      // Create initial message
      const newMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId: newConversation.id,
        senderId: "currentUser",
        senderName: "Current User",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content: initialMessage,
        type: "text",
        timestamp: new Date().toISOString(),
        isRead: true,
        isAdmin: false,
      }

      // Update state
      setConversations((prev) => [newConversation, ...prev])

      // Set as active conversation
      setActiveConversationState(newConversation)

      // Set messages
      setMessages([newMessage])

      successToast("Support conversation created successfully")
      return newConversation
    } catch (error) {
      console.error("Failed to create conversation:", error)
      errorToast("Failed to create support conversation")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close conversation
  const closeConversation = async (id: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update conversation
      const now = new Date().toISOString()
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, status: "closed", closedAt: now } : conv)),
      )

      // Update active conversation if it's the one being closed
      if (activeConversation && activeConversation.id === id) {
        setActiveConversationState((prev) => (prev ? { ...prev, status: "closed", closedAt: now } : null))
      }

      // Add system message
      const systemMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId: id,
        senderId: "system",
        senderName: "System",
        content: "This conversation has been closed.",
        type: "system",
        timestamp: now,
        isRead: true,
        isAdmin: true,
      }

      setMessages((prev) => [...prev, systemMessage])

      successToast("Conversation closed successfully")
      return true
    } catch (error) {
      console.error("Failed to close conversation:", error)
      errorToast("Failed to close conversation")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reopen conversation
  const reopenConversation = async (id: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update conversation
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, status: "open", closedAt: undefined } : conv)),
      )

      // Update active conversation if it's the one being reopened
      if (activeConversation && activeConversation.id === id) {
        setActiveConversationState((prev) => (prev ? { ...prev, status: "open", closedAt: undefined } : null))
      }

      // Add system message
      const systemMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId: id,
        senderId: "system",
        senderName: "System",
        content: "This conversation has been reopened.",
        type: "system",
        timestamp: new Date().toISOString(),
        isRead: true,
        isAdmin: true,
      }

      setMessages((prev) => [...prev, systemMessage])

      successToast("Conversation reopened successfully")
      return true
    } catch (error) {
      console.error("Failed to reopen conversation:", error)
      errorToast("Failed to reopen conversation")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set active conversation
  const setActiveConversation = (conversation: Conversation | null) => {
    setActiveConversationState(conversation)

    if (conversation) {
      // Load messages for this conversation
      getMessages(conversation.id)

      // Mark messages as read
      if (conversation.unreadCount > 0) {
        markMessagesAsRead(conversation.id)
      }
    } else {
      // Clear messages
      setMessages([])
    }
  }

  // Get messages for a conversation
  const getMessages = async (conversationId: string): Promise<Message[]> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get messages for this conversation
      const conversationMessages = mockMessages[conversationId] || []

      // Update state
      setMessages(conversationMessages)

      return conversationMessages
    } catch (error) {
      console.error("Failed to get messages:", error)
      errorToast("Failed to load messages")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Send message
  const sendMessage = async (
    conversationId: string,
    content: string,
    type: MessageType = "text",
    attachment?: File,
  ): Promise<Message | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to send the message and upload any attachment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create new message
      const newMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId,
        senderId: "currentUser", // In a real app, this would be the current user's ID
        senderName: "Current User", // In a real app, this would be the current user's name
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content,
        type,
        timestamp: new Date().toISOString(),
        isRead: false,
        isAdmin: false,
      }

      // If there's an attachment
      if (attachment) {
        newMessage.attachmentUrl = URL.createObjectURL(attachment) // In a real app, this would be the URL from the server
        newMessage.attachmentType = attachment.type
      }

      // Update messages
      setMessages((prev) => [...prev, newMessage])

      // Update conversation with last message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: content,
              lastMessageTime: newMessage.timestamp,
              status: conv.status === "closed" ? "open" : conv.status, // Reopen if closed
            }
          }
          return conv
        }),
      )

      // Update active conversation
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversationState((prev) => {
          if (prev) {
            return {
              ...prev,
              lastMessage: content,
              lastMessageTime: newMessage.timestamp,
              status: prev.status === "closed" ? "open" : prev.status, // Reopen if closed
            }
          }
          return prev
        })
      }

      return newMessage
    } catch (error) {
      console.error("Failed to send message:", error)
      errorToast("Failed to send message")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update messages
      setMessages((prev) =>
        prev.map((msg) => (msg.conversationId === conversationId && !msg.isRead ? { ...msg, isRead: true } : msg)),
      )

      // Update conversation unread count
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))

      // Update active conversation
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversationState((prev) => (prev ? { ...prev, unreadCount: 0 } : null))
      }

      return true
    } catch (error) {
      console.error("Failed to mark messages as read:", error)
      return false
    }
  }

  // Assign conversation to admin (admin only)
  const assignConversation = async (conversationId: string, adminId: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update conversation
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, assignedTo: adminId } : conv)),
      )

      // Update active conversation if it's the one being assigned
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversationState((prev) => (prev ? { ...prev, assignedTo: adminId } : null))
      }

      // Add system message
      const systemMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId,
        senderId: "system",
        senderName: "System",
        content: `This conversation has been assigned to admin ${adminId}.`,
        type: "system",
        timestamp: new Date().toISOString(),
        isRead: true,
        isAdmin: true,
      }

      setMessages((prev) => [...prev, systemMessage])

      successToast("Conversation assigned successfully")
      return true
    } catch (error) {
      console.error("Failed to assign conversation:", error)
      errorToast("Failed to assign conversation")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set priority (admin only)
  const setPriority = async (conversationId: string, priority: Conversation["priority"]): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update conversation
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, priority } : conv)))

      // Update active conversation if it's the one being updated
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversationState((prev) => (prev ? { ...prev, priority } : null))
      }

      successToast(`Priority set to ${priority}`)
      return true
    } catch (error) {
      console.error("Failed to set priority:", error)
      errorToast("Failed to set priority")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set category (admin only)
  const setCategory = async (conversationId: string, category: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update conversation
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, category } : conv)))

      // Update active conversation if it's the one being updated
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversationState((prev) => (prev ? { ...prev, category } : null))
      }

      successToast(`Category set to ${category}`)
      return true
    } catch (error) {
      console.error("Failed to set category:", error)
      errorToast("Failed to set category")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSubmitting,
    getConversations,
    getConversation,
    createConversation,
    closeConversation,
    reopenConversation,
    setActiveConversation,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    assignConversation,
    setPriority,
    setCategory,
  }

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>
}

// Custom hook to use the context
export function useSupport() {
  const context = useContext(SupportContext)
  if (context === undefined) {
    throw new Error("useSupport must be used within a SupportProvider")
  }
  return context
}
