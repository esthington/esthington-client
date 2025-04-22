"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  animateOnFocus?: boolean
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, animateOnFocus = true, ...props }, ref) => {
    return (
      <motion.div whileTap={{ scale: animateOnFocus ? 0.99 : 1 }} className="relative">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-300",
            animateOnFocus && "focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]",
            className,
          )}
          {...props}
        />
      </motion.div>
    )
  },
)

AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }
