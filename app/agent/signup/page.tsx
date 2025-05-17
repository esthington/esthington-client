"use client";

import { Suspense } from "react";
import AgentSignupForm from "@/components/auth/agent-signup-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { withPublicRoute } from "@/hocs/not-signed-hoc";

function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <AgentSignupForm />
      </Suspense>
    </div>
  );
}

// Wrap the page with withPublicRoute to prevent authenticated users from accessing it
export default withPublicRoute(SignupPage, {
  redirectTo: "/dashboard", // Redirect authenticated users to the app dashboard
  loadingComponent: (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12]">
      <LoadingSpinner />
    </div>
  ),
});
