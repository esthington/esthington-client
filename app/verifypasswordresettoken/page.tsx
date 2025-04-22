"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiConfig } from "@/lib/api";

function VerifyPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("resetToken");
  const [loading, setLoading] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiConfig.post(
          `/auth/user/verifypasswordresetoken`,
          {
            resetToken: token,
          }
        );

        if (response.status === 200) {
          setIsValid(true);
          toast.success("Token verified successfully");

          // Redirect after a short delay
          setTimeout(() => {
            router.push(`/update-password?token=${token}`);
          }, 2000);
        } else {
          setIsValid(false);
          toast.error(response.data?.message || "Invalid or expired token");
        }
      } catch (error: any) {
        console.error("Token verification failed:", error);
        setIsValid(false);

        const errorMessage =
          error?.response?.data?.message || "Invalid or expired token";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, router]);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23] text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Esthington Logo"
            width={48}
            height={48}
            className="block dark:hidden"
          />
          <Image
            src="/logo.png"
            alt="Esthington Logo"
            width={48}
            height={48}
            className="hidden dark:block"
          />
        </div>
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Verifying Reset Link
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we verify your password reset link...
        </p>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23] text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Esthington Logo"
            width={48}
            height={48}
            className="block dark:hidden"
          />
          <Image
            src="/logo.png"
            alt="Esthington Logo"
            width={48}
            height={48}
            className="hidden dark:block"
          />
        </div>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verified Successfully
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your reset link is valid. You will be redirected to update your
          password.
        </p>
        <Button
          onClick={() => router.push(`/update-password?token=${token}`)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Update Password
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23] text-center">
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.png"
          alt="Esthington Logo"
          width={48}
          height={48}
          className="block dark:hidden"
        />
        <Image
          src="/logo.png"
          alt="Esthington Logo"
          width={48}
          height={48}
          className="hidden dark:block"
        />
      </div>
      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Link Expired
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The password reset link is invalid or has expired. Please request a new
        one.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => router.push("/forgot-password")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Request New Link
        </Button>
        <Button variant="outline" onClick={() => router.push("/login")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Login
        </Button>
      </div>
    </div>
  );
}

export default function VerifyPassword() {
  return (
    <React.Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23] text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Loading
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
        </div>
      }
    >
      <VerifyPasswordContent />
    </React.Suspense>
  );
}
