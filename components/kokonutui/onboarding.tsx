"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  WelcomeIllustration,
  AccountsIllustration,
  TransactionsIllustration,
  GoalsIllustration,
} from "./onboarding-illustrations"

const AUTOPLAY_INTERVAL = 5000 // 5 seconds per slide
const onboardingSteps = [
  {
    title: "Welcome to Esthington",
    description: "Your real estate management platform to discover, invest, and grow your portfolio.",
    illustration: WelcomeIllustration,
  },
  {
    title: "Property Investment",
    description: "Explore lucrative real estate opportunities and make informed investment decisions.",
    illustration: AccountsIllustration,
  },
  {
    title: "Digital Wallet",
    description: "Securely manage your funds, track transactions, and make seamless payments.",
    illustration: TransactionsIllustration,
  },
  {
    title: "Real Estate Marketplace",
    description: "Discover, buy, and sell properties with ease on our trusted marketplace.",
    illustration: GoalsIllustration,
  },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const router = useRouter()
  const [isPaused, setIsPaused] = useState(false)

  // Autoplay functionality
  useEffect(() => {
    if (currentStep >= onboardingSteps.length - 1 || isPaused) {
      return // Don't autoplay on the last step or when paused
    }

    const timer = setTimeout(() => {
      goToNextStep()
    }, AUTOPLAY_INTERVAL)

    return () => clearTimeout(timer)
  }, [currentStep, isPaused])

  const goToNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    localStorage.setItem("onboardingCompleted", "true")
    router.push("/login")
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const pauseAutoplay = () => setIsPaused(true)
  const resumeAutoplay = () => setIsPaused(false)

  return (
    <div
      className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F12]"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      {/* Skip button */}
      {currentStep < onboardingSteps.length - 1 && (
        <motion.button
          onClick={skipOnboarding}
          className="absolute top-6 right-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip
        </motion.button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Progress indicators */}
        <div className="flex space-x-2 mb-12">
          {onboardingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep
                  ? "bg-primary w-8"
                  : index < currentStep
                    ? "bg-primary w-2"
                    : "bg-gray-300 dark:bg-gray-700 w-2",
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="w-full max-w-md">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center"
            >
              {/* Illustration */}
              <motion.div
                className="relative w-64 h-64 mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {React.createElement(onboardingSteps[currentStep].illustration)}
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {onboardingSteps[currentStep].title}
              </motion.h2>

              <motion.p
                className="text-gray-600 dark:text-gray-400 text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {onboardingSteps[currentStep].description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="p-6 flex justify-between">
        <motion.button
          onClick={goToPrevStep}
          className={cn(
            "p-3 rounded-full transition-all",
            currentStep > 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              : "opacity-0 cursor-default",
          )}
          disabled={currentStep === 0}
          whileHover={currentStep > 0 ? { scale: 1.1 } : {}}
          whileTap={currentStep > 0 ? { scale: 0.9 } : {}}
        >
          <ArrowLeft className="w-6 h-4" />
        </motion.button>

        <motion.button
          onClick={goToNextStep}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full flex items-center gap-2 hover:bg-primary/90 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentStep === onboardingSteps.length - 1 ? (
            <>
              <span>Get Started</span>
              <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
