"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { apiConfig } from "@/lib/api"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get("resetToken")

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false)
        setIsValidToken(false)
        toast.error("Reset token is missing")
        return
      }

      try {
        // Call API to verify token
        const response = await apiConfig.post("/auth/user/verifypasswordresetoken", {
          resetToken: token,
        })

        if (response && response.status === 200) {
          setIsValidToken(true)
        } else {
          toast.error("Invalid or expired reset token")
        }
      } catch (error: any) {
        console.error("Token verification failed:", error)

        if (error?.response?.status === 404) {
          toast.error("Invalid or expired reset token")
        } else if (error?.response?.status === 400) {
          toast.error(error?.response?.data?.message || "Invalid token format")
        } else {
          toast.error("An error occurred while verifying your reset token")
        }
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("token", token)
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      // Call API to reset password
      const response = await apiConfig.post(
        "/auth/user/reset-password",
        {
          resetToken: token,
          password,
          confirmPassword: confirmPassword
        },
        {
          withCredentials: true,
        }
      );

      if (response && response.status === 200) {
        setIsSubmitted(true)
        toast.success("Password reset successful!")
      } else {
        toast.error(response?.data?.message || "Failed to reset password")
      }
    } catch (error: any) {
      console.error("Password reset failed:", error)

      if (error?.response) {
        const statusCode = error.response.status
        const errorMessage = error.response.data?.message || `Error ${statusCode}: Failed to reset password`

        if (statusCode === 400) {
          toast.error(errorMessage || "Invalid password format")
        } else if (statusCode === 404) {
          toast.error("Invalid or expired reset token")
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error("Network error. Please try again later.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center" aria-live="polite" aria-busy="true">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying Reset Link</h1>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your password reset link...</p>
        </div>
      )
    }

    if (!isValidToken) {
      return (
        <div className="text-center" aria-live="polite">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            onClick={() => router.push("/forgot-password")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Request New Link
          </Button>
        </div>
      )
    }

    if (isSubmitted) {
      return (
        <div className="text-center" aria-live="polite">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset Successful</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Go to Login
          </Button>
        </div>
      )
    }

    return (
      <>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Reset Password</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Create a new password for your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a new password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                aria-describedby="password-requirements"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>
            <p id="password-requirements" className="text-xs text-gray-500 dark:text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
                <LoadingSpinner size="sm" className="mr-2" aria-hidden="true" /> Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Back to Login
            </Link>
          </div>
        </form>
      </>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0F0F12] rounded-xl shadow-md border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Esthington Logo" width={48} height={48} className="block dark:hidden" priority />
        <Image src="/logo.png" alt="Esthington Logo" width={48} height={48} className="hidden dark:block" priority />
      </div>
      {renderContent()}
    </div>
  )
}
