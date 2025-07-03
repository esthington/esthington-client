"use client"

import { useState, useEffect } from "react"
import { Save, Award, ArrowLeft } from "lucide-react"
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
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useReferrals, AgentRank } from "@/contexts/referrals-context"
import { apiConfig } from "@/lib/api"

// Updated settings interface to match new AgentRank enum
interface AdminReferralSettings {
  commissionRates: {
    [AgentRank.BASIC]: {
      investment: number
      property: number
    }
    [AgentRank.STAR]: {
      investment: number
      property: number
    }
    [AgentRank.LEADER]: {
      investment: number
      property: number
    }
    [AgentRank.MANAGER]: {
      investment: number
      property: number
    }
    [AgentRank.CHIEF]: {
      investment: number
      property: number
    }
    [AgentRank.AMBASSADOR]: {
      investment: number
      property: number
    }
  }
  rankThresholds: {
    [AgentRank.BASIC]: { min: number; max: number }
    [AgentRank.STAR]: { min: number; max: number }
    [AgentRank.LEADER]: { min: number; max: number }
    [AgentRank.MANAGER]: { min: number; max: number }
    [AgentRank.CHIEF]: { min: number; max: number }
    [AgentRank.AMBASSADOR]: { min: number; max: number }
  }
  payoutSettings: {
    minimumAmount: number
    frequency: string
    processingDays: number
    autoApprove: boolean
  }
  programSettings: {
    enabled: boolean
    allowMultiLevel: boolean
    maxReferralDepth: number
    referralLinkExpiry: number
    requireVerification: boolean
  }
}

// Updated initial settings with new AgentRank enum
const initialSettings: AdminReferralSettings = {
  commissionRates: {
    [AgentRank.BASIC]: {
      investment: 2.5,
      property: 1.0,
    },
    [AgentRank.STAR]: {
      investment: 3.5,
      property: 1.5,
    },
    [AgentRank.LEADER]: {
      investment: 5.0,
      property: 2.0,
    },
    [AgentRank.MANAGER]: {
      investment: 6.5,
      property: 2.5,
    },
    [AgentRank.CHIEF]: {
      investment: 8.0,
      property: 3.0,
    },
    [AgentRank.AMBASSADOR]: {
      investment: 10.0,
      property: 4.0,
    },
  },
  rankThresholds: {
    [AgentRank.BASIC]: { min: 0, max: 4 },
    [AgentRank.STAR]: { min: 5, max: 14 },
    [AgentRank.LEADER]: { min: 15, max: 29 },
    [AgentRank.MANAGER]: { min: 30, max: 49 },
    [AgentRank.CHIEF]: { min: 50, max: 99 },
    [AgentRank.AMBASSADOR]: { min: 100, max: Number.POSITIVE_INFINITY },
  },
  payoutSettings: {
    minimumAmount: 50,
    frequency: "monthly",
    processingDays: 3,
    autoApprove: true,
  },
  programSettings: {
    enabled: true,
    allowMultiLevel: true, // Enable multi-level since backend supports 3 levels
    maxReferralDepth: 3, // Updated to match backend 3-level system
    referralLinkExpiry: 0, // 0 means never expires
    requireVerification: true,
  },
}

