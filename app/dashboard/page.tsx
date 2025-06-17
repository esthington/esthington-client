"use client";

import { Suspense } from "react";

import DashboardContent from "@/components/kokonutui/dashboard-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { withAuth } from "@/hocs";

function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      
      <DashboardContent />
  
    </Suspense>
  );
}

// Wrap the page with withAuth to prevent unauthenticated users from accessing it
export default withAuth(DashboardPage, {
  redirectTo: "/login", // Redirect unauthenticated users to the login page
  loadingComponent: (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
});
