"use client"

import type React from "react"

import { useState } from "react"
import { Lock, Eye, EyeOff, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import FadeIn from "@/components/animations/fade-in"
import { successToast, errorToast } from "@/lib/toast"

export default function SecuritySettingsForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success")
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      errorToast("New passwords do not match")
      return
    }

    setIsChangingPassword(true)

    try {
      // Simulate API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success toast
      successToast("Password changed successfully")

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      // Show error toast
      errorToast("Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account security and password</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/settings">Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Security</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <AnimatedCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    className="pl-10"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="pl-10"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <AnimatedButton
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isChangingPassword ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" /> Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Change Password
                    </>
                  )}
                </AnimatedButton>
              </div>
            </form>
          </AnimatedCard>
        </FadeIn>

        <FadeIn delay={0.3}>
          <AnimatedCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account by requiring a verification code in addition to your
                    password.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Login Sessions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  These are the devices that are currently logged into your account.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Chrome on Windows</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lagos, Nigeria • Current session</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Current
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Safari on iPhone</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lagos, Nigeria • Last active: 2 hours ago
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </FadeIn>
      </div>
    </>
  )
}
