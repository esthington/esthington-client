"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type UIContextType = {
  isMobileView: boolean
  activeSection: string
  setActiveSection: (section: string) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  // Check if we're on mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024)
    }

    // Initial check
    checkMobileView()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobileView)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  return (
    <UIContext.Provider
      value={{
        isMobileView,
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}
