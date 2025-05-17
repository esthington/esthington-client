"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { withPublicRoute } from "@/hocs/not-signed-hoc";
import RequestPasswordVerificationPage from "@/components/auth/password-verification-page";

function RequestVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <RequestPasswordVerificationPage />
      </Suspense>
    </div>
  );
}

// Wrap the page with withPublicRoute to prevent authenticated and verified users from accessing it
export default withPublicRoute(RequestVerificationPage, {
  redirectTo: "/dashboard", // Redirect authenticated users to the dashboard
  loadingComponent: (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12]">
      <LoadingSpinner />
    </div>
  ),
});
