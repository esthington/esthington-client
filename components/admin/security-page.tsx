"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, AlertTriangle, RefreshCw, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useSecurity } from "@/contexts/security-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SecurityPage() {
  const { settings, updateSettings, isLoading, isSubmitting, sessions, terminateSession } = useSecurity()

  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  const handleSwitchChange = (name: string, checked: boolean) => {
    updateSettings({ [name]: checked } as any)
  }

  const handleSelectChange = (name: string, value: string) => {
    updateSettings({ [name]: value } as any)
  }

  const handleUpdatePassword = () => {
    // In a real app, this would call the changePassword function from the context
    // For now, we'll just clear the input
    setNewPassword("")
    setShowPassword(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Security</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 mr-2 text-[#342B81]" />
          <h1 className="text-2xl font-bold">Security Settings</h1>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General Security</TabsTrigger>
            <TabsTrigger value="password">Password Policy</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
              <CardHeader>
                <CardTitle>General Security Settings</CardTitle>
                <CardDescription>Configure general security settings for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-400">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSwitchChange("twoFactorAuth", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="loginNotifications">Login Notifications</Label>
                    <p className="text-sm text-gray-400">Send email notifications for new logins</p>
                  </div>
                  <Switch
                    id="loginNotifications"
                    checked={settings.loginNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("loginNotifications", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="suspiciousActivityAlerts">Suspicious Activity Alerts</Label>
                    <p className="text-sm text-gray-400">Alert admins of suspicious platform activity</p>
                  </div>
                  <Switch
                    id="suspiciousActivityAlerts"
                    checked={settings.suspiciousActivityAlerts}
                    onCheckedChange={(checked) => handleSwitchChange("suspiciousActivityAlerts", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) => handleSelectChange("sessionTimeout", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="sessionTimeout" className="bg-[#1F1F23]/50 border-[#342B81]/50">
                      <SelectValue placeholder="Select timeout duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-400">Automatically log out inactive users</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>Configure password requirements and expiration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumPasswordLength">Minimum Password Length</Label>
                  <Select
                    value={settings.minimumPasswordLength}
                    onValueChange={(value) => handleSelectChange("minimumPasswordLength", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="minimumPasswordLength" className="bg-[#1F1F23]/50 border-[#342B81]/50">
                      <SelectValue placeholder="Select minimum length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="10">10 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                      <SelectItem value="16">16 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry</Label>
                  <Select
                    value={settings.passwordExpiry}
                    onValueChange={(value) => handleSelectChange("passwordExpiry", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="passwordExpiry" className="bg-[#1F1F23]/50 border-[#342B81]/50">
                      <SelectValue placeholder="Select expiry period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-400">Force password change after this period</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <p className="text-sm text-gray-400">Passwords must contain special characters</p>
                  </div>
                  <Switch
                    id="requireSpecialChars"
                    checked={settings.requireSpecialChars}
                    onCheckedChange={(checked) => handleSwitchChange("requireSpecialChars", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Change Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new admin password"
                      className="bg-[#1F1F23]/50 border-[#342B81]/50 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2 bg-[#342B81] hover:bg-[#342B81]/80"
                    onClick={handleUpdatePassword}
                    disabled={!newPassword || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Configure IP restrictions and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipRestriction">IP Restriction</Label>
                    <p className="text-sm text-gray-400">Limit admin access to specific IP addresses</p>
                  </div>
                  <Switch
                    id="ipRestriction"
                    checked={settings.ipRestriction}
                    onCheckedChange={(checked) => handleSwitchChange("ipRestriction", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                {settings.ipRestriction && (
                  <div className="space-y-2">
                    <Label htmlFor="allowedIPs">Allowed IP Addresses</Label>
                    <Input
                      id="allowedIPs"
                      name="allowedIPs"
                      placeholder="e.g. 192.168.1.1, 10.0.0.1"
                      value={settings.allowedIPs}
                      onChange={(e) => updateSettings({ allowedIPs: e.target.value } as any)}
                      className="bg-[#1F1F23]/50 border-[#342B81]/50"
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-gray-400">Separate multiple IPs with commas</p>
                  </div>
                )}

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-500">Security Warning</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Enabling IP restrictions without proper configuration may lock you out of the system. Make sure
                        to include your current IP address in the allowed list.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-white mb-2">Active Sessions</h3>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg border-gray-700"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {session.browser} on {session.device}
                          </p>
                          <p className="text-xs text-gray-400">
                            {session.location} •{" "}
                            {session.isCurrent
                              ? "Current session"
                              : `Last active: ${new Date(session.lastActive).toLocaleTimeString()}`}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={session.isCurrent || isSubmitting}
                          onClick={() => terminateSession(session.id)}
                          className={
                            session.isCurrent
                              ? ""
                              : "text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          }
                        >
                          {session.isCurrent ? "Current" : "Logout"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6">
            <Button className="bg-[#342B81] hover:bg-[#342B81]/80" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Security Settings"
              )}
            </Button>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}
