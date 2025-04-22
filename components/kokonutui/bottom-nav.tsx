"use client"

// This file is kept for backward compatibility
// It now just imports and re-exports the role-specific bottom nav components

import { useEffect, useState } from "react"
import BuyerBottomNav from "./bottom-navs/buyer-bottom-nav"
import AgentBottomNav from "./bottom-navs/agent-bottom-nav"
import AdminBottomNav from "./bottom-navs/admin-bottom-nav"

export default function BottomNav() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole")
      setUserRole(role)
    }
  }, [])

  // Listen for changes to userRole in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("userRole")
      setUserRole(role)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Render the appropriate bottom nav based on user role
  switch (userRole) {
    case "admin":
      return <AdminBottomNav />
    case "agent":
      return <AgentBottomNav />
    default:
      return <BuyerBottomNav />
  }
}
