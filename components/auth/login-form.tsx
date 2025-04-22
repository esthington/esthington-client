"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiConfig } from "@/lib/api";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiConfig.post(
        "/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );


      // Check response status or success indicator from the API
      if (response && response.status === 200) {
        const { token, refreshToken, user } = response.data;


        // Always store the user token, even if not verified
        Cookies.set("esToken", token, {
          expires: rememberMe ? 7 : 1, // 7 days if remember me is checked, otherwise 1 day
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Store refresh token
        Cookies.set("refreshToken", refreshToken, {
          expires: 30, // 30 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Store user info in localStorage
        localStorage.setItem("userRole", user.role || "user");
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userName", user.userName || "");
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem(
          "isEmailVerified",
          user.isEmailVerified ? "true" : "false"
        );

        // Show success toast for successful login
        toast.success("Login successful!");

       // Check if email is verified
        if (user.isEmailVerified === true) {
          // If verified, redirect to dashboard
          router.push("/dashboard");
        } else {
          // If not verified, redirect to account verification page
          router.push("/account-verify");
          toast.warning(
            "Please verify your email before accessing the dashboard"
          );
        }
      } else {
        // Handle case where response exists but indicates failure
        toast.error(response?.data?.message || "Failed to login");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      //Handle axios error with status code
      if ((error as any)?.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message ||
          `Error ${statusCode}: Failed to login`;

        // Different toast messages based on status code
        if (statusCode === 401) {
          // Check for specific error messages
          if (errorMessage.includes("verify your email")) {
            toast.error("Please verify your email before logging in");
            router.push(`/account-verify?email=${encodeURIComponent(email)}`);
          } else {
            toast.error("Invalid email or password");
          }
        } else if (statusCode === 403) {
          toast.error(
            "Your account has been deactivated. Please contact support."
          );
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
        Welcome Back
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Sign in to your account to continue
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

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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

        <div className="flex items-center">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label
            htmlFor="remember"
            className="ml-2 text-sm text-gray-600 dark:text-gray-400"
          >
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
