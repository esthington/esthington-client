"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { PageTransition } from "@/components/animations/page-transition"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerChildren } from "@/components/animations/stagger-children"
import { StaggerItem } from "@/components/animations/stagger-item"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mock data for referral program settings
const initialSettings = {
  commissionRates: {
    Bronze: {
      investment: 2.5,
      property: 1.0,
    },
    Silver: {
      investment: 3.5,
      property: 1.5,
    },
    Gold: {
      investment: 5.0,
      property: 2.0,
    },
    Platinum: {
      investment: 7.5,
      property: 3.0,
    },
  },
  rankThresholds: {
    Bronze: { min: 0, max: 9 },
    Silver: { min: 10, max: 24 },
    Gold: { min: 25, max: 49 },
    Platinum: { min: 50, max: Number.POSITIVE_INFINITY },
  },
  payoutSettings: {
    minimumAmount: 50,
    frequency: "monthly",
    processingDays: 3,
    autoApprove: true,
  },
  programSettings: {
    enabled: true,
    allowMultiLevel: false,
    maxReferralDepth: 1,
    referralLinkExpiry: 0, // 0 means never expires
    requireVerification: true,
  },
}

export default function ReferralSettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [activeTab, setActiveTab] = useState("commission")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update commission rates
  const updateCommissionRate = (rank, type, value) => {
    setSettings((prev) => ({
      ...prev,
      commissionRates: {
        ...prev.commissionRates,
        [rank]: {
          ...prev.commissionRates[rank],
          [type]: Number.parseFloat(value),
        },
      },
    }))
    setHasChanges(true)
  }

  // Update rank thresholds
  const updateRankThreshold = (rank, field, value) => {
    setSettings((prev) => ({
      ...prev,
      rankThresholds: {
        ...prev.rankThresholds,
        [rank]: {
          ...prev.rankThresholds[rank],
          [field]: Number.parseInt(value),
        },
      },
    }))
    setHasChanges(true)
  }

  // Update payout settings
  const updatePayoutSetting = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      payoutSettings: {
        ...prev.payoutSettings,
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  // Update program settings
  const updateProgramSetting = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      programSettings: {
        ...prev.programSettings,
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true)

    try {
      // In a real app, this would be an API call
      // await fetch('/api/admin/referral-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Referral program settings saved successfully")
      setHasChanges(false)
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col space-y-8">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/admin/referrals">Referrals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/admin/referrals/settings">Settings</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <FadeIn>
                <div>
                  <h1 className="text-2xl font-bold text-white">Referral Program Settings</h1>
                  <p className="text-gray-400">Configure commission rates, rank thresholds, and program settings</p>
                </div>
              </FadeIn>

              <Button
                onClick={saveSettings}
                disabled={!hasChanges || isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#1F1F23]/50 border border-[#2A2A30] p-1 rounded-lg">
              <TabsTrigger value="commission" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Commission Rates
              </TabsTrigger>
              <TabsTrigger value="ranks" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Rank Thresholds
              </TabsTrigger>
              <TabsTrigger value="payouts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Payout Settings
              </TabsTrigger>
              <TabsTrigger value="program" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Program Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commission" className="mt-4">
              <StaggerChildren>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                  <CardHeader>
                    <CardTitle className="text-white">Commission Rates</CardTitle>
                    <CardDescription>
                      Configure commission rates for different agent ranks and transaction types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(settings.commissionRates).map(([rank, rates], index) => (
                        <StaggerItem key={rank}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <Award className={`h-5 w-5 mr-2 text-${getRankColor(rank)}-500`} />
                                <h3 className="text-lg font-medium text-white">{rank} Rank</h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label htmlFor={`${rank}-investment`} className="text-gray-400">
                                      Investment Commission (%)
                                    </Label>
                                    <span className="text-white font-medium">{rates.investment}%</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Slider
                                      id={`${rank}-investment`}
                                      min={0}
                                      max={10}
                                      step={0.5}
                                      value={[rates.investment]}
                                      onValueChange={([value]) => updateCommissionRate(rank, "investment", value)}
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      value={rates.investment}
                                      onChange={(e) => updateCommissionRate(rank, "investment", e.target.value)}
                                      min={0}
                                      max={10}
                                      step={0.5}
                                      className="w-20 bg-[#2A2A30] border-[#3A3A40] text-white"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label htmlFor={`${rank}-property`} className="text-gray-400">
                                      Property Commission (%)
                                    </Label>
                                    <span className="text-white font-medium">{rates.property}%</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Slider
                                      id={`${rank}-property`}
                                      min={0}
                                      max={5}
                                      step={0.5}
                                      value={[rates.property]}
                                      onValueChange={([value]) => updateCommissionRate(rank, "property", value)}
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      value={rates.property}
                                      onChange={(e) => updateCommissionRate(rank, "property", e.target.value)}
                                      min={0}
                                      max={5}
                                      step={0.5}
                                      className="w-20 bg-[#2A2A30] border-[#3A3A40] text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {index < Object.entries(settings.commissionRates).length - 1 && (
                              <Separator className="my-6 bg-[#2A2A30]" />
                            )}
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerChildren>
            </TabsContent>

            <TabsContent value="ranks" className="mt-4">
              <StaggerChildren>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                  <CardHeader>
                    <CardTitle className="text-white">Rank Thresholds</CardTitle>
                    <CardDescription>Configure the number of referrals required to achieve each rank</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(settings.rankThresholds).map(([rank, threshold], index) => (
                        <StaggerItem key={rank}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <Award className={`h-5 w-5 mr-2 text-${getRankColor(rank)}-500`} />
                                <h3 className="text-lg font-medium text-white">{rank} Rank</h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor={`${rank}-min`} className="text-gray-400">
                                    Minimum Referrals
                                  </Label>
                                  <Input
                                    id={`${rank}-min`}
                                    type="number"
                                    value={threshold.min}
                                    onChange={(e) => updateRankThreshold(rank, "min", e.target.value)}
                                    min={0}
                                    className="bg-[#2A2A30] border-[#3A3A40] text-white"
                                    disabled={rank === "Bronze"} // Bronze always starts at 0
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`${rank}-max`} className="text-gray-400">
                                    Maximum Referrals
                                  </Label>
                                  <Input
                                    id={`${rank}-max`}
                                    type="number"
                                    value={rank !== "Platinum" ? threshold.max : "∞"}
                                    onChange={(e) => updateRankThreshold(rank, "max", e.target.value)}
                                    min={threshold.min + 1}
                                    className="bg-[#2A2A30] border-[#3A3A40] text-white"
                                    disabled={rank === "Platinum"} // Platinum has no upper limit
                                  />
                                </div>
                              </div>
                            </div>

                            {index < Object.entries(settings.rankThresholds).length - 1 && (
                              <Separator className="my-6 bg-[#2A2A30]" />
                            )}
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerChildren>
            </TabsContent>

            <TabsContent value="payouts" className="mt-4">
              <StaggerChildren>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                  <CardHeader>
                    <CardTitle className="text-white">Payout Settings</CardTitle>
                    <CardDescription>Configure how and when referral commissions are paid out</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <StaggerItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="minimum-amount" className="text-gray-400">
                              Minimum Payout Amount ($)
                            </Label>
                            <Input
                              id="minimum-amount"
                              type="number"
                              value={settings.payoutSettings.minimumAmount}
                              onChange={(e) => updatePayoutSetting("minimumAmount", Number.parseInt(e.target.value))}
                              min={0}
                              className="bg-[#2A2A30] border-[#3A3A40] text-white"
                            />
                            <p className="text-xs text-gray-500">
                              Minimum amount required before commission is paid out
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="payout-frequency" className="text-gray-400">
                              Payout Frequency
                            </Label>
                            <Select
                              value={settings.payoutSettings.frequency}
                              onValueChange={(value) => updatePayoutSetting("frequency", value)}
                            >
                              <SelectTrigger id="payout-frequency" className="bg-[#2A2A30] border-[#3A3A40] text-white">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1F1F23] border-[#2A2A30] text-white">
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">How often commissions are paid out</p>
                          </div>
                        </div>
                      </StaggerItem>

                      <Separator className="my-6 bg-[#2A2A30]" />

                      <StaggerItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="processing-days" className="text-gray-400">
                              Processing Days
                            </Label>
                            <Input
                              id="processing-days"
                              type="number"
                              value={settings.payoutSettings.processingDays}
                              onChange={(e) => updatePayoutSetting("processingDays", Number.parseInt(e.target.value))}
                              min={0}
                              max={30}
                              className="bg-[#2A2A30] border-[#3A3A40] text-white"
                            />
                            <p className="text-xs text-gray-500">
                              Number of days to process payouts after the end of the period
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="auto-approve" className="text-gray-400">
                                Auto-approve Commissions
                              </Label>
                              <Switch
                                id="auto-approve"
                                checked={settings.payoutSettings.autoApprove}
                                onCheckedChange={(checked) => updatePayoutSetting("autoApprove", checked)}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Automatically approve commissions without manual review
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                    </div>
                  </CardContent>
                </Card>
              </StaggerChildren>
            </TabsContent>

            <TabsContent value="program" className="mt-4">
              <StaggerChildren>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                  <CardHeader>
                    <CardTitle className="text-white">Program Settings</CardTitle>
                    <CardDescription>Configure general settings for the referral program</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <StaggerItem>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="program-enabled" className="text-white font-medium">
                              Enable Referral Program
                            </Label>
                            <p className="text-sm text-gray-400">Turn the entire referral program on or off</p>
                          </div>
                          <Switch
                            id="program-enabled"
                            checked={settings.programSettings.enabled}
                            onCheckedChange={(checked) => updateProgramSetting("enabled", checked)}
                          />
                        </div>
                      </StaggerItem>

                      <Separator className="my-6 bg-[#2A2A30]" />

                      <StaggerItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="multi-level" className="text-gray-400">
                                Allow Multi-level Referrals
                              </Label>
                              <Switch
                                id="multi-level"
                                checked={settings.programSettings.allowMultiLevel}
                                onCheckedChange={(checked) => updateProgramSetting("allowMultiLevel", checked)}
                              />
                            </div>
                            <p className="text-xs text-gray-500">Allow agents to earn from sub-referrals</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="max-depth" className="text-gray-400">
                              Maximum Referral Depth
                            </Label>
                            <Input
                              id="max-depth"
                              type="number"
                              value={settings.programSettings.maxReferralDepth}
                              onChange={(e) =>
                                updateProgramSetting("maxReferralDepth", Number.parseInt(e.target.value))
                              }
                              min={1}
                              max={5}
                              disabled={!settings.programSettings.allowMultiLevel}
                              className="bg-[#2A2A30] border-[#3A3A40] text-white"
                            />
                            <p className="text-xs text-gray-500">
                              Maximum levels of sub-referrals (if multi-level is enabled)
                            </p>
                          </div>
                        </div>
                      </StaggerItem>

                      <Separator className="my-6 bg-[#2A2A30]" />

                      <StaggerItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="link-expiry" className="text-gray-400">
                              Referral Link Expiry (Days)
                            </Label>
                            <Input
                              id="link-expiry"
                              type="number"
                              value={settings.programSettings.referralLinkExpiry}
                              onChange={(e) =>
                                updateProgramSetting("referralLinkExpiry", Number.parseInt(e.target.value))
                              }
                              min={0}
                              className="bg-[#2A2A30] border-[#3A3A40] text-white"
                            />
                            <p className="text-xs text-gray-500">
                              Number of days before a referral link expires (0 for never)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="require-verification" className="text-gray-400">
                                Require Verification
                              </Label>
                              <Switch
                                id="require-verification"
                                checked={settings.programSettings.requireVerification}
                                onCheckedChange={(checked) => updateProgramSetting("requireVerification", checked)}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Require referred users to verify their account before commission is earned
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                    </div>
                  </CardContent>
                </Card>
              </StaggerChildren>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}

// Helper function to get color based on rank
function getRankColor(rank: string): string {
  switch (rank) {
    case "Bronze":
      return "yellow"
    case "Silver":
      return "blue"
    case "Gold":
      return "yellow"
    case "Platinum":
      return "purple"
    default:
      return "blue"
  }
}
