"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Building, Wallet, Users, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AgentBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/properties", icon: Building, label: "Properties" },
    { href: "/dashboard/my-wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/my-referrals", icon: Users, label: "Referrals" },
    { href: "/dashboard/chat-with-admin", icon: MessageSquare, label: "Chat" },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-[#0F0F12] border-t border-gray-200 dark:border-[#1F1F23]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              "text-xs font-medium",
              pathname === item.href ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400",
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
