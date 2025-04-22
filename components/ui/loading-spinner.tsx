"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "primary" | "secondary" | "white"
  className?: string
}

export function LoadingSpinner({ size = "md", color = "primary", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const colorClasses = {
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-gray-600 dark:text-gray-400",
    white: "text-white",
  }

  const spinTransition = {
    repeat: Number.POSITIVE_INFINITY,
    ease: "linear",
    duration: 1,
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn("border-2 rounded-full", sizeClasses[size], colorClasses[color], "border-t-transparent")}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
    </div>
  )
}
