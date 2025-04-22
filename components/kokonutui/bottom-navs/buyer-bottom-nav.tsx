"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Building, Wallet, ShoppingBag, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function BuyerBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/properties", icon: Building, label: "Properties" },
    { href: "/dashboard/my-wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/marketplace", icon: ShoppingBag, label: "Market" },
    { href: "/dashboard/chat-with-admin", icon: MessageSquare, label: "Chat" },
  ]

  return (
    <motion.div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-[#0F0F12] border-t border-gray-200 dark:border-[#1F1F23]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
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
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
              {pathname === item.href && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="h-1 w-5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
