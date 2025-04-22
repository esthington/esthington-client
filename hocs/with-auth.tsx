"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

/**
 * Higher-Order Component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    loadingComponent?: React.ReactNode
  },
) {
  const WithAuth = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const redirectPath = options?.redirectTo || "/login"

    useEffect(() => {
      // Only redirect after we've checked authentication status
      if (!isLoading && !isAuthenticated) {
        router.push(redirectPath)
      }
    }, [isAuthenticated, isLoading, redirectPath, router])

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        options?.loadingComponent || (
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )
      )
    }

    // If not authenticated and not loading, don't render anything
    // (we're in the process of redirecting)
    if (!isAuthenticated) {
      return null
    }

    // If authenticated, render the wrapped component
    return <Component {...props} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithAuth.displayName = `withAuth(${displayName})`

  return WithAuth
}
