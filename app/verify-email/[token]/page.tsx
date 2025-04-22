"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnimatedCard } from "@/components/ui/animated-card";
import { apiConfig } from "@/lib/api";

export default function RequestVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if user is already verified on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const esToken = Cookies.get("esToken");

      if (!esToken) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        // Set the token in the authorization header
        apiConfig.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${esToken}`;

        // Get user profile to check verification status
        const response = await apiConfig.get("/auth/me");

        if (response.status === 200 && response.data.user) {
          const user = response.data.user;

          // Update local storage with latest user data
          localStorage.setItem("userRole", user.role || "user");
          localStorage.setItem("userId", user._id);
          localStorage.setItem("userName", user.userName || "");
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem(
            "isEmailVerified",
            user.isEmailVerified ? "true" : "false"
          );

          // If user is verified, redirect to dashboard
          if (user.isEmailVerified) {
            toast.success("Your email is already verified!");
            router.push("/dashboard");
            return;
          }

          // If we have the email from the user object, use it
          if (user.email && !email) {
            setEmail(user.email);
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        // If there's an error, we'll just continue with the verification page
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkVerificationStatus();
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      // Get the token from cookies
      const esToken = Cookies.get("esToken");

      // If we have a token, include it in the request
      const headers = esToken ? { Authorization: `Bearer ${esToken}` } : {};

      const response = await apiConfig.post(
        "/auth/resend-verification",
        { email },
        { headers }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (error: any) {
      console.error("Error resending verification email:", error);

      if (error.response?.status === 404) {
        toast.error("No account found with this email address");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Invalid request");
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error(
          "Failed to send verification email. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking verification status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
        <AnimatedCard className="w-full max-w-md p-6 text-center">
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
            Checking Verification Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait a moment...
          </p>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <AnimatedCard className="w-full max-w-md p-6">
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

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h1>

        {isSuccess ? (
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-4 rounded-md mb-6">
              <p>Verification email sent!</p>
              <p className="mt-2">
                Please check your inbox and click the verification link.
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              If you don't see the email, please check your spam folder.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                }}
                variant="outline"
              >
                Send again
              </Button>

              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                variant="ghost"
              >
                Use a different email
              </Button>

              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Your account requires email verification. Please enter your email
              address below to receive a verification link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Sending...
                  </>
                ) : (
                  "Send Verification Email"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already verified?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </>
        )}
      </AnimatedCard>
    </div>
  );
}
