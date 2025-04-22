"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useManagementPermissions, type ManagementPermission } from "@/hooks/use-management-permissions"
import { useAuth } from "@/contexts/auth-context"
import {LoadingSpinner} from "@/components/ui/loading-spinner"

/**
 * Higher-Order Component that restricts access based on specific permissions
 * Redirects to fallback page if user doesn't have the required permission
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: ManagementPermission,
  options?: {
    redirectTo?: string
    loadingComponent?: React.ReactNode
  },
) {
  const WithPermission = (props: P) => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const { hasPermission, permissions } = useManagementPermissions(user?.role || "buyer")
    const router = useRouter()
    const redirectPath = options?.redirectTo || "/dashboard"
    const isLoading = authLoading

    useEffect(() => {
      // Only check permissions after we've checked authentication status
      if (!isLoading && isAuthenticated && user) {
        const hasRequiredPermission = hasPermission(requiredPermission)
        if (!hasRequiredPermission) {
          router.push(redirectPath)
        }
      }
    }, [isAuthenticated, isLoading, redirectPath, router, user, hasPermission, requiredPermission])

    // Show loading state while checking authentication
    if (isLoading) {
      return options?.loadingComponent || <LoadingSpinner />
    }

    // If not authenticated or doesn't have required permission, don't render anything
    // (we're in the process of redirecting)
    if (!isAuthenticated || !user || !hasPermission(requiredPermission)) {
      return null
    }

    // If authenticated and has required permission, render the wrapped component
    return <Component {...props} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithPermission.displayName = `withPermission(${displayName})`

  return WithPermission
}
