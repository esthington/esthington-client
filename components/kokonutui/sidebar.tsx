"use client"

// This file is kept for backward compatibility
// It now just imports and re-exports the role-specific sidebar components

import type React from "react"

import {
  Home,
  Building,
  Wallet,
  Users,
  ShoppingBag,
  CreditCard,
  DollarSign,
  LinkIcon,
  UserPlus,
  BarChart2,
  FileText,
  PlusCircle,
  BanknoteIcon as Bank,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  ShoppingCart,
  Briefcase,
} from "lucide-react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BuyerSidebar from "./sidebars/buyer-sidebar"
import AgentSidebar from "./sidebars/agent-sidebar"
import AdminSidebar from "./sidebars/admin-sidebar"

export default function Sidebar() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

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

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  function handleLogout() {
    // Clear user data
    localStorage.removeItem("userRole")
    // Redirect to login
    router.push("/login")
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  // Render different sidebar items based on user role
  const renderSidebarItems = () => {
    if (userRole === "admin") {
      return (
        <>
          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dashboard
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard" icon={Home}>
                Overview
              </NavItem>
              <NavItem href="/dashboard/properties" icon={Building}>
                Properties
              </NavItem>
              <NavItem href="/dashboard/users" icon={Users}>
                Users
              </NavItem>
              <NavItem href="/dashboard/transactions" icon={DollarSign}>
                Transactions
              </NavItem>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Management
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/add-property" icon={PlusCircle}>
                Add Property
              </NavItem>
              <NavItem href="/dashboard/add-admin" icon={UserPlus}>
                Add Admin
              </NavItem>
              <NavItem href="/dashboard/reports" icon={BarChart2}>
                Reports
              </NavItem>
              <NavItem href="/dashboard/approvals" icon={FileText}>
                Approvals
              </NavItem>
            </div>
          </div>
        </>
      )
    } else if (userRole === "agent") {
      return (
        <>
          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dashboard
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard" icon={Home}>
                Overview
              </NavItem>
              <NavItem href="/dashboard/properties" icon={Building}>
                Properties
              </NavItem>
              <NavItem href="/dashboard/my-referral-link" icon={LinkIcon}>
                My Referral Link
              </NavItem>
              <NavItem href="/dashboard/my-referrals" icon={UserPlus}>
                My Referrals
              </NavItem>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Wallet
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/my-wallet" icon={Wallet}>
                My Wallet
              </NavItem>
              <NavItem href="/dashboard/transfer-money" icon={ArrowUpRight}>
                Transfer Money
              </NavItem>
              <NavItem href="/dashboard/my-transactions" icon={History}>
                My Transactions
              </NavItem>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Marketplace
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/marketplace" icon={ShoppingBag}>
                Marketplace
              </NavItem>
              <NavItem href="/dashboard/my-investments" icon={Briefcase}>
                My Investments
              </NavItem>
            </div>
          </div>
        </>
      )
    } else {
      // Buyer role
      return (
        <>
          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dashboard
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard" icon={Home}>
                Overview
              </NavItem>
              <NavItem href="/dashboard/properties" icon={Building}>
                Properties
              </NavItem>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Wallet
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/fund-wallet" icon={CreditCard}>
                Fund Wallet
              </NavItem>
              <NavItem href="/dashboard/my-wallet" icon={Wallet}>
                My Wallet
              </NavItem>
              <NavItem href="/dashboard/my-bank-account" icon={Bank}>
                My Bank Account
              </NavItem>
              <NavItem href="/dashboard/withdraw-money" icon={ArrowDownLeft}>
                Withdraw Money
              </NavItem>
              <NavItem href="/dashboard/transfer-money" icon={ArrowUpRight}>
                Transfer Money
              </NavItem>
              <NavItem href="/dashboard/my-transactions" icon={History}>
                My Transactions
              </NavItem>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Investments
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/marketplace" icon={ShoppingBag}>
                Marketplace
              </NavItem>
              <NavItem href="/dashboard/invest-now" icon={ShoppingCart}>
                Invest Now
              </NavItem>
              <NavItem href="/dashboard/my-investments" icon={Briefcase}>
                My Investments
              </NavItem>
            </div>
          </div>
        </>
      )
    }
  }

  // Render the appropriate sidebar based on user role
  switch (userRole) {
    case "admin":
      return <AdminSidebar />
    case "agent":
      return <AgentSidebar />
    default:
      return <BuyerSidebar />
  }
}
