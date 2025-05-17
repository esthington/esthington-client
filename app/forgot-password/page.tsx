"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { withPublicRoute } from "@/hocs/not-signed-hoc";

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}

// Wrap the page with withPublicRoute to prevent authenticated users from accessing it
export default withPublicRoute(ForgotPasswordPage, {
  redirectTo: "/dashboard", // Redirect authenticated users to the dashboard
  loadingComponent: (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12]">
      <LoadingSpinner />
    </div>
  ),
});
