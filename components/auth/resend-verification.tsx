"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiConfig } from "@/lib/api";

interface ResendVerificationProps {
  onSuccess?: () => void;
  className?: string;
}

export function ResendVerification({
  onSuccess,
  className = "",
}: ResendVerificationProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailNotFound(false);

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiConfig.post("/auth/user/resend-verification", {
        email,
      });

      if (response.status === 200) {
        toast.success("Verification email sent! Please check your inbox.");
        setEmail("");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error resending verification email:", error);

      if (error.response?.status === 404) {
        setEmailNotFound(true);
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

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-email">Email Address</Label>
          <Input
            id="verification-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Sending...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </form>

      {emailNotFound && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
