"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export default function StaggerItem({ children, className = "" }: StaggerItemProps) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  )
}
