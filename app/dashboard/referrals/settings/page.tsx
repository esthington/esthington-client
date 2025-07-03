"use client"

import { useState, useEffect } from "react"
import {
  Save,
  ArrowLeft,
  Users,
  Award,
  LinkIcon,
  Shield,
  Zap,
  Info,
  AlertCircle,
  CheckCircle2,
  BarChart4,
  Percent,
  CreditCard,
  BadgePercent,
  Wallet,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReferrals, AgentRank } from "@/contexts/referrals-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { apiConfig } from "@/lib/api"
import { Separator } from "@/components/ui/separator"

// Define rank colors with proper branding - Updated for new AgentRank enum
const rankColors = {
  [AgentRank.BASIC]: {
    bg: "bg-slate-100 dark:bg-slate-950",
    text: "text-slate-800 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-800",
    badge: "bg-slate-500 hover:bg-slate-600",
    progress: "bg-slate-500",
  },
  [AgentRank.STAR]: {
    bg: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-500 hover:bg-amber-600",
    progress: "bg-amber-500",
  },
  [AgentRank.LEADER]: {
    bg: "bg-yellow-100 dark:bg-yellow-950",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    badge: "bg-yellow-500 hover:bg-yellow-600",
    progress: "bg-yellow-500",
  },
  [AgentRank.MANAGER]: {
    bg: "bg-cyan-100 dark:bg-cyan-950",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    badge: "bg-cyan-500 hover:bg-cyan-600",
    progress: "bg-cyan-500",
  },
  [AgentRank.CHIEF]: {
    bg: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500 hover:bg-blue-600",
    progress: "bg-blue-500",
  },
  [AgentRank.AMBASSADOR]: {
    bg: "bg-purple-100 dark:bg-purple-950",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-500 hover:bg-purple-600",
    progress: "bg-purple-500",
  },
}

// Updated interface to match new AgentRank enum
interface ReferralSettings {
  signupCommission: number
  investmentCommissionPercentage: number
  purchaseCommissionPercentage: number
  minimumPayoutAmount: number
  payoutFrequency: string
  referralLinkExpiry: number
  multiTierReferral: boolean
  autoApproval: boolean
  emailNotifications: boolean
  dashboardNotifications: boolean
  referralLinkPrefix: string
  maxReferralsPerUser: number
  cooldownPeriod: number
  rankThresholds: {
    [AgentRank.BASIC]: number
    [AgentRank.STAR]: number
    [AgentRank.LEADER]: number
    [AgentRank.MANAGER]: number
    [AgentRank.CHIEF]: number
    [AgentRank.AMBASSADOR]: number
  }
}

