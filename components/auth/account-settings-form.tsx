"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User, Mail, Phone, MapPin, Save, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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

export default function AccountSettingsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    avatar: "/placeholder.svg?height=200&width=200",
  })

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      // In a real app, you would fetch user data from your API
      setFormData({
        fullName: "Eugene An",
        email: "eugene@example.com",
        phone: "+234 123 456 7890",
        address: "123 Main Street, Lagos, Nigeria",
        bio: "Real estate investor and property enthusiast with a passion for finding the best deals.",
        avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png",
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate API call to update user profile
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success toast
      successToast("Profile updated successfully")
    } catch (error) {
      // Show error toast
      errorToast("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    // For demo purposes, we'll just set a different avatar
    setFormData((prev) => ({
      ...prev,
      avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and preferences</p>
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
                  <BreadcrumbPage>Account</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <AnimatedCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <div className="relative group">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                          <Image
                            src={formData.avatar || "/placeholder.svg"}
                            alt="Profile avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAvatarChange}
                          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                        Click the upload button to change your profile picture
                      </p>
                    </div>

                    <div className="md:w-2/3 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Your email address"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Your address"
                            className="pl-10 min-h-[80px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself"
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <AnimatedButton
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" /> Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </>
                      )}
                    </AnimatedButton>
                  </div>
                </form>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="preferences">
              <AnimatedCard className="p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive SMS notifications for important updates
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="smsNotifications"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive marketing emails about new properties and offers
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="marketingEmails"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Language & Region</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          defaultValue="en"
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          defaultValue="WAT"
                        >
                          <option value="WAT">West Africa Time (WAT)</option>
                          <option value="GMT">Greenwich Mean Time (GMT)</option>
                          <option value="EST">Eastern Standard Time (EST)</option>
                          <option value="PST">Pacific Standard Time (PST)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <AnimatedButton type="button" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="mr-2 h-4 w-4" /> Save Preferences
                    </AnimatedButton>
                  </div>
                </div>
              </AnimatedCard>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </>
  )
}
