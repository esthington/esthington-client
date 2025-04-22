"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for notifications
export type NotificationType = "system" | "transaction" | "security" | "marketing" | "property" | "investment"

export type NotificationSettings = {
  email: {
    enabled: boolean
    types: NotificationType[]
  }
  push: {
    enabled: boolean
    types: NotificationType[]
  }
  sms: {
    enabled: boolean
    types: NotificationType[]
  }
  inApp: {
    enabled: boolean
    types: NotificationType[]
  }
}

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
  icon?: string
}

// Context type
type NotificationsContextType = {
  // Notification settings
  settings: NotificationSettings
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isSubmitting: boolean

  // CRUD operations
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>
  getNotifications: (page?: number, limit?: number) => Promise<Notification[]>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>

  // Notification preferences
  enableNotificationType: (channel: keyof NotificationSettings, type: NotificationType) => Promise<void>
  disableNotificationType: (channel: keyof NotificationSettings, type: NotificationType) => Promise<void>

  // Test notifications
  sendTestNotification: (channel: keyof NotificationSettings, type: NotificationType) => Promise<void>
}

// Default settings
const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    types: ["system", "transaction", "security", "property", "investment"],
  },
  push: {
    enabled: true,
    types: ["system", "transaction", "security"],
  },
  sms: {
    enabled: true,
    types: ["transaction", "security"],
  },
  inApp: {
    enabled: true,
    types: ["system", "transaction", "security", "marketing", "property", "investment"],
  },
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "transaction",
    title: "Payment Successful",
    message: "Your payment of ₦50,000 has been processed successfully.",
    isRead: false,
    createdAt: new Date().toISOString(),
    link: "/dashboard/my-transactions",
    icon: "credit-card",
  },
  {
    id: "notif2",
    type: "property",
    title: "New Property Listed",
    message: "A new property matching your criteria has been listed.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    link: "/dashboard/marketplace",
    icon: "home",
  },
  {
    id: "notif3",
    type: "security",
    title: "New Login Detected",
    message: "A new login was detected from Lagos, Nigeria.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    link: "/dashboard/security",
    icon: "shield",
  },
]

// Create context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

// Provider component
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Calculate unread count
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  // Initialize settings and notifications
  useEffect(() => {
    const initNotifications = async () => {
      setIsLoading(true)
      try {
        // In a real app, these would be API calls
        setSettings(defaultSettings)
        setNotifications(mockNotifications)
      } catch (error) {
        console.error("Failed to initialize notifications:", error)
        errorToast("Failed to load notifications")
      } finally {
        setIsLoading(false)
      }
    }

    initNotifications()
  }, [])

  // Update settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }))
      successToast("Notification settings updated successfully")
    } catch (error) {
      console.error("Failed to update notification settings:", error)
      errorToast("Failed to update notification settings")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get notifications
  const getNotifications = async (page = 1, limit = 10): Promise<Notification[]> => {
    try {
      // In a real app, this would be an API call with pagination
      return mockNotifications
    } catch (error) {
      console.error("Failed to get notifications:", error)
      errorToast("Failed to load notifications")
      throw error
    }
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      // In a real app, this would be an API call
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      errorToast("Failed to mark notification as read")
      throw error
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
      successToast("All notifications marked as read")
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      errorToast("Failed to mark all notifications as read")
      throw error
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      // In a real app, this would be an API call
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    } catch (error) {
      console.error("Failed to delete notification:", error)
      errorToast("Failed to delete notification")
      throw error
    }
  }

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      // In a real app, this would be an API call
      setNotifications([])
      successToast("All notifications deleted")
    } catch (error) {
      console.error("Failed to delete all notifications:", error)
      errorToast("Failed to delete all notifications")
      throw error
    }
  }

  // Enable notification type for a channel
  const enableNotificationType = async (channel: keyof NotificationSettings, type: NotificationType) => {
    try {
      // In a real app, this would be an API call
      setSettings((prev) => {
        const channelSettings = prev[channel]
        if (!channelSettings.types.includes(type)) {
          return {
            ...prev,
            [channel]: {
              ...channelSettings,
              types: [...channelSettings.types, type],
            },
          }
        }
        return prev
      })
    } catch (error) {
      console.error(`Failed to enable ${type} notifications for ${channel}:`, error)
      errorToast(`Failed to enable ${type} notifications for ${channel}`)
      throw error
    }
  }

  // Disable notification type for a channel
  const disableNotificationType = async (channel: keyof NotificationSettings, type: NotificationType) => {
    try {
      // In a real app, this would be an API call
      setSettings((prev) => {
        const channelSettings = prev[channel]
        return {
          ...prev,
          [channel]: {
            ...channelSettings,
            types: channelSettings.types.filter((t) => t !== type),
          },
        }
      })
    } catch (error) {
      console.error(`Failed to disable ${type} notifications for ${channel}:`, error)
      errorToast(`Failed to disable ${type} notifications for ${channel}`)
      throw error
    }
  }

  // Send test notification
  const sendTestNotification = async (channel: keyof NotificationSettings, type: NotificationType) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add a test notification to the list if it's an in-app notification
      if (channel === "inApp") {
        const testNotification: Notification = {
          id: `test-${Date.now()}`,
          type,
          title: `Test ${type} Notification`,
          message: `This is a test ${type} notification sent to your ${channel}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          icon: "bell",
        }

        setNotifications((prev) => [testNotification, ...prev])
      }

      successToast(`Test ${type} notification sent to ${channel}`)
    } catch (error) {
      console.error(`Failed to send test ${type} notification to ${channel}:`, error)
      errorToast(`Failed to send test ${type} notification to ${channel}`)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    settings,
    notifications,
    unreadCount,
    isLoading,
    isSubmitting,
    updateSettings,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    enableNotificationType,
    disableNotificationType,
    sendTestNotification,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

// Custom hook to use the context
export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
