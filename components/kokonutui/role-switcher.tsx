"use client"

import { useState, useEffect } from "react"
import { Check, User, Building, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function RoleSwitcher() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole")
      setUserRole(role)
    }
  }, [])

  const handleRoleChange = (role: string) => {
    localStorage.setItem("userRole", role)
    setUserRole(role)

    // Refresh the page to apply the new role
    router.refresh()
  }

  const roles = [
    {
      id: "buyer",
      name: "Buyer",
      description: "Browse and invest in properties",
      icon: User,
    },
    {
      id: "agent",
      name: "Agent",
      description: "List properties and manage referrals",
      icon: Building,
    },
    {
      id: "admin",
      name: "Admin",
      description: "Manage platform and users",
      icon: Shield,
    },
  ]

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Switch Account Role</h3>
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleChange(role.id)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-lg text-left",
              userRole === role.id
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100",
            )}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  "p-1.5 rounded-md mr-3",
                  userRole === role.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
                )}
              >
                <role.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{role.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{role.description}</p>
              </div>
            </div>
            {userRole === role.id && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          </button>
        ))}
      </div>
    </div>
  )
}
