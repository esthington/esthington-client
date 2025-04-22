"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

export default function SplashScreen() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)
 const {user} = useAuth() // Ensure auth context is loaded

  useEffect(() => {
    // Check if user has already seen the splash screen
    const hasSeenSplash = localStorage.getItem("hasSeenSplash")

    if (hasSeenSplash) {
      setIsVisible(false)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem("hasSeenSplash", "true")

      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted")

      if (!hasCompletedOnboarding) {
        router.push("/onboarding")
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F0F12] to-[#1F1F23]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-64 h-64 mb-8"
      >
        <Image
          src="/logo.svg"
          alt="Esthington Group Logo"
          fill
          className="object-cover rounded-2xl"
        />
      </motion.div>

      <motion.h1
        className="text-3xl font-bold text-white mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Esthington Group
      </motion.h1>

      <motion.p
        className="text-gray-400 text-center max-w-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Your gateway to premium real estate investments
      </motion.p>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="w-12 h-1 bg-blue-600 rounded-full animate-pulse"></div>
      </motion.div>
    </motion.div>
  )
}
