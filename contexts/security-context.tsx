"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for security settings
export type SecuritySettings = {
  twoFactorAuth: boolean
  loginNotifications: boolean
  suspiciousActivityAlerts: boolean
  passwordExpiry: string
  minimumPasswordLength: string
  requireSpecialChars: boolean
  ipRestriction: boolean
  allowedIPs: string
  sessionTimeout: string
}

export type LoginSession = {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

// Context type
type SecurityContextType = {
  // Security settings
  settings: SecuritySettings
  sessions: LoginSession[]
  isLoading: boolean
  isSubmitting: boolean

  // CRUD operations
  updateSettings: (settings: Partial<SecuritySettings>) => Promise<void>
  resetSettings: () => Promise<void>

  // Session management
  getSessions: () => Promise<LoginSession[]>
  terminateSession: (sessionId: string) => Promise<void>
  terminateAllSessions: () => Promise<void>

  // Password management
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>

  // Two-factor authentication
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>
  disableTwoFactor: (code: string) => Promise<void>
  verifyTwoFactor: (code: string) => Promise<boolean>
}

// Default settings
const defaultSettings: SecuritySettings = {
  twoFactorAuth: false,
  loginNotifications: true,
  suspiciousActivityAlerts: true,
  passwordExpiry: "90",
  minimumPasswordLength: "8",
  requireSpecialChars: true,
  ipRestriction: false,
  allowedIPs: "",
  sessionTimeout: "30",
}

// Mock sessions
const mockSessions: LoginSession[] = [
  {
    id: "session1",
    device: "Windows 10",
    browser: "Chrome 91.0.4472.124",
    location: "Lagos, Nigeria",
    ip: "102.89.23.45",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "session2",
    device: "iPhone 12",
    browser: "Safari 14.1.1",
    location: "Lagos, Nigeria",
    ip: "102.89.23.46",
    lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isCurrent: false,
  },
]

// Create context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

// Provider component
export function SecurityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings)
  const [sessions, setSessions] = useState<LoginSession[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize settings and sessions
  useEffect(() => {
    const initSecurity = async () => {
      setIsLoading(true)
      try {
        // In a real app, these would be API calls
        setSettings(defaultSettings)
        setSessions(mockSessions)
      } catch (error) {
        console.error("Failed to initialize security settings:", error)
        errorToast("Failed to load security settings")
      } finally {
        setIsLoading(false)
      }
    }

    initSecurity()
  }, [])

  // Update settings
  const updateSettings = async (newSettings: Partial<SecuritySettings>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setSettings((prev) => ({ ...prev, ...newSettings }))
      successToast("Security settings updated successfully")
    } catch (error) {
      console.error("Failed to update security settings:", error)
      errorToast("Failed to update security settings")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset settings to default
  const resetSettings = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setSettings(defaultSettings)
      successToast("Security settings reset to default")
    } catch (error) {
      console.error("Failed to reset security settings:", error)
      errorToast("Failed to reset security settings")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get sessions
  const getSessions = async (): Promise<LoginSession[]> => {
    try {
      // In a real app, this would be an API call
      return mockSessions
    } catch (error) {
      console.error("Failed to get sessions:", error)
      errorToast("Failed to load login sessions")
      throw error
    }
  }

  // Terminate session
  const terminateSession = async (sessionId: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setSessions((prev) => prev.filter((session) => session.id !== sessionId))
      successToast("Session terminated successfully")
    } catch (error) {
      console.error("Failed to terminate session:", error)
      errorToast("Failed to terminate session")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Terminate all sessions
  const terminateAllSessions = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      // Keep only the current session
      setSessions((prev) => prev.filter((session) => session.isCurrent))
      successToast("All other sessions terminated successfully")
    } catch (error) {
      console.error("Failed to terminate all sessions:", error)
      errorToast("Failed to terminate all sessions")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate a successful password change
      await new Promise((resolve) => setTimeout(resolve, 1000))
      successToast("Password changed successfully")
    } catch (error) {
      console.error("Failed to change password:", error)
      errorToast("Failed to change password")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate a successful password reset
      await new Promise((resolve) => setTimeout(resolve, 1000))
      successToast("Password reset email sent successfully")
    } catch (error) {
      console.error("Failed to reset password:", error)
      errorToast("Failed to send password reset email")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enable two-factor authentication
  const enableTwoFactor = async (): Promise<{ secret: string; qrCode: string }> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to generate a 2FA secret
      // For now, we'll just simulate a successful 2FA setup
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update settings
      setSettings((prev) => ({ ...prev, twoFactorAuth: true }))

      successToast("Two-factor authentication enabled successfully")

      // Return mock data
      return {
        secret: "ABCDEFGHIJKLMNOP",
        qrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAAB30lEQVR42uyYwY3DMAxEqYJLUCmqJJWiUlyC918nH7KJN0EO+bPBHgaDGT6JEkWK83rppZf+Jz10tz5S3bpzpVbivOiRzj3S0gf10kM6ac4jXSU9Lk2lOPWRzpWmPdK0dNIj3aWpj3QvTXmkqdJJj/QoTXukR2nKIz1Lkx7pWZrySJM06ZEmSVMe6VWa8kiv0qRHmitNeqS50pRHWipNeqSl0pRHWitNeqS10pRH2ipNeqSt0pRH2itNeqS90pRHOipNeaSj0qRHOipNeaSz0qRHOitNeaRXpUmP9Ko05ZGmSpMeaao05ZHupUmPdC9NeaRbacoj3UpTHulSaeojXSpNfKRzpWmPdK407ZGOStMeaVJp2iNNKk17pLFSPdI4qR5pnFSPNE6qRxon1SONk+qRxkn1SOOkeqRxUj3SOKkeaZxUjzROqkcaJ9UjjZPqkcZJ9UjjpHqkcVI90jipHmmcVI80TqpHGifVI42T6pHGSfVI46R6pHFSPdI4qR5pnFSPNE6qRxon1SONk+qRxkn1SOOkeqRxUj3SOKkeaZxUjzROqkcaJ9UjjZPqkcZJ9UjjpHqkcVI90jipHmmcVI80TqpHGifVI42T6pHGSfVI46R6pHFSPdI4qR5pnFSPNE6qRxon1SONk+qRxkn1SOOkeqRx0pdeeum/0m/CMcAcs//oPQAAAABJRU5ErkJggg==",
      }
    } catch (error) {
      console.error("Failed to enable two-factor authentication:", error)
      errorToast("Failed to enable two-factor authentication")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Disable two-factor authentication
  const disableTwoFactor = async (code: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to verify the code and disable 2FA
      // For now, we'll just simulate a successful 2FA disable
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update settings
      setSettings((prev) => ({ ...prev, twoFactorAuth: false }))

      successToast("Two-factor authentication disabled successfully")
    } catch (error) {
      console.error("Failed to disable two-factor authentication:", error)
      errorToast("Failed to disable two-factor authentication")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verify two-factor authentication code
  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call to verify the code
      // For now, we'll just simulate a successful verification if the code is "123456"
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const isValid = code === "123456"

      if (isValid) {
        successToast("Two-factor authentication code verified successfully")
      } else {
        errorToast("Invalid two-factor authentication code")
      }

      return isValid
    } catch (error) {
      console.error("Failed to verify two-factor authentication code:", error)
      errorToast("Failed to verify two-factor authentication code")
      throw error
    }
  }

  const value = {
    settings,
    sessions,
    isLoading,
    isSubmitting,
    updateSettings,
    resetSettings,
    getSessions,
    terminateSession,
    terminateAllSessions,
    changePassword,
    resetPassword,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
  }

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>
}

// Custom hook to use the context
export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider")
  }
  return context
}
