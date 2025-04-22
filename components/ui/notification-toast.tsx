"use client"

import { type ReactNode, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationToastProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: ReactNode
  duration?: number
  variant?: "default" | "success" | "error" | "warning" | "info"
}

export function NotificationToast({
  open,
  onClose,
  title,
  description,
  icon,
  duration = 5000,
  variant = "default",
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(open)

  useEffect(() => {
    setIsVisible(open)

    if (open && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [open, duration, onClose])

  const variantClasses = {
    default: "bg-white dark:bg-[#1F1F23] border-gray-200 dark:border-[#2B2B30]",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg",
            variantClasses[variant],
          )}
        >
          <div className="flex items-start gap-3">
            {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
              {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
            </div>
            <button
              onClick={() => {
                setIsVisible(false)
                onClose()
              }}
              className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
