"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

// Import all role-specific components
import TopNav from "./top-nav"
import BuyerSidebar from "./sidebars/buyer-sidebar"
import AgentSidebar from "./sidebars/agent-sidebar"
import AdminSidebar from "./sidebars/admin-sidebar"
import BuyerBottomNav from "./bottom-navs/buyer-bottom-nav"
import AgentBottomNav from "./bottom-navs/agent-bottom-nav"
import AdminBottomNav from "./bottom-navs/admin-bottom-nav"

type UserRole = "buyer" | "agent" | "admin" | null

// Dynamic layout component that handles different roles
function DynamicLayout({
  children,
  userRole,
}: {
  children: React.ReactNode
  userRole: UserRole
}) {
  const { theme } = useTheme()

  // Define components based on user role
  let SidebarComponent
  let BottomNavComponent

  switch (userRole) {
    case "admin":
      SidebarComponent = AdminSidebar
      BottomNavComponent = AdminBottomNav
      break
    case "agent":
      SidebarComponent = AgentSidebar
      BottomNavComponent = AgentBottomNav
      break
    default: // buyer or null
      SidebarComponent = BuyerSidebar
      BottomNavComponent = BuyerBottomNav
      break
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <SidebarComponent />
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12] pb-20 lg:pb-6">{children}</main>
        <BottomNavComponent />
      </div>
    </div>
  )
}

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)

  useEffect(() => {
    setMounted(true)

    // Get user role from localStorage
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") as UserRole
      setUserRole(role)
    }
  }, [])

  // Listen for changes to userRole in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("userRole") as UserRole
      setUserRole(role)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (!mounted) {
    return null
  }

  return <DynamicLayout userRole={userRole}>{children}</DynamicLayout>
}