export default function AdminReferralSettingsPage() {
  const { commissionRates, isLoading: contextLoading } = useReferrals()
  const [settings, setSettings] = useState(initialSettings)
  const [activeTab, setActiveTab] = useState("commission")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await apiConfig.get("/admin/referrals/settings", {
          withCredentials: true,
        })
        if (response.status === 200) {
          setSettings({ ...initialSettings, ...response.data.data })
        }
      } catch (error) {
        console.error("Error loading admin settings:", error)
        toast.error("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Update commission rates
  const updateCommissionRate = (rank: AgentRank, type: "investment" | "property", value: number) => {
    setSettings((prev) => ({
      ...prev,
      commissionRates: {
        ...prev.commissionRates,
        [rank]: {
          ...prev.commissionRates[rank],
          [type]: Number.parseFloat(value.toString()),
        },
      },
    }))
    setHasChanges(true)
  }

  // Update rank thresholds
  const updateRankThreshold = (rank: AgentRank, field: "min" | "max", value: number) => {
    setSettings((prev) => ({
      ...prev,
      rankThresholds: {
        ...prev.rankThresholds,
        [rank]: {
          ...prev.rankThresholds[rank],
          [field]: Number.parseInt(value.toString()),
        },
      },
    }))
    setHasChanges(true)
  }

  // Update payout settings
  const updatePayoutSetting = (field: keyof AdminReferralSettings["payoutSettings"], value: any) => {
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
  const updateProgramSetting = (field: keyof AdminReferralSettings["programSettings"], value: any) => {
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
      const response = await apiConfig.put("/admin/referrals/settings", settings, {
        withCredentials: true,
      })
      if (response.status === 200) {
        toast.success("Referral program settings saved successfully")
        setHasChanges(false)
      }
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Helper function to get color based on rank
  const getRankColor = (rank: AgentRank): string => {
    switch (rank) {
      case AgentRank.BASIC:
        return "slate"
      case AgentRank.STAR:
        return "amber"
      case AgentRank.LEADER:
        return "yellow"
      case AgentRank.MANAGER:
        return "cyan"
      case AgentRank.CHIEF:
        return "blue"
      case AgentRank.AMBASSADOR:
        return "purple"
      default:
        return "slate"
    }
  }

  if (isLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin settings...</p>
        </div>
      </div>
    )
  }

  return (
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
                <BreadcrumbLink href="/dashboard/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/admin/referrals">Referrals</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Referral Program Settings</h1>
              <p className="text-muted-foreground">Configure commission rates, rank thresholds, and program settings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/admin/referrals">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Referrals
                </Link>
              </Button>
              <Button
                onClick={saveSettings}
                disabled={!hasChanges || isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="commission" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Commission Rates
            </TabsTrigger>
            <TabsTrigger value="ranks" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Rank Thresholds
            </TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Payout Settings
            </TabsTrigger>
            <TabsTrigger value="program" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Program Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commission" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission Rates</CardTitle>
                <CardDescription>
                  Configure commission rates for different agent ranks and transaction types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(settings.commissionRates).map(([rank, rates]) => (
                    <div key={rank} className="space-y-4">
                      <div className="flex items-center">
                        <Award className={`h-5 w-5 mr-2 text-${getRankColor(rank as AgentRank)}-500`} />
                        <h3 className="text-lg font-medium">{rank} Rank</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor={`${rank}-investment`}>Investment Commission (%)</Label>
                            <span className="font-medium">{rates.investment}%</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Slider
                              id={`${rank}-investment`}
                              min={0}
                              max={15}
                              step={0.5}
                              value={[rates.investment]}
                              onValueChange={([value]) => updateCommissionRate(rank as AgentRank, "investment", value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={rates.investment}
                              onChange={(e) =>
                                updateCommissionRate(rank as AgentRank, "investment", Number.parseFloat(e.target.value))
                              }
                              min={0}
                              max={15}
                              step={0.5}
                              className="w-20"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor={`${rank}-property`}>Property Commission (%)</Label>
                            <span className="font-medium">{rates.property}%</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Slider
                              id={`${rank}-property`}
                              min={0}
                              max={10}
                              step={0.5}
                              value={[rates.property]}
                              onValueChange={([value]) => updateCommissionRate(rank as AgentRank, "property", value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={rates.property}
                              onChange={(e) =>
                                updateCommissionRate(rank as AgentRank, "property", Number.parseFloat(e.target.value))
                              }
                              min={0}
                              max={10}
                              step={0.5}
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>
                      {rank !== AgentRank.AMBASSADOR && <Separator className="my-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rank Thresholds</CardTitle>
                <CardDescription>Configure the number of referrals required to achieve each rank</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(settings.rankThresholds).map(([rank, threshold]) => (
                    <div key={rank} className="space-y-4">
                      <div className="flex items-center">
                        <Award className={`h-5 w-5 mr-2 text-${getRankColor(rank as AgentRank)}-500`} />
                        <h3 className="text-lg font-medium">{rank} Rank</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={`${rank}-min`}>Minimum Referrals</Label>
                          <Input
                            id={`${rank}-min`}
                            type="number"
                            value={threshold.min}
                            onChange={(e) =>
                              updateRankThreshold(rank as AgentRank, "min", Number.parseInt(e.target.value))
                            }
                            min={0}
                            disabled={rank === AgentRank.BASIC} // Basic always starts at 0
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${rank}-max`}>Maximum Referrals</Label>
                          <Input
                            id={`${rank}-max`}
                            type="number"
                            value={rank !== AgentRank.AMBASSADOR ? threshold.max : "∞"}
                            onChange={(e) =>
                              updateRankThreshold(rank as AgentRank, "max", Number.parseInt(e.target.value))
                            }
                            min={threshold.min + 1}
                            disabled={rank === AgentRank.AMBASSADOR} // Ambassador has no upper limit
                          />
                        </div>
                      </div>
                      {rank !== AgentRank.AMBASSADOR && <Separator className="my-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>Configure how and when referral commissions are paid out</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minimum-amount">Minimum Payout Amount ($)</Label>
                      <Input
                        id="minimum-amount"
                        type="number"
                        value={settings.payoutSettings.minimumAmount}
                        onChange={(e) => updatePayoutSetting("minimumAmount", Number.parseInt(e.target.value))}
                        min={0}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum amount required before commission is paid out
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payout-frequency">Payout Frequency</Label>
                      <Select
                        value={settings.payoutSettings.frequency}
                        onValueChange={(value) => updatePayoutSetting("frequency", value)}
                      >
                        <SelectTrigger id="payout-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">How often commissions are paid out</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="processing-days">Processing Days</Label>
                      <Input
                        id="processing-days"
                        type="number"
                        value={settings.payoutSettings.processingDays}
                        onChange={(e) => updatePayoutSetting("processingDays", Number.parseInt(e.target.value))}
                        min={0}
                        max={30}
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of days to process payouts after the end of the period
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-approve">Auto-approve Commissions</Label>
                        <Switch
                          id="auto-approve"
                          checked={settings.payoutSettings.autoApprove}
                          onCheckedChange={(checked) => updatePayoutSetting("autoApprove", checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically approve commissions without manual review
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="program" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Program Settings</CardTitle>
                <CardDescription>Configure general settings for the referral program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="program-enabled" className="font-medium">
                        Enable Referral Program
                      </Label>
                      <p className="text-sm text-muted-foreground">Turn the entire referral program on or off</p>
                    </div>
                    <Switch
                      id="program-enabled"
                      checked={settings.programSettings.enabled}
                      onCheckedChange={(checked) => updateProgramSetting("enabled", checked)}
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="multi-level">Allow Multi-level Referrals</Label>
                        <Switch
                          id="multi-level"
                          checked={settings.programSettings.allowMultiLevel}
                          onCheckedChange={(checked) => updateProgramSetting("allowMultiLevel", checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Allow agents to earn from sub-referrals (3 levels deep)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-depth">Maximum Referral Depth</Label>
                      <Input
                        id="max-depth"
                        type="number"
                        value={settings.programSettings.maxReferralDepth}
                        onChange={(e) => updateProgramSetting("maxReferralDepth", Number.parseInt(e.target.value))}
                        min={1}
                        max={3}
                        disabled={!settings.programSettings.allowMultiLevel}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum levels of sub-referrals (if multi-level is enabled)
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="link-expiry">Referral Link Expiry (Days)</Label>
                      <Input
                        id="link-expiry"
                        type="number"
                        value={settings.programSettings.referralLinkExpiry}
                        onChange={(e) => updateProgramSetting("referralLinkExpiry", Number.parseInt(e.target.value))}
                        min={0}
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of days before a referral link expires (0 for never)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-verification">Require Verification</Label>
                        <Switch
                          id="require-verification"
                          checked={settings.programSettings.requireVerification}
                          onCheckedChange={(checked) => updateProgramSetting("requireVerification", checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Require referred users to verify their account before commission is earned
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
