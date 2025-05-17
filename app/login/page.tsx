"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { withPublicRoute } from "@/hocs/not-signed-hoc";

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

// Wrap the page with withPublicRoute to prevent authenticated users from accessing it
export default withPublicRoute(LoginPage, {
  redirectTo: "/dashboard", // Redirect authenticated users to the dashboard
  loadingComponent: (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12]">
      <LoadingSpinner />
    </div>
  ),
});
