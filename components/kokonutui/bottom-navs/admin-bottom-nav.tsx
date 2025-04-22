"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Building, Users, BarChart2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type NavItem = {
  href: string
  icon: any
  label: string
  onClick?: () => void
}

export default function AdminBottomNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/properties", icon: Building, label: "Properties" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/reports", icon: BarChart2, label: "Reports" },
    {
      href: "#",
      icon: MessageSquare,
      label: "Support",
      onClick: () =>
        window.open("https://wa.me/1234567890?text=Hello%20Esthington%20Support,%20I%20need%20assistance.", "_blank"),
    },
  ]

  return (
    <motion.div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-[#0F0F12] border-t border-gray-200 dark:border-[#1F1F23]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) =>
          item.onClick ? (
            <button
              key={item.href}
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                "text-xs font-medium",
                "text-gray-600 dark:text-gray-400 hover:text-[#342B81] dark:hover:text-[#342B81]",
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
              </motion.div>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                "text-xs font-medium",
                pathname === item.href
                  ? "text-[#342B81] dark:text-[#342B81]"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#342B81] dark:hover:text-[#342B81]",
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
                {pathname === item.href && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="h-1 w-5 bg-[#342B81] dark:bg-[#342B81] rounded-full mt-1"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          ),
        )}
      </div>
    </motion.div>
  )
}
