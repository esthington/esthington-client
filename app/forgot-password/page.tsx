"use client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
