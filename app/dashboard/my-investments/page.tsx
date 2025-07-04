"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, MapPin, Percent, TrendingUp, Star, Target, Wallet, Calendar, Eye, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Image from "next/image"
import {
  useInvestment,
  type UserInvestmentType,
  type InvestmentDetailsType,
  type PropertyType,
  InvestmentStatus,
} from "@/contexts/investments-context"

// Animation components
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => {
  return (
    <div
      className={`animate-in fade-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: "0.5s",
      }}
    >
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
}

const StaggerContainer: React.FC<StaggerContainerProps> = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>
}

interface StaggerItemProps {
  children: React.ReactNode
  index?: number
  className?: string
}

const StaggerItem: React.FC<StaggerItemProps> = ({ children, index = 0, className = "" }) => {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 ${className}`}
      style={{
        animationDelay: `${index * 0.1}s`,
        animationDuration: "0.5s",
      }}
    >
      {children}
    </div>
  )
}

export default function MyInvestmentsPage() {
  const router = useRouter()
  const { userInvestments, fetchUserInvestments, isLoading } = useInvestment()

  useEffect(() => {
    fetchUserInvestments()
  }, [])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Calculate investment duration
  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? "s" : ""}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      if (remainingMonths === 0) {
        return `${years} year${years > 1 ? "s" : ""}`
      }
      return `${years}y ${remainingMonths}m`
    }
  }

  // Calculate next payout date based on payout frequency
  const calculateNextPayoutDate = (startDate: string, payoutFrequency: string): Date => {
    const start = new Date(startDate)
    const now = new Date()

    const nextPayout = new Date(start)

    switch (payoutFrequency?.toLowerCase()) {
      case "monthly":
        while (nextPayout <= now) {
          nextPayout.setMonth(nextPayout.getMonth() + 1)
        }
        break
      case "quarterly":
        while (nextPayout <= now) {
          nextPayout.setMonth(nextPayout.getMonth() + 3)
        }
        break
      case "annually":
        while (nextPayout <= now) {
          nextPayout.setFullYear(nextPayout.getFullYear() + 1)
        }
        break
      default:
        while (nextPayout <= now) {
          nextPayout.setMonth(nextPayout.getMonth() + 1)
        }
    }

    return nextPayout
  }

  const getStatusColor = (status: InvestmentStatus) => {
    switch (status) {
      case InvestmentStatus.ACTIVE:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      case InvestmentStatus.PENDING:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case InvestmentStatus.COMPLETED:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case InvestmentStatus.CANCELLED:
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case InvestmentStatus.DRAFT:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Calculate summary statistics
  const totalInvested = userInvestments.reduce((sum, investment) => sum + investment.amount, 0)
  const totalExpectedReturns = userInvestments.reduce((sum, investment) => sum + investment.expectedReturn, 0)
  const totalActualReturns = userInvestments.reduce((sum, investment) => sum + investment.actualReturn, 0)
  const activeInvestments = userInvestments.filter((inv) => inv.status === InvestmentStatus.ACTIVE).length

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              My Investments
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your real estate assets
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/investments")}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Explore Investments
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-xs">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">
                My Investments
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </FadeIn>

      {/* Investment Summary */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Invested
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      formatCurrency(totalInvested)
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background via-background to-emerald-500/5 border-emerald-500/10 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      activeInvestments
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background via-background to-purple-500/5 border-purple-500/10 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Expected
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      formatCurrency(totalExpectedReturns)
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background via-background to-orange-500/5 border-orange-500/10 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Returns
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      formatCurrency(totalActualReturns)
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
      <FadeIn delay={0.3}>
        <Card className="overflow-hidden border-none rounded-2xl bg-gradient-to-b from-background to-muted/20 shadow-sm dark:shadow-primary/5">
          <div className="py-8">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-8 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="active" className="rounded-lg px-6 py-3">
                  Active Investments
                </TabsTrigger>
                <TabsTrigger value="returns" className="rounded-lg px-6 py-3">
                  Returns & Payouts
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg px-6 py-3">
                  Investment History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <Skeleton className="h-48 md:h-32 md:w-48 flex-shrink-0" />
                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                              <Skeleton className="h-6 w-20" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : userInvestments.filter(
                    (investment) =>
                      investment.status === InvestmentStatus.ACTIVE
                  ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8 animate-pulse">
                      <TrendingUp className="h-16 w-16 text-primary/50" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      No active investments
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-8 text-lg">
                      You don't have any active investments yet. Explore our
                      marketplace to find lucrative investment opportunities.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/investments")}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-base hover:shadow-sm transition-all duration-300 px-8"
                    >
                      <TrendingUp className="mr-2 h-5 w-5" /> Browse Investment
                      Opportunities
                    </Button>
                  </div>
                ) : (
                  <StaggerContainer className="space-y-6">
                    {userInvestments
                      .filter(
                        (investment) =>
                          investment.status === InvestmentStatus.ACTIVE
                      )
                      .map((investment: UserInvestmentType, index) => {
                        const investmentDetails =
                          typeof investment.investmentId === "object"
                            ? (investment.investmentId as InvestmentDetailsType)
                            : null;

                        if (!investmentDetails) return null;

                        const propertyDetails =
                          typeof investmentDetails.propertyId === "object"
                            ? (investmentDetails.propertyId as PropertyType)
                            : null;

                        // Calculate next payout date and duration
                        const nextPayoutDate = calculateNextPayoutDate(
                          investment.startDate,
                          investmentDetails.payoutFrequency || "monthly"
                        );
                        const duration = calculateDuration(
                          investment.startDate,
                          investment.endDate
                        );

                        return (
                          <StaggerItem key={investment._id} index={index}>
                            <Card className="group overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 shadow-base hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/20">
                              {/* Mobile Layout (Column) */}
                              <div className="flex flex-col md:hidden">
                                <div className="relative h-48">
                                  <Image
                                    src={
                                      propertyDetails?.thumbnail ||
                                      "/placeholder.svg?height=192&width=400" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg"
                                    }
                                    alt={investmentDetails.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                  {/* Mobile - Always visible eye icon */}
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/investments/${
                                          typeof investment.investmentId ===
                                          "object"
                                            ? investment.investmentId._id
                                            : investment.investmentId || ""
                                        }`
                                      )
                                    }
                                    className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-base hover:bg-white transition-all duration-300"
                                  >
                                    <Eye className="h-5 w-5 text-gray-700" />
                                  </button>

                                  {/* Badges */}
                                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    <Badge
                                      className={getStatusColor(
                                        investment.status
                                      )}
                                    >
                                      {investment.status}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="bg-white/90 text-gray-700"
                                    >
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {propertyDetails?.location ||
                                        investmentDetails.location ||
                                        "Location"}
                                    </Badge>
                                  </div>

                                  {/* Featured badge */}
                                  {investmentDetails.featured && (
                                    <div className="absolute top-4 right-4">
                                      <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Star className="h-3 w-3 mr-1" />{" "}
                                        Featured
                                      </Badge>
                                    </div>
                                  )}
                                </div>

                                <div className="p-6">
                                  <div className="mb-4">
                                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                      {investmentDetails.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                          Started:{" "}
                                          {formatDate(investment.startDate)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Timer className="h-4 w-4" />
                                        <span>{duration}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stats Grid - Mobile */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/50 rounded-xl p-3">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <Wallet className="h-3 w-3" />
                                        Investment
                                      </div>
                                      <div className="text-lg font-bold text-foreground">
                                        {formatCurrency(investment.amount)}
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <Percent className="h-3 w-3" />
                                        Return Rate
                                      </div>
                                      <div className="text-lg font-bold text-foreground">
                                        {investmentDetails.returnRate}%
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <Clock className="h-3 w-3" />
                                        Next Payout
                                      </div>
                                      <div className="text-sm font-semibold text-foreground">
                                        {formatDate(
                                          nextPayoutDate.toISOString()
                                        )}
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <TrendingUp className="h-3 w-3" />
                                        Expected
                                      </div>
                                      <div className="text-lg font-bold text-foreground">
                                        {formatCurrency(
                                          investment.expectedReturn
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop/Tablet Layout (Row) */}
                              <div className="hidden md:flex">
                                <div className="relative w-64 flex-shrink-0">
                                  <div className="relative h-full min-h-[200px]">
                                    <Image
                                      src={
                                        propertyDetails?.thumbnail ||
                                        "/placeholder.svg?height=200&width=256" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt={investmentDetails.title}
                                      fill
                                      className="object-cover transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />

                                    {/* Desktop - Hover eye icon */}
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/investments/${
                                            typeof investment.investmentId ===
                                            "object"
                                              ? investment.investmentId._id
                                              : investment.investmentId || ""
                                          }`
                                        )
                                      }
                                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                                    >
                                      <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-all duration-300 hover:scale-110">
                                        <Eye className="h-6 w-6 text-gray-700" />
                                      </div>
                                    </button>

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                      <Badge
                                        className={getStatusColor(
                                          investment.status
                                        )}
                                      >
                                        {investment.status}
                                      </Badge>
                                      <Badge
                                        variant="secondary"
                                        className="bg-white/90 text-gray-700"
                                      >
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {propertyDetails?.location ||
                                          investmentDetails.location ||
                                          "Location"}
                                      </Badge>
                                    </div>

                                    {/* Featured badge */}
                                    {investmentDetails.featured && (
                                      <div className="absolute top-4 right-4">
                                        <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                          <Star className="h-3 w-3 mr-1" />{" "}
                                          Featured
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1 p-6">
                                  <div className="flex justify-between items-start mb-6">
                                    <div>
                                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {investmentDetails.title}
                                      </h3>
                                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          <span>
                                            Started:{" "}
                                            {formatDate(investment.startDate)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Timer className="h-4 w-4" />
                                          <span>Duration: {duration}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stats Grid - Desktop */}
                                  <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-muted/50 rounded-xl p-4">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Wallet className="h-3 w-3" />
                                        Your Investment
                                      </div>
                                      <div className="text-lg font-bold text-foreground">
                                        {formatCurrency(investment.amount)}
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Percent className="h-3 w-3" />
                                        Return Rate
                                      </div>
                                      <div className="text-lg font-bold text-foreground">
                                        {investmentDetails.returnRate}%
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Clock className="h-3 w-3" />
                                        Next Payout
                                      </div>
                                      <div className="text-lg font-semibold text-foreground">
                                        {formatDate(
                                          nextPayoutDate.toISOString()
                                        )}
                                      </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <TrendingUp className="h-3 w-3" />
                                        Expected Returns
                                      </div>
                                      <div className="text-lg font-bold text-foreground">
                                        {formatCurrency(
                                          investment.expectedReturn
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </StaggerItem>
                        );
                      })}
                  </StaggerContainer>
                )}
              </TabsContent>

              <TabsContent value="returns">
                <Card className="bg-gradient-to-b from-background to-muted/30 shadow-base border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl">
                      Returns & Payouts
                    </CardTitle>
                    <CardDescription className="text-base">
                      Track your investment returns and upcoming payouts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-5 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : userInvestments.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                          You don't have any active investments to generate
                          returns.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                                Investment
                              </th>
                              <th className="text-right py-4 px-6 font-semibold text-muted-foreground">
                                Amount Invested
                              </th>
                              <th className="text-right py-4 px-6 font-semibold text-muted-foreground">
                                Return Rate
                              </th>
                              <th className="text-right py-4 px-6 font-semibold text-muted-foreground">
                                Expected Returns
                              </th>
                              <th className="text-right py-4 px-6 font-semibold text-muted-foreground">
                                Actual Returns
                              </th>
                              <th className="text-right py-4 px-6 font-semibold text-muted-foreground">
                                Next Payout
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userInvestments.map(
                              (investment: UserInvestmentType) => {
                                const investmentDetails =
                                  typeof investment.investmentId === "object"
                                    ? (investment.investmentId as InvestmentDetailsType)
                                    : null;

                                if (!investmentDetails) return null;

                                const propertyDetails =
                                  typeof investmentDetails.propertyId ===
                                  "object"
                                    ? (investmentDetails.propertyId as PropertyType)
                                    : null;

                                const nextPayoutDate = calculateNextPayoutDate(
                                  investment.startDate,
                                  investmentDetails.payoutFrequency || "monthly"
                                );

                                return (
                                  <tr
                                    key={investment._id}
                                    className="border-b border-border hover:bg-muted/30 transition-colors"
                                  >
                                    <td className="py-4 px-6">
                                      <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden mr-4">
                                          <Image
                                            src={
                                              propertyDetails?.thumbnail ||
                                              "/placeholder.svg?height=48&width=48" ||
                                              "/placeholder.svg" ||
                                              "/placeholder.svg"
                                            }
                                            alt={investmentDetails.title}
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                          />
                                        </div>
                                        <div>
                                          <div className="font-semibold text-foreground text-base">
                                            {investmentDetails.title}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {propertyDetails?.location ||
                                              investmentDetails.location}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-right py-4 px-6 text-foreground font-semibold">
                                      {formatCurrency(investment.amount)}
                                    </td>
                                    <td className="text-right py-4 px-6 text-foreground font-semibold">
                                      {investmentDetails.returnRate}%
                                    </td>
                                    <td className="text-right py-4 px-6 text-foreground font-semibold">
                                      {formatCurrency(
                                        investment.expectedReturn
                                      )}
                                    </td>
                                    <td className="text-right py-4 px-6 text-foreground font-semibold">
                                      {formatCurrency(investment.actualReturn)}
                                    </td>
                                    <td className="text-right py-4 px-6 text-foreground font-semibold">
                                      {formatDate(nextPayoutDate.toISOString())}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="bg-gradient-to-b from-background to-muted/30 shadow-base border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl">
                      Investment History
                    </CardTitle>
                    <CardDescription className="text-base">
                      View your complete investment journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-8">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-start space-x-6 border-b border-border pb-8"
                          >
                            <Skeleton className="h-16 w-16 rounded-xl" />
                            <div className="space-y-3 flex-1">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <div className="flex space-x-6">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userInvestments.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                          You don't have any investment history yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {userInvestments.map(
                          (investment: UserInvestmentType) => {
                            const investmentDetails =
                              typeof investment.investmentId === "object"
                                ? (investment.investmentId as InvestmentDetailsType)
                                : null;

                            if (!investmentDetails) return null;

                            const propertyDetails =
                              typeof investmentDetails.propertyId === "object"
                                ? (investmentDetails.propertyId as PropertyType)
                                : null;

                            const duration = calculateDuration(
                              investment.startDate,
                              investment.endDate
                            );

                            return (
                              <div
                                key={investment._id}
                                className="flex items-start border-b border-border pb-8"
                              >
                                <div className="h-16 w-16 rounded-xl overflow-hidden mr-6">
                                  <Image
                                    src={
                                      propertyDetails?.thumbnail ||
                                      "/placeholder.svg?height=64&width=64" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg"
                                    }
                                    alt={investmentDetails.title}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                    <div className="font-semibold text-lg text-foreground">
                                      {investmentDetails.title}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge
                                        className={getStatusColor(
                                          investment.status
                                        )}
                                      >
                                        {investment.status}
                                      </Badge>
                                      <div className="text-sm text-muted-foreground">
                                        Invested:{" "}
                                        {formatDate(investment.startDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm">
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span className="text-foreground font-medium">
                                        {propertyDetails?.location ||
                                          investmentDetails.location}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span className="text-foreground font-medium">
                                        {duration}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span className="text-foreground font-medium">
                                        {investmentDetails.returnRate}% ROI
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground mr-2">
                                        Amount:
                                      </span>
                                      <span className="font-semibold text-foreground">
                                        {formatCurrency(investment.amount)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground mr-2">
                                        Expected:
                                      </span>
                                      <span className="font-semibold text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                          investment.expectedReturn
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
