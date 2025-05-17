"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

/**
 * Higher-Order Component that protects public routes
 * Redirects authenticated users to app dashboard
 */
export function withPublicRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    allowedRoutes?: string[];
    loadingComponent?: React.ReactNode;
  }
) {
  const WithPublicRoute = (props: P) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    console.log("isAuthenticated", isAuthenticated);
    console.log("isLoading", isLoading);
    console.log("user", user);
    console.log("props", props);

    const redirectPath = options?.redirectTo || "/dashboard";

    useEffect(() => {
      // Only redirect after we've checked authentication status
      if (!isLoading) {
        if (isAuthenticated) {
          // If user is authenticated but email not verified
          if (user && !user.isEmailVerified) {
            router.push("/account-verify");
          } else {
            // User is authenticated and verified, redirect to app
            router.push(redirectPath);
          }
        }
      }
    }, [isAuthenticated, isLoading, user, router, redirectPath]);

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        options?.loadingComponent || (
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )
      );
    }

    // If authenticated, don't render the component (we're redirecting)
    if (isAuthenticated) {
      return null;
    }

    // If not authenticated, render the component
    return <Component {...props} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithPublicRoute.displayName = `withPublicRoute(${displayName})`;

  return WithPublicRoute;
}
