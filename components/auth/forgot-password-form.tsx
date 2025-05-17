"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiConfig } from "@/lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the API to send password reset email
      const response = await apiConfig.post(
        "/auth/user/forgot-password",
        { email },
        { withCredentials: true }
      );

      if (response && response.status === 200) {
        setIsSubmitted(true);
        toast.success("Password reset link sent successfully!");
      } else {
        toast.error(response?.data?.message || "Failed to send reset link");
      }
    } catch (error: any) {
      console.error("Password reset request failed:", error);

      if ((error as any)?.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message ||
          `Error ${statusCode}: Failed to send reset link`;

        if (statusCode === 404) {
          toast.error("No account found with this email address");
        } else if (statusCode === 400) {
          toast.error(errorMessage || "Invalid email address");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-sm border border-gray-200 dark:border-[#1F1F23]">
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

      {isSubmitted ? (
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a password reset link to{" "}
            <span className="font-medium">{email}</span>. Please check your
            inbox and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            If you don't see the email, please check your spam folder or request
            another reset link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Try Another Email
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Back to Login
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we'll send you a link to reset your
            password
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Sending Reset
                  Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Login
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
