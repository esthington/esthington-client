"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

/**
 * Higher-Order Component that adds loading state handling
 */
export function withLoading<P extends object>(
  Component: React.ComponentType<P & { isLoading?: boolean }>,
  options?: {
    loadingComponent?: React.ReactNode
    loadingDelay?: number
  },
) {
  const WithLoading = (props: P & { isLoading?: boolean }) => {
    const [isLoading, setIsLoading] = useState(true)
    const delay = options?.loadingDelay || 1000

    useEffect(() => {
      // Simulate loading for demo purposes
      // In a real app, this would be based on data fetching
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, delay)

      return () => clearTimeout(timer)
    }, [delay])

    // Show loading state
    if (isLoading || props.isLoading) {
      return (
        options?.loadingComponent || (
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )
      )
    }

    // When loaded, render the wrapped component
    return <Component {...props} isLoading={isLoading} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithLoading.displayName = `withLoading(${displayName})`

  return WithLoading
}
