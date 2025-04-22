import { Suspense } from "react";
import SignupForm from "@/components/auth/buyer-signup-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
