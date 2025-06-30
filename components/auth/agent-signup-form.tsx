"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiConfig } from "@/lib/api";
import cookie from "js-cookie";
import { UsernameChecker } from "@/components/auth/username-checker";

export default function AgentSignupForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for referral agent in query parameters
  const referralAgent = searchParams.get("ref") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isUsernameAvailable) {
      toast.error("Please choose an available username");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiConfig.post(
        "/auth/agent/register",
        {
          email,
          userName: username,
          password,
          confirmPassword,
          referralCode: referralAgent,
        },
        {
          withCredentials: true,
        }
      );

      // Check response status or success indicator from the API
      if (response && response.status === 201) {
        // Show success toast
        toast.success("Agent account created successfully!");
        // Redirect to dashboard

        const longerEXP = 1000 * 60 * 60 * 24 * 30;

        cookie.set("esToken", response.data.token, {
          expires: new Date(Date.now() + longerEXP),
          // secure: true,
          // sameSite: "strict",
        });

        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        // Handle case where response exists but indicates failure
        toast.error(response?.data?.message || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Signup failed:", error);

      // Handle axios error with status code
      if ((error as any)?.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message ||
          `Error ${statusCode}: Failed to create account`;

        // Different toast messages based on status code
        if (statusCode === 409) {
          toast.error("Email or username already exists");
        } else if (statusCode === 400) {
          toast.error(errorMessage || "Invalid input data");
        } else {
          toast.error(errorMessage);
        }
      } else {
        // Network errors or other issues
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23]">
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
        Create Agent Account
      </h1>
   
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 flex flex-row items-center gap-1">
          Sign Up as Buyer?{" "}
        <Link href="/buyer/signup" className="text-blue-500 hover:underline">
          Click here
        </Link>
        </p>
      <div className="">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                id="agent-email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <UsernameChecker
            value={username}
            onChange={setUsername}
            onAvailabilityChange={setIsUsernameAvailable}
          />

          <div className="space-y-2">
            <Label htmlFor="referral-agent">Referral Agent (Optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                id="referral-agent"
                type="text"
                placeholder="Referral agent username"
                className="pl-10"
                defaultValue={referralAgent}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                id="agent-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                id="agent-confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading || !isUsernameAvailable}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
