"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiConfig } from "@/lib/api";
import cookie from "js-cookie";
import { UsernameChecker } from "@/components/auth/username-checker";

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface SignupResponse {
  status: number;
  data: {
    token: string;
    message?: string;
  };
}

export default function AgentSignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get referral agent from query parameters
  const agent = searchParams.get("ref") || "";
  const [referralAgent, setReferralAgent] = useState(agent);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!isUsernameAvailable) {
      toast.error("Please choose an available username");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleApiError = (error: ApiError) => {
    console.error("Signup failed:", error);

    if (error.response) {
      const { status, data } = error.response;
      const errorMessage =
        data?.message || `Error ${status}: Failed to create account`;

      switch (status) {
        case 409:
          toast.error("Email or username already exists");
          break;
        case 400:
          toast.error(errorMessage || "Invalid input data");
          break;
        case 422:
          toast.error("Please check your input and try again");
          break;
        default:
          toast.error(errorMessage);
      }
    } else {
      toast.error(error.message || "Network error. Please try again later.");
    }
  };

  const handleSuccessfulSignup = (response: SignupResponse) => {
    toast.success("Agent account created successfully!");

    // Set authentication cookie
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
    cookie.set("esToken", response.data.token, {
      expires: new Date(Date.now() + thirtyDays),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Navigate to dashboard instead of reloading
    router.push("/dashboard");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await apiConfig.post<SignupResponse["data"]>(
        "/auth/agent/register",
        {
          email: formData.email,
          userName: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          referralCode: referralAgent,
        },
        {
          withCredentials: true,
        }
      );

      if (response?.status === 201) {
        handleSuccessfulSignup(response as SignupResponse);
      } else {
        toast.error(response?.data?.message || "Failed to create account");
      }
    } catch (error) {
      handleApiError(error as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.email &&
    formData.username &&
    formData.password &&
    formData.confirmPassword &&
    isUsernameAvailable;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.png"
          alt="Esthington Logo"
          width={48}
          height={48}
          priority
        />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Agent Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Create an account, refer and earn commissions
        </p>
      </div>

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
              value={formData.email}
              onChange={handleInputChange("email")}
              required
              aria-describedby="email-error"
            />
          </div>
        </div>

        <UsernameChecker
          value={formData.username}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, username: value }))
          }
          onAvailabilityChange={setIsUsernameAvailable}
        />

        <div className="space-y-2">
          <Label htmlFor="referral-agent">
            Referral Agent <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              id="referral-agent"
              type="text"
              placeholder="Referral agent username"
              className="pl-10"
              value={referralAgent}
              onChange={(e) => setReferralAgent(e.target.value)}
              required
            />
          </div>
          {referralAgent && (
            <p className="text-xs text-green-500">
              Kindly verify {referralAgent} before proceeding
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              id="agent-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password (min. 8 characters)"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={handleInputChange("password")}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              required
            />
          </div>
          {formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Want to become a Buyer?{" "}
        <Link
          href={`/buyer/signup${
            referralAgent ? `?ref=${encodeURIComponent(referralAgent)}` : ""
          }`}
          className="text-primary hover:underline"
        >
          Click here
        </Link>
      </p>
    </div>
  );
}