export default function ReferralSettingsPage() {
  const {
    commissionRates,
    isLoading: contextLoading,
    getReferralCommissionRates,
    getAgentRankInfo,
    agentRankInfo,
  } = useReferrals()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // Updated default settings with new AgentRank enum
  const defaultSettings: ReferralSettings = {
    signupCommission: 250,
    investmentCommissionPercentage: 5,
    purchaseCommissionPercentage: 2.5,
    minimumPayoutAmount: 1000,
    payoutFrequency: "monthly",
    referralLinkExpiry: 30,
    multiTierReferral: true, // Enable multi-tier by default since backend supports 3 levels
    autoApproval: true,
    emailNotifications: true,
    dashboardNotifications: true,
    referralLinkPrefix: "ref",
    maxReferralsPerUser: 100,
    cooldownPeriod: 0,
    rankThresholds: {
      [AgentRank.BASIC]: 0,
      [AgentRank.STAR]: 5,
      [AgentRank.LEADER]: 15,
      [AgentRank.MANAGER]: 30,
      [AgentRank.CHIEF]: 50,
      [AgentRank.AMBASSADOR]: 100,
    },
  }

  // Settings state
  const [currentSettings, setCurrentSettings] = useState<ReferralSettings>(defaultSettings)

  // Load initial data from API
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        // Load commission rates from context
        await getReferralCommissionRates()
        await getAgentRankInfo()

        // Fetch settings from API
        try {
          const response = await apiConfig.get("/referrals/settings", {
            withCredentials: true,
          })
          if (response.status === 200) {
            // Merge API settings with defaults for any missing properties
            const apiSettings = response.data.data
            setCurrentSettings({
              ...defaultSettings,
              ...apiSettings,
              // Ensure nested objects are properly merged
              rankThresholds: {
                ...defaultSettings.rankThresholds,
                ...(apiSettings.rankThresholds || {}),
              },
            })
          }
        } catch (err) {
          console.error("Error fetching referral settings:", err)
          // Fall back to defaults if API call fails
          setCurrentSettings(defaultSettings)
          toast.error("Failed to load settings, using defaults", {
            description: "You can still make changes and save them.",
          })
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setIsLoading(false)
        setInitialLoad(false)
      }
    }

    loadSettings()
  }, [getReferralCommissionRates, getAgentRankInfo])

  // Track changes
  useEffect(() => {
    if (!initialLoad) {
      setHasChanges(true)
    }
  }, [currentSettings, initialLoad])

  // Handle saving settings
  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    try {
      // Call API to update settings
      const response = await apiConfig.put(
        "/referrals/settings",
        { settings: currentSettings },
        { withCredentials: true },
      )

      if (response.status === 200) {
        toast.success("Settings saved successfully", {
          description: "Your referral program settings have been updated.",
          action: {
            label: "View Referrals",
            onClick: () => (window.location.href = "/dashboard/referrals"),
          },
        })
        setHasChanges(false)
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle resetting settings to defaults
  const handleResetDefaults = () => {
    setCurrentSettings(defaultSettings)
    setShowResetDialog(false)
    toast.success("Settings reset to defaults")
    setHasChanges(true)
  }

  // Update a specific setting
  const updateSetting = (key: string, value: any) => {
    setCurrentSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Update a nested setting
  const updateNestedSetting = (parent: string, key: string, value: any) => {
    setCurrentSettings((prev) => ({
      ...prev,
      [parent]: {
        ...((prev[parent as keyof ReferralSettings] as object) || {}),
        [key]: value,
      },
    }))
  }

  // Calculate commission rate for a rank - Updated to work with new structure
  const getCommissionRate = (rank: AgentRank, type: "investment" | "property" = "investment") => {
    if (commissionRates) {
      // Map ranks to levels for commission rates
      const rankToLevel = {
        [AgentRank.BASIC]: "level1",
        [AgentRank.STAR]: "level1",
        [AgentRank.LEADER]: "level2",
        [AgentRank.MANAGER]: "level2",
        [AgentRank.CHIEF]: "level3",
        [AgentRank.AMBASSADOR]: "level3",
      }

      const level = rankToLevel[rank] as keyof typeof commissionRates
      if (commissionRates[level] && commissionRates[level][type]) {
        return (commissionRates[level][type] * 100).toFixed(1) // Convert to percentage
      }
    }

    // Fallback values if context data isn't available
    const fallbackRates: Record<AgentRank, { investment: number; property: number }> = {
      [AgentRank.BASIC]: { investment: 2, property: 1 },
      [AgentRank.STAR]: { investment: 3, property: 1.5 },
      [AgentRank.LEADER]: { investment: 4, property: 2 },
      [AgentRank.MANAGER]: { investment: 5, property: 2.5 },
      [AgentRank.CHIEF]: { investment: 6, property: 3 },
      [AgentRank.AMBASSADOR]: { investment: 7, property: 3.5 },
    }

    return fallbackRates[rank][type]
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (isLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading referral settings...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/referrals">Referrals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold tracking-tight">Referral Program Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your referral program settings and commission structure
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/referrals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Referrals
              </Link>
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSubmitting || !hasChanges}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
            >
              {isSubmitting ? (
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

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mr-4">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Referral Program Status</h3>
                    <p className="text-sm text-muted-foreground">Your referral program is active and running</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {agentRankInfo && (
            <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${rankColors[agentRankInfo.currentRank].bg}`}>
                      <Award className={`h-5 w-5 ${rankColors[agentRankInfo.currentRank].text}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        Your Current Rank:{" "}
                        <span className="font-bold">
                          {agentRankInfo.currentRank}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {agentRankInfo.currentReferrals} of {agentRankInfo.requiredReferrals} referrals to{" "}
                        {agentRankInfo.nextRank
                          ? agentRankInfo.nextRank
                          : "Max Rank"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-1/3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{agentRankInfo.currentRank}</span>
                      <span className="font-medium">{agentRankInfo.nextRank || "Max"}</span>
                    </div>
                    <Progress value={agentRankInfo.progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="commissions" className="w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg mb-6">
            <TabsTrigger
              value="commissions"
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              <BadgePercent className="h-4 w-4 mr-2" />
              Commissions
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger
              value="tiers"
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
            >
              <Award className="h-4 w-4 mr-2" />
              Tiers & Ranks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                  <div className="flex items-center">
                    <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-full mr-3">
                      <Percent className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle>Commission Rates</CardTitle>
                      <CardDescription>Configure the commission rates for different actions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="signupCommission" className="flex items-center">
                        Signup Commission
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Fixed amount paid for each successful signup referral</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {formatCurrency(currentSettings.signupCommission)}
                      </Badge>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        id="signupCommission"
                        type="number"
                        value={currentSettings.signupCommission}
                        onChange={(e) => updateSetting("signupCommission", Number.parseFloat(e.target.value))}
                        className="pl-8 font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fixed amount paid for each successful signup referral
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="investmentCommission" className="flex items-center">
                        Investment Commission
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Percentage of investment amount paid as commission</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge
                        variant="outline"
                        className="font-mono bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                      >
                        {currentSettings.investmentCommissionPercentage}%
                      </Badge>
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <Slider
                        id="investmentCommission"
                        value={[currentSettings.investmentCommissionPercentage]}
                        max={10}
                        step={0.5}
                        onValueChange={(value) => updateSetting("investmentCommissionPercentage", value[0])}
                        className="flex-1"
                      />
                      <div className="relative w-20">
                        <Input
                          type="number"
                          value={currentSettings.investmentCommissionPercentage}
                          onChange={(e) =>
                            updateSetting("investmentCommissionPercentage", Number.parseFloat(e.target.value))
                          }
                          className="font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-6"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage of investment amount paid as commission</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="purchaseCommission" className="flex items-center">
                        Property Purchase Commission
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Percentage of purchase amount paid as commission</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge
                        variant="outline"
                        className="font-mono bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
                      >
                        {currentSettings.purchaseCommissionPercentage}%
                      </Badge>
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <Slider
                        id="purchaseCommission"
                        value={[currentSettings.purchaseCommissionPercentage]}
                        max={10}
                        step={0.5}
                        onValueChange={(value) => updateSetting("purchaseCommissionPercentage", value[0])}
                        className="flex-1"
                      />
                      <div className="relative w-20">
                        <Input
                          type="number"
                          value={currentSettings.purchaseCommissionPercentage}
                          onChange={(e) =>
                            updateSetting("purchaseCommissionPercentage", Number.parseFloat(e.target.value))
                          }
                          className="font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-6"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Percentage of property purchase amount paid as commission
                    </p>
                  </div>

                  <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
                    <div className="flex items-start">
                      <BarChart4 className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-violet-800 dark:text-violet-300">
                          Commission Insights
                        </h4>
                        <p className="text-xs text-violet-700 dark:text-violet-400 mt-1">
                          Based on your current settings, the average commission per referral is approximately{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              currentSettings.signupCommission +
                                1000 * (currentSettings.investmentCommissionPercentage / 100),
                            )}
                          </span>{" "}
                          assuming an average investment of ₦1,000.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                      <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle>Payout Settings</CardTitle>
                      <CardDescription>Configure when and how commissions are paid out</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="minimumPayout" className="flex items-center">
                        Minimum Payout Amount
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Minimum amount required before commission is paid out</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {formatCurrency(currentSettings.minimumPayoutAmount)}
                      </Badge>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        id="minimumPayout"
                        type="number"
                        value={currentSettings.minimumPayoutAmount}
                        onChange={(e) => updateSetting("minimumPayoutAmount", Number.parseFloat(e.target.value))}
                        className="pl-8 font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum amount required before commission is paid out
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <Label htmlFor="payoutFrequency" className="flex items-center">
                      Payout Frequency
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>How often commissions are paid out</TooltipContent>
                      </Tooltip>
                    </Label>
                    <Select
                      value={currentSettings.payoutFrequency}
                      onValueChange={(value) => updateSetting("payoutFrequency", value)}
                    >
                      <SelectTrigger
                        id="payoutFrequency"
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      >
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">How often commissions are paid out</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoApproval"
                          checked={currentSettings.autoApproval}
                          onCheckedChange={(checked) => updateSetting("autoApproval", checked)}
                        />
                        <Label htmlFor="autoApproval" className="flex items-center">
                          Auto-approve commissions
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              When enabled, commissions are automatically approved without manual review
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                      <Badge
                        variant={currentSettings.autoApproval ? "default" : "outline"}
                        className={
                          currentSettings.autoApproval
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {currentSettings.autoApproval ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, commissions are automatically approved without manual review
                    </p>
                    <div className="flex items-center justify-between space-x-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="emailNotifications"
                          checked={currentSettings.emailNotifications}
                          onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                        />
                        <Label htmlFor="emailNotifications">Email notifications for payouts</Label>
                      </div>
                      <Badge
                        variant={currentSettings.emailNotifications ? "default" : "outline"}
                        className={
                          currentSettings.emailNotifications
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {currentSettings.emailNotifications ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/20">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Payout Methods</h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                          Commissions are paid directly to your connected bank account or wallet. You can manage your
                          payout methods in your account settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                  <div className="flex items-center">
                    <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-full mr-3">
                      <LinkIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle>Referral Link Settings</CardTitle>
                      <CardDescription>Configure how referral links work</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="referralLinkPrefix" className="flex items-center">
                      Referral Link Prefix
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>The prefix used in referral links</TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="referralLinkPrefix"
                        value={currentSettings.referralLinkPrefix}
                        onChange={(e) => updateSetting("referralLinkPrefix", e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <span className="font-medium mr-1">Example:</span>
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                        yourdomain.com/{currentSettings.referralLinkPrefix}/USER_CODE
                      </code>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="referralLinkExpiry" className="flex items-center">
                        Referral Link Expiry
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Number of days before a referral link expires (0 for never)</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {currentSettings.referralLinkExpiry} days
                      </Badge>
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <Slider
                        id="referralLinkExpiry"
                        value={[currentSettings.referralLinkExpiry]}
                        max={90}
                        step={1}
                        onValueChange={(value) => updateSetting("referralLinkExpiry", value[0])}
                        className="flex-1"
                      />
                      <div className="relative w-24">
                        <Input
                          type="number"
                          value={currentSettings.referralLinkExpiry}
                          onChange={(e) => updateSetting("referralLinkExpiry", Number.parseInt(e.target.value))}
                          className="font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">days</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Number of days before a referral link expires (0 for never)
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="cooldownPeriod" className="flex items-center">
                        Cooldown Period
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Days before a user can generate a new referral link</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {currentSettings.cooldownPeriod} days
                      </Badge>
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <Slider
                        id="cooldownPeriod"
                        value={[currentSettings.cooldownPeriod]}
                        max={30}
                        step={1}
                        onValueChange={(value) => updateSetting("cooldownPeriod", value[0])}
                        className="flex-1"
                      />
                      <div className="relative w-24">
                        <Input
                          type="number"
                          value={currentSettings.cooldownPeriod}
                          onChange={(e) => updateSetting("cooldownPeriod", Number.parseInt(e.target.value))}
                          className="font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">days</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Days before a user can generate a new referral link (0 for no cooldown)
                    </p>
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/20">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Link Security</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          All referral links are cryptographically signed to prevent tampering and include tracking
                          parameters for accurate attribution.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                      <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle>Referral Program Rules</CardTitle>
                      <CardDescription>Configure the rules for your referral program</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="maxReferrals" className="flex items-center">
                        Maximum Referrals Per User
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Maximum number of referrals a user can have</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {currentSettings.maxReferralsPerUser}
                      </Badge>
                    </div>
                    <Input
                      id="maxReferrals"
                      type="number"
                      value={currentSettings.maxReferralsPerUser}
                      onChange={(e) => updateSetting("maxReferralsPerUser", Number.parseInt(e.target.value))}
                      className="font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of referrals a user can have (0 for unlimited)
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multiTierReferral"
                          checked={currentSettings.multiTierReferral}
                          onCheckedChange={(checked) => updateSetting("multiTierReferral", checked)}
                        />
                        <Label htmlFor="multiTierReferral" className="flex items-center">
                          Enable multi-tier referrals
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              When enabled, users can earn commissions from referrals made by their referrals (3 levels
                              deep)
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                      <Badge
                        variant={currentSettings.multiTierReferral ? "default" : "outline"}
                        className={
                          currentSettings.multiTierReferral
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {currentSettings.multiTierReferral ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, users can earn commissions from referrals made by their referrals (3 levels deep)
                    </p>
                    <div className="flex items-center justify-between space-x-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="dashboardNotifications"
                          checked={currentSettings.dashboardNotifications}
                          onCheckedChange={(checked) => updateSetting("dashboardNotifications", checked)}
                        />
                        <Label htmlFor="dashboardNotifications">Dashboard notifications</Label>
                      </div>
                      <Badge
                        variant={currentSettings.dashboardNotifications ? "default" : "outline"}
                        className={
                          currentSettings.dashboardNotifications
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {currentSettings.dashboardNotifications ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/20">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Fraud Prevention</h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                          Our system automatically detects and prevents fraudulent referrals using advanced algorithms
                          and IP tracking.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                      variant="default"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      View Referral Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tiers">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                <div className="flex items-center">
                  <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-full mr-3">
                    <Award className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <CardTitle>Agent Rank Tiers</CardTitle>
                    <CardDescription>Configure commission rates and thresholds for each agent rank</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Rank</TableHead>
                        <TableHead>Commission Rate (%)</TableHead>
                        <TableHead>Required Referrals</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(AgentRank).map((rank) => (
                        <TableRow key={rank}>
                          <TableCell>
                            <div className="flex items-center">
                              <div
                                className={`h-10 w-10 rounded-full ${rankColors[rank].bg} flex items-center justify-center mr-3`}
                              >
                                <Award className={`h-5 w-5 ${rankColors[rank].text}`} />
                              </div>
                              <div>
                                <span className="font-medium">{rank}</span>
                                <p className="text-xs text-muted-foreground">
                                  {rank === AgentRank.BASIC && "Entry Level"}
                                  {rank === AgentRank.STAR && "Rising Star"}
                                  {rank === AgentRank.LEADER && "Team Leader"}
                                  {rank === AgentRank.MANAGER && "Senior Manager"}
                                  {rank === AgentRank.CHIEF && "Chief Agent"}
                                  {rank === AgentRank.AMBASSADOR && "Elite Ambassador"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className="font-mono bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                                >
                                  {getCommissionRate(rank)}%
                                </Badge>
                                <span className="text-xs text-muted-foreground">Investment</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="font-mono bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
                                >
                                  {getCommissionRate(rank, "property")}%
                                </Badge>
                                <span className="text-xs text-muted-foreground">Property</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Input
                                type="number"
                                value={currentSettings.rankThresholds[rank]}
                                onChange={(e) =>
                                  updateNestedSetting("rankThresholds", rank, Number.parseInt(e.target.value))
                                }
                                className="w-20 h-9 font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                              />
                              <span className="text-xs text-muted-foreground">referrals</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={rankColors[rank].badge}>Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-medium">Tier Progression Visualization</h3>
                  <p className="text-sm text-muted-foreground">
                    Users will automatically progress through tiers as they reach the required number of successful
                    referrals.
                  </p>

                  <div className="space-y-8">
                    {Object.values(AgentRank).map((rank) => (
                      <div key={rank} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <div
                              className={`h-6 w-6 rounded-full ${rankColors[rank].bg} flex items-center justify-center mr-2`}
                            >
                              <Award className={`h-3 w-3 ${rankColors[rank].text}`} />
                            </div>
                            <span className="font-medium">{rank}</span>
                          </div>
                          <span>{currentSettings.rankThresholds[rank]}+ referrals</span>
                        </div>
                        <Progress value={100} className="h-2 bg-slate-200 dark:bg-slate-700">
                          <div className={`h-full ${rankColors[rank].progress}`} style={{ width: "100%" }} />
                        </Progress>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium">About Commission Rates</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Commission rates are set at the system level and cannot be modified here. Please contact your
                          account manager to discuss adjusting these rates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium">Your Current Progress</h4>
                    {agentRankInfo && (
                      <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 border-none">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {agentRankInfo.currentRank}
                      </Badge>
                    )}
                  </div>

                  {agentRankInfo && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {agentRankInfo.currentReferrals} of {agentRankInfo.requiredReferrals} referrals
                        </span>
                        <span>
                          {agentRankInfo.progress}% to{" "}
                          {agentRankInfo.nextRank
                            ? agentRankInfo.nextRank
                            : "Max Rank"}
                        </span>
                      </div>
                      <Progress value={agentRankInfo.progress} className="h-2 bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: `${agentRankInfo.progress}%` }}
                        />
                      </Progress>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setShowResetDialog(true)}>
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isSubmitting || !hasChanges}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
          >
            {isSubmitting ? (
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

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDefaults}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
