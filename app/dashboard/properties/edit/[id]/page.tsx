"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import PropertyEditForm from "@/components/properties/property-edit-form"
import { PropertyProvider } from "@/components/providers/property-provider"

export default function PropertyEditPage() {
  const router = useRouter()
  const params = useParams()
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Get user role from localStorage
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole")
      setUserRole(role)

      // Redirect if not admin
      if (role !== "admin") {
        router.push("/dashboard/properties")
      }
    }

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

  // If not admin, don't render the edit form
  if (userRole !== "admin") {
    return null
  }

  return (
    <PropertyProvider propertyId={params?.id as string}>
      <PropertyEditForm propertyId={params?.id as string} />
    </PropertyProvider>
  )
}
