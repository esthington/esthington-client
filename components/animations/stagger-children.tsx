"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface StaggerChildrenProps {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}

export default function StaggerChildren({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = "",
}: StaggerChildrenProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}
