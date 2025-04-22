"use client"

import { motion } from "framer-motion"
import { Bell, Users, Building, DollarSign, Settings, Mail, MessageSquare, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useNotifications } from "@/contexts/notifications-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function NotificationsPage() {
  const { settings, updateSettings, isLoading, isSubmitting, sendTestNotification } = useNotifications()

  const handleToggle = (channel: keyof typeof settings, checked: boolean) => {
    updateSettings({
      [channel]: {
        ...settings[channel],
        enabled: checked,
      },
    } as any)
  }

  const handleTypeToggle = (channel: keyof typeof settings, type: string, checked: boolean) => {
    const currentTypes = settings[channel].types
    const newTypes = checked ? [...currentTypes, type] : currentTypes.filter((t) => t !== type)

    updateSettings({
      [channel]: {
        ...settings[channel],
        types: newTypes,
      },
    } as any)
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
            <BreadcrumbLink>Notifications</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center mb-6">
          <Bell className="h-6 w-6 mr-2 text-[#342B81]" />
          <h1 className="text-2xl font-bold">Notification Settings</h1>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="push">
              <Bell className="h-4 w-4 mr-2" />
              Push
            </TabsTrigger>
            <TabsTrigger value="sms">
              <Smartphone className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure which email notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                    <p className="text-sm text-gray-400">Master toggle for all email notifications</p>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => handleToggle("email", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="email-newUser">New User Registration</Label>
                      <p className="text-sm text-gray-400">Receive notifications when new users register</p>
                    </div>
                  </div>
                  <Switch
                    id="email-newUser"
                    checked={settings.email.types.includes("system")}
                    onCheckedChange={(checked) => handleTypeToggle("email", "system", checked)}
                    disabled={!settings.email.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="email-newProperty">New Property Listing</Label>
                      <p className="text-sm text-gray-400">Receive notifications for new property listings</p>
                    </div>
                  </div>
                  <Switch
                    id="email-newProperty"
                    checked={settings.email.types.includes("property")}
                    onCheckedChange={(checked) => handleTypeToggle("email", "property", checked)}
                    disabled={!settings.email.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="email-newTransaction">New Transaction</Label>
                      <p className="text-sm text-gray-400">Receive notifications for new transactions</p>
                    </div>
                  </div>
                  <Switch
                    id="email-newTransaction"
                    checked={settings.email.types.includes("transaction")}
                    onCheckedChange={(checked) => handleTypeToggle("email", "transaction", checked)}
                    disabled={!settings.email.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="email-systemAlerts">System Alerts</Label>
                      <p className="text-sm text-gray-400">Receive important system alerts and updates</p>
                    </div>
                  </div>
                  <Switch
                    id="email-systemAlerts"
                    checked={settings.email.types.includes("security")}
                    onCheckedChange={(checked) => handleTypeToggle("email", "security", checked)}
                    disabled={!settings.email.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="email-marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-gray-400">Receive marketing and promotional emails</p>
                    </div>
                  </div>
                  <Switch
                    id="email-marketingEmails"
                    checked={settings.email.types.includes("marketing")}
                    onCheckedChange={(checked) => handleTypeToggle("email", "marketing", checked)}
                    disabled={!settings.email.enabled || isSubmitting}
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendTestNotification("email", "system")}
                    disabled={!settings.email.enabled || !settings.email.types.includes("system") || isSubmitting}
                  >
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="push">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Configure which push notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                    <p className="text-sm text-gray-400">Master toggle for all push notifications</p>
                  </div>
                  <Switch
                    id="push-enabled"
                    checked={settings.push.enabled}
                    onCheckedChange={(checked) => handleToggle("push", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="push-newUser">New User Registration</Label>
                      <p className="text-sm text-gray-400">Receive notifications when new users register</p>
                    </div>
                  </div>
                  <Switch
                    id="push-newUser"
                    checked={settings.push.types.includes("system")}
                    onCheckedChange={(checked) => handleTypeToggle("push", "system", checked)}
                    disabled={!settings.push.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="push-newProperty">New Property Listing</Label>
                      <p className="text-sm text-gray-400">Receive notifications for new property listings</p>
                    </div>
                  </div>
                  <Switch
                    id="push-newProperty"
                    checked={settings.push.types.includes("property")}
                    onCheckedChange={(checked) => handleTypeToggle("push", "property", checked)}
                    disabled={!settings.push.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="push-newTransaction">New Transaction</Label>
                      <p className="text-sm text-gray-400">Receive notifications for new transactions</p>
                    </div>
                  </div>
                  <Switch
                    id="push-newTransaction"
                    checked={settings.push.types.includes("transaction")}
                    onCheckedChange={(checked) => handleTypeToggle("push", "transaction", checked)}
                    disabled={!settings.push.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="push-systemAlerts">System Alerts</Label>
                      <p className="text-sm text-gray-400">Receive important system alerts and updates</p>
                    </div>
                  </div>
                  <Switch
                    id="push-systemAlerts"
                    checked={settings.push.types.includes("security")}
                    onCheckedChange={(checked) => handleTypeToggle("push", "security", checked)}
                    disabled={!settings.push.enabled || isSubmitting}
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendTestNotification("push", "system")}
                    disabled={!settings.push.enabled || !settings.push.types.includes("system") || isSubmitting}
                  >
                    Send Test Push Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>Configure which SMS notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                    <p className="text-sm text-gray-400">Master toggle for all SMS notifications</p>
                  </div>
                  <Switch
                    id="sms-enabled"
                    checked={settings.sms.enabled}
                    onCheckedChange={(checked) => handleToggle("sms", checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="sms-newUser">New User Registration</Label>
                      <p className="text-sm text-gray-400">Receive notifications when new users register</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-newUser"
                    checked={settings.sms.types.includes("system")}
                    onCheckedChange={(checked) => handleTypeToggle("sms", "system", checked)}
                    disabled={!settings.sms.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="sms-newProperty">New Property Listing</Label>
                      <p className="text-sm text-gray-400">Receive notifications for new property listings</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-newProperty"
                    checked={settings.sms.types.includes("property")}
                    onCheckedChange={(checked) => handleTypeToggle("sms", "property", checked)}
                    disabled={!settings.sms.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="sms-newTransaction">New Transaction</Label>
                      <p className="text-sm text-gray-400">Receive notifications for new transactions</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-newTransaction"
                    checked={settings.sms.types.includes("transaction")}
                    onCheckedChange={(checked) => handleTypeToggle("sms", "transaction", checked)}
                    disabled={!settings.sms.enabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-[#FF9E0B]" />
                    <div>
                      <Label htmlFor="sms-systemAlerts">System Alerts</Label>
                      <p className="text-sm text-gray-400">Receive important system alerts and updates</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-systemAlerts"
                    checked={settings.sms.types.includes("security")}
                    onCheckedChange={(checked) => handleTypeToggle("sms", "security", checked)}
                    disabled={!settings.sms.enabled || isSubmitting}
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendTestNotification("sms", "security")}
                    disabled={!settings.sms.enabled || !settings.sms.types.includes("security") || isSubmitting}
                  >
                    Send Test SMS
                  </Button>
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
                "Save Notification Settings"
              )}
            </Button>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}
