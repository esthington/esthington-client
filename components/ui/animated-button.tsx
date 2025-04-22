"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  animateScale?: boolean
  animateHover?: boolean
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "default", animateScale = true, animateHover = true, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden transition-all",
          animateHover && "transform hover:-translate-y-1 active:translate-y-0",
          className,
        )}
        {...props}
        asChild
      >
        <motion.button whileTap={animateScale ? { scale: 0.95 } : undefined} transition={{ duration: 0.2 }}>
          {props.children}
          <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        </motion.button>
      </Button>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
