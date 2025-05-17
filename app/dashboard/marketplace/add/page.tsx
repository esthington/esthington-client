
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PropertyProvider } from "@/contexts/property-context";
import { useAuth } from "@/contexts/auth-context";
import AddMarketplaceListingPage from "@/components/marketplace/add-marketplace-listing-page";

export default function AddMarketplaceListing() {
  const router = useRouter();
  const params = useParams();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);

    // Get user role from localStorage
    if (typeof window !== "undefined") {
      if (user?.role !== "admin" && user?.role !== "super_admin") {
        router.push("/dashboard/properties");
      }
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding =
      localStorage.getItem("onboardingCompleted") === "true";

    if (!hasCompletedOnboarding) {
      router.push("/dashboard/");
    }

    // Simulate loading time for animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  if (!isClient) {
    return null; // Return null during server-side rendering
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not admin, don't render the create form
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return null;
  }

  return (
    <PropertyProvider>
      <AddMarketplaceListingPage />
    </PropertyProvider>
  );
}

