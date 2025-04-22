"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import SecuritySettingsForm from "@/components/auth/security-settings-form"

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted") === "true"

    if (!hasCompletedOnboarding) {
      router.push("/")
    }

    // Simulate loading time for animation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [router])

  if (!isClient) {
    return null // Return null during server-side rendering
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <SecuritySettingsForm />
}
