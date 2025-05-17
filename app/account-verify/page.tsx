"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AccountVerify from "@/components/auth/verification-page";

function AccountVerifyPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Custom protection logic for this specific page
  React.useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        // router.push("/login");
      }
      // If authenticated and email is already verified, redirect to dashboard
      else if (user?.isEmailVerified) {
        router.push("/dashboard");
      }
      // Otherwise, show the verification page (user is authenticated but email not verified)
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12]">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, don't render anything (we're redirecting)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but email is verified, don't render anything (we're redirecting)
  if (user?.isEmailVerified) {
    return null;
  }

  // If authenticated and email is not verified, show the verification page
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12]">
          <LoadingSpinner />
        </div>
      }
    >
      <AccountVerify />
    </Suspense>
  );
}

export default AccountVerifyPage;
