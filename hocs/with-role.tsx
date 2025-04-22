"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import {LoadingSpinner} from "@/components/ui/loading-spinner"

/**
 * Higher-Order Component that restricts access based on user roles
 * Redirects to fallback page if user doesn't have the required role
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  options?: {
    redirectTo?: string
    loadingComponent?: React.ReactNode
  },
) {
  const WithRole = (props: P) => {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const redirectPath = options?.redirectTo || "/dashboard"

    useEffect(() => {
      // Only check roles after we've checked authentication status
      if (!isLoading && isAuthenticated && user) {
        const hasRequiredRole = allowedRoles.includes(user.role)
        if (!hasRequiredRole) {
          router.push(redirectPath)
        }
      }
    }, [isAuthenticated, isLoading, redirectPath, router, user])

    // Show loading state while checking authentication
    if (isLoading) {
      return options?.loadingComponent || <LoadingSpinner />
    }

    // If not authenticated or doesn't have required role, don't render anything
    // (we're in the process of redirecting)
    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
      return null
    }

    // If authenticated and has required role, render the wrapped component
    return <Component {...props} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithRole.displayName = `withRole(${displayName})`

  return WithRole
}
