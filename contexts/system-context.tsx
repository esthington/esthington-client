"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for system settings
export type SystemSettings = {
  appName: string
  logo: string
  theme: "light" | "dark" | "system"
  maintenanceMode: boolean
  version: string
  contactEmail: string
  supportPhone: string
  termsUrl: string
  privacyUrl: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  footerText: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxUploadSize: number
  defaultCurrency: string
  dateFormat: string
  timeFormat: string
}

// Context type
type SystemContextType = {
  // System settings
  settings: SystemSettings
  isLoading: boolean
  isSubmitting: boolean

  // CRUD operations
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>
  resetSettings: () => Promise<void>

  // Maintenance mode
  enableMaintenanceMode: () => Promise<void>
  disableMaintenanceMode: () => Promise<void>

  // Theme
  setTheme: (theme: "light" | "dark" | "system") => void
  currentTheme: "light" | "dark"
}

// Default settings
const defaultSettings: SystemSettings = {
  appName: "Esthington",
  logo: "/logo.svg",
  theme: "dark",
  maintenanceMode: false,
  version: "1.0.0",
  contactEmail: "support@esthington.com",
  supportPhone: "+234 123 456 7890",
  termsUrl: "/terms",
  privacyUrl: "/privacy",
  socialLinks: {
    facebook: "https://facebook.com/esthington",
    twitter: "https://twitter.com/esthington",
    instagram: "https://instagram.com/esthington",
    linkedin: "https://linkedin.com/company/esthington",
  },
  footerText: "© 2023 Esthington. All rights reserved.",
  allowRegistration: true,
  requireEmailVerification: true,
  maxUploadSize: 10, // MB
  defaultCurrency: "NGN",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "HH:mm",
}

// Create context
const SystemContext = createContext<SystemContextType | undefined>(undefined)

// Provider component
export function SystemProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light")

  // Initialize settings
  useEffect(() => {
    const initSettings = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to get settings
        // For now, we'll just use the default settings
        setSettings(defaultSettings)

        // Set initial theme
        const theme = defaultSettings.theme
        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          setCurrentTheme(systemTheme)
          document.documentElement.classList.toggle("dark", systemTheme === "dark")
        } else {
          setCurrentTheme(theme)
          document.documentElement.classList.toggle("dark", theme === "dark")
        }
      } catch (error) {
        console.error("Failed to initialize system settings:", error)
        errorToast("Failed to load system settings")
      } finally {
        setIsLoading(false)
      }
    }

    initSettings()
  }, [])

  // Update settings
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to update settings
      setSettings((prev) => ({ ...prev, ...newSettings }))

      // If theme is updated, apply it
      if (newSettings.theme) {
        setTheme(newSettings.theme)
      }

      successToast("System settings updated successfully")
    } catch (error) {
      console.error("Failed to update system settings:", error)
      errorToast("Failed to update system settings")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset settings to default
  const resetSettings = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to reset settings
      setSettings(defaultSettings)
      setTheme(defaultSettings.theme)
      successToast("System settings reset to default")
    } catch (error) {
      console.error("Failed to reset system settings:", error)
      errorToast("Failed to reset system settings")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enable maintenance mode
  const enableMaintenanceMode = async () => {
    return updateSettings({ maintenanceMode: true })
  }

  // Disable maintenance mode
  const disableMaintenanceMode = async () => {
    return updateSettings({ maintenanceMode: false })
  }

  // Set theme
  const setTheme = (theme: "light" | "dark" | "system") => {
    let newTheme: "light" | "dark" = theme as "light" | "dark"

    if (theme === "system") {
      newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    setCurrentTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")

    // Update settings
    setSettings((prev) => ({ ...prev, theme }))
  }

  const value = {
    settings,
    isLoading,
    isSubmitting,
    updateSettings,
    resetSettings,
    enableMaintenanceMode,
    disableMaintenanceMode,
    setTheme,
    currentTheme,
  }

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}

// Custom hook to use the context
export function useSystem() {
  const context = useContext(SystemContext)
  if (context === undefined) {
    throw new Error("useSystem must be used within a SystemProvider")
  }
  return context
}
