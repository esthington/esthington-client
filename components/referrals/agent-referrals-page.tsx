"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Clock,
  ChevronDown,
  Copy,
  Share2,
  X,
  Filter,
  TrendingUp,
  BarChart3,
  Calendar,
  Mail,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  HelpCircle,
  Award,
  Sparkles,
  Zap,
  Target,
  Globe,
  Crown,
  Gem,
  Rocket,
  TrendingDown,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useReferrals, AgentRank } from "@/contexts/referrals-context";
import { useAuth } from "@/contexts/auth-context";
import PageTransition from "@/components/animations/page-transition";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AgentReferralsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const {
    referrals,
    stats,
    isLoading,
    error,
    getUserReferrals,
    getReferralStats,
    getAgentRankInfo,
    agentRankInfo,
  } = useReferrals();
  const { user } = useAuth();

  // Use the user's userName as the referral code
  const referralCode = user?.userName || "";

  // Smooth scroll utility function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter((referral) => {
      // Apply tab filter
      if (activeTab !== "all" && referral.status !== activeTab) return false;
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          referral.referred.firstName.toLowerCase().includes(query) ||
          referral.referred.lastName.toLowerCase().includes(query) ||
          referral.referred.email.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((referral) => {
      // Apply status filter
      if (statusFilter === "all") return true;
      return referral.status === statusFilter;
    })
    .sort((a, b) => {
      // Apply date sorting
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Load referrals data
  useEffect(() => {
    getUserReferrals();
    getReferralStats();
    getAgentRankInfo();
  }, [getUserReferrals, getReferralStats, getAgentRankInfo]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get rank colors
  const getRankColors = (rank: AgentRank) => {
    switch (rank) {
      case AgentRank.BRONZE:
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          badge: "bg-amber-500 hover:bg-amber-600",
        };
      case AgentRank.SILVER:
        return {
          bg: "bg-slate-50 dark:bg-slate-800/20",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          badge: "bg-slate-400 hover:bg-slate-500",
        };
      case AgentRank.GOLD:
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          text: "text-yellow-700 dark:text-yellow-300",
          border: "border-yellow-200 dark:border-yellow-800",
          badge: "bg-yellow-500 hover:bg-yellow-600",
        };
      case AgentRank.PLATINUM:
        return {
          bg: "bg-cyan-50 dark:bg-cyan-950/20",
          text: "text-cyan-700 dark:text-cyan-300",
          border: "border-cyan-200 dark:border-cyan-800",
          badge: "bg-cyan-500 hover:bg-cyan-600",
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-800/20",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          badge: "bg-slate-400 hover:bg-slate-500",
        };
    }
  };

  // Enhanced stats data with clean design
  const statsData = [
    {
      title: "Total Referrals",
      value: stats?.totalReferrals.toString() || "0",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      trend: "+12%",
      trendUp: true,
      description: "Total users referred",
    },
    {
      title: "Active Referrals",
      value: stats?.activeReferrals.toString() || "0",
      icon: Zap,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/20",
      trend: "+8%",
      trendUp: true,
      description: "Currently active users",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      icon: Target,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
      trend: "+5%",
      trendUp: true,
      description: "Signup to active ratio",
    },
    {
      title: "Total Earnings",
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: Gem,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      trend: "+15%",
      trendUp: true,
      description: "Lifetime commission earned",
    },
  ];

  if (isLoading && referrals.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary animate-pulse"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary animate-ping opacity-20"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-base sm:text-lg font-semibold text-foreground">
              Loading your referrals
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Enhanced Header */}
              <FadeIn>
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10">
                          <Rocket className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl xl:text-5xl font-bold text-foreground mb-1 sm:mb-2">
                            Referral Hub
                          </h1>
                          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl">
                            Transform connections into commissions. Track,
                            manage, and optimize your referral network with
                            enterprise-grade tools.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="sm:size-default lg:size-lg transition-all duration-300 hover:scale-105 bg-transparent text-xs sm:text-sm"
                        onClick={() => scrollToSection("referral-links")}
                      >
                        <Share2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <span className="hidden xs:inline">Share Links</span>
                        <span className="xs:hidden">Share</span>
                      </Button>
                      <Button
                        size="sm"
                        className="sm:size-default lg:size-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                        onClick={() => {
                          scrollToSection("referral-analytics");
                          setActiveTab("analytics");
                        }}
                      >
                        <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <span className="hidden xs:inline">View Analytics</span>
                        <span className="xs:hidden">Analytics</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Agent Rank Progress Card */}
              {agentRankInfo && (
                <FadeIn>
                  <Card className="border-border" id="rank-progress">
                    <CardHeader className="bg-muted/50 border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                      <div className="flex items-center">
                        <div
                          className={`p-2 sm:p-3 rounded-full mr-3 sm:mr-4 ${
                            getRankColors(agentRankInfo.currentRank).bg
                          }`}
                        >
                          <Award
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${
                              getRankColors(agentRankInfo.currentRank).text
                            }`}
                          />
                        </div>
                        <div>
                          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
                            <span>Agent Rank Progress</span>
                            <Badge
                              className={`${
                                getRankColors(agentRankInfo.currentRank).badge
                              } text-white w-fit text-xs`}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {agentRankInfo.currentRank}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-1">
                            Your current rank and progress to the next level
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                            Current Status
                          </h4>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                Current Rank
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.currentRank}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                Next Rank
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.nextRank}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                            Referral Count
                          </h4>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                Current Referrals
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.currentReferrals}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                Required for Next
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.requiredReferrals}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">
                                Remaining
                              </span>
                              <span className="font-medium">
                                {Math.max(
                                  0,
                                  agentRankInfo.requiredReferrals -
                                    agentRankInfo.currentReferrals
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4 md:col-span-2 lg:col-span-1">
                          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">
                            Progress to Next Rank
                          </h4>
                          <div>
                            <div className="flex justify-between text-xs sm:text-sm mb-2">
                              <span className="font-medium">
                                {agentRankInfo.currentRank}
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.nextRank}
                              </span>
                            </div>
                            <Progress
                              value={agentRankInfo.progress}
                              className="h-2 sm:h-3"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {agentRankInfo.progress === 100
                                ? "Congratulations! You've reached the highest rank!"
                                : `${100 - agentRankInfo.progress}% to go!`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              {/* Enhanced Stats Cards */}
              <StaggerChildren>
                <div
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                  id="stats-overview"
                >
                  {statsData.map((stat, index) => (
                    <StaggerItem key={index}>
                      <motion.div
                        whileHover={{ y: -2, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="border-border hover:shadow-md transition-all duration-300">
                          <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                              <div
                                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.iconBg}`}
                              >
                                <stat.icon
                                  className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.iconColor}`}
                                />
                              </div>
                              <div className="flex items-center gap-1 text-xs sm:text-sm font-medium">
                                {stat.trendUp ? (
                                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                )}
                                <span
                                  className={
                                    stat.trendUp
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-600 dark:text-red-400"
                                  }
                                >
                                  {stat.trend}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                                {stat.title}
                              </h3>
                              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground truncate">
                                {stat.value}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stat.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerChildren>

              {/* Enhanced Referral Links Section */}
              <Card className="border-border" id="referral-links">
                <CardHeader className="bg-muted/50 border-b border-border px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-primary/10">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                        Referral Command Center
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        Deploy your referral arsenal and watch your network grow
                        exponentially
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                  <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2">
                          Your Unique Referral Code
                        </h4>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                          <div className="flex-1 px-2 sm:px-3 py-2 bg-background rounded-md sm:rounded-lg border border-border font-mono text-sm sm:text-base md:text-lg font-semibold text-foreground">
                            {referralCode}
                          </div>
                          <Button
                            size="sm"
                            className="sm:size-default lg:size-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(referralCode);
                              toast.success(
                                "Referral code copied to clipboard!"
                              );
                            }}
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Enhanced Buyer Referral Link */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 p-3 sm:p-4 md:p-6 border border-border hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative z-2">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-blue-500/10">
                            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                              Buyer Referral
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Earn{" "}
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                2% commission
                              </span>{" "}
                              on all purchases
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center bg-background border border-border rounded-md sm:rounded-lg overflow-hidden">
                            <div className="flex-grow p-2 sm:p-3 md:p-4 overflow-hidden">
                              <input
                                type="text"
                                value={`${
                                  typeof window !== "undefined"
                                    ? window.location.origin
                                    : ""
                                }/buyer/signup?ref=${referralCode}`}
                                className="bg-transparent border-none text-xs sm:text-sm w-full focus:outline-none truncate text-foreground"
                                readOnly
                              />
                            </div>
                            <div className="flex">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-l border-border hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${
                                          typeof window !== "undefined"
                                            ? window.location.origin
                                            : ""
                                        }/buyer/signup?ref=${referralCode}`
                                      );
                                      toast.success(
                                        "Buyer referral link copied!"
                                      );
                                    }}
                                  >
                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy buyer link</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-l border-border hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    onClick={() => {
                                      if (navigator.share) {
                                        navigator.share({
                                          title: "Join as a Buyer",
                                          text: "Sign up using my referral link and get started investing in properties!",
                                          url: `${
                                            typeof window !== "undefined"
                                              ? window.location.origin
                                              : ""
                                          }/buyer/signup?ref=${referralCode}`,
                                        });
                                      } else {
                                        navigator.clipboard.writeText(
                                          `${
                                            typeof window !== "undefined"
                                              ? window.location.origin
                                              : ""
                                          }/buyer/signup?ref=${referralCode}`
                                        );
                                        toast.success(
                                          "Buyer referral link copied!"
                                        );
                                      }
                                    }}
                                  >
                                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Share buyer link
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Agent Referral Link */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 p-3 sm:p-4 md:p-6 border border-border hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative z-2">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-purple-500/10">
                            <Crown className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                              Agent Referral
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Earn{" "}
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                5% commission
                              </span>{" "}
                              on all sales
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center bg-background border border-border rounded-md sm:rounded-lg overflow-hidden">
                            <div className="flex-grow p-2 sm:p-3 md:p-4 overflow-hidden">
                              <input
                                type="text"
                                value={`${
                                  typeof window !== "undefined"
                                    ? window.location.origin
                                    : ""
                                }/agent/signup?ref=${referralCode}`}
                                className="bg-transparent border-none text-xs sm:text-sm w-full focus:outline-none truncate text-foreground"
                                readOnly
                              />
                            </div>
                            <div className="flex">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-l border-border hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${
                                          typeof window !== "undefined"
                                            ? window.location.origin
                                            : ""
                                        }/agent/signup?ref=${referralCode}`
                                      );
                                      toast.success(
                                        "Agent referral link copied!"
                                      );
                                    }}
                                  >
                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy agent link</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-l border-border hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                    onClick={() => {
                                      if (navigator.share) {
                                        navigator.share({
                                          title: "Join as an Agent",
                                          text: "Sign up using my referral link and start selling properties!",
                                          url: `${
                                            typeof window !== "undefined"
                                              ? window.location.origin
                                              : ""
                                          }/agent/signup?ref=${referralCode}`,
                                        });
                                      } else {
                                        navigator.clipboard.writeText(
                                          `${
                                            typeof window !== "undefined"
                                              ? window.location.origin
                                              : ""
                                          }/agent/signup?ref=${referralCode}`
                                        );
                                        toast.success(
                                          "Agent referral link copied!"
                                        );
                                      }
                                    }}
                                  >
                                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Share agent link
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t border-border px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                      <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-primary/10">
                        <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">
                          Need help with referrals?
                        </p>
                        <a
                          href="#"
                          className="text-primary hover:text-primary/80 text-xs sm:text-sm hover:underline"
                        >
                          View our comprehensive referral guide →
                        </a>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="sm:size-default transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                      onClick={() => scrollToSection("referral-analytics")}
                    >
                      <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      Advanced Analytics
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Enhanced Referrals Management */}
              <Card className="border-border" id="referral-analytics">
                <CardHeader className="bg-muted/50 border-b border-border px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-primary/10">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                        Referral Management Suite
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        Monitor, analyze, and optimize your entire referral
                        ecosystem
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                  {/* Enhanced Filters and Search */}
                  <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 md:pl-4 flex items-center pointer-events-none">
                        <Search className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder="Search referrals by name, email, or ID..."
                        className="pl-8 sm:pl-10 md:pl-12 h-10 sm:h-11 md:h-12 bg-background border-border rounded-md sm:rounded-lg text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          className="absolute inset-y-0 right-0 pr-2 sm:pr-3 md:pr-4 flex items-center"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] h-10 sm:h-11 md:h-12 bg-background border-border rounded-md sm:rounded-lg text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Filter className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Filter by status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={dateSort} onValueChange={setDateSort}>
                        <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] h-10 sm:h-11 md:h-12 bg-background border-border rounded-md sm:rounded-lg text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Sort by date" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Enhanced Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="relative mb-4 sm:mb-6 md:mb-8">
                      <TabsList className="bg-muted p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-border h-auto w-full lg:w-auto lg:grid lg:grid-cols-4 lg:gap-0.5 sm:gap-1">
                        {/* Mobile: Horizontal scroll container */}
                        <div className="flex lg:hidden overflow-x-auto scrollbar-hide gap-1 min-w-full">
                          <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px] whitespace-nowrap flex-shrink-0 min-w-[120px]"
                          >
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>All Referrals</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="active"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px] whitespace-nowrap flex-shrink-0 min-w-[100px]"
                          >
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Active</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="pending"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px] whitespace-nowrap flex-shrink-0 min-w-[100px]"
                          >
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Pending</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px] whitespace-nowrap flex-shrink-0 min-w-[110px]"
                          >
                            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Analytics</span>
                          </TabsTrigger>
                        </div>

                        {/* Desktop: Grid layout */}
                        <div className="hidden lg:contents">
                          <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px]"
                          >
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>All Referrals</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="active"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px]"
                          >
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Active</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="pending"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px]"
                          >
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Pending</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md sm:rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-h-[40px] sm:min-h-[44px]"
                          >
                            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Analytics</span>
                          </TabsTrigger>
                        </div>
                      </TabsList>

                      {/* Scroll indicator for mobile */}
                      <div className="lg:hidden flex justify-center mt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                        </div>
                      </div>
                    </div>

                    <TabsContent value="all" className="mt-0">
                      <div className="space-y-3 sm:space-y-4">
                        {filteredReferrals.length > 0 ? (
                          filteredReferrals.map((referral) => (
                            <EnhancedReferralCard
                              key={referral._id}
                              referral={referral}
                              isExpanded={expandedReferral === referral._id}
                              onToggle={() => {
                                if (expandedReferral === referral._id) {
                                  setExpandedReferral(null);
                                } else {
                                  setExpandedReferral(referral._id);
                                }
                              }}
                            />
                          ))
                        ) : (
                          <EnhancedEmptyState
                            message={
                              searchQuery
                                ? `No referrals found matching "${searchQuery}"`
                                : "No referrals found"
                            }
                          />
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="active" className="mt-0">
                      <div className="space-y-3 sm:space-y-4">
                        {filteredReferrals.filter((r) => r.status === "active")
                          .length > 0 ? (
                          filteredReferrals
                            .filter((r) => r.status === "active")
                            .map((referral) => (
                              <EnhancedReferralCard
                                key={referral._id}
                                referral={referral}
                                isExpanded={expandedReferral === referral._id}
                                onToggle={() => {
                                  if (expandedReferral === referral._id) {
                                    setExpandedReferral(null);
                                  } else {
                                    setExpandedReferral(referral._id);
                                  }
                                }}
                              />
                            ))
                        ) : (
                          <EnhancedEmptyState message="No active referrals found" />
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-0">
                      <div className="space-y-3 sm:space-y-4">
                        {filteredReferrals.filter((r) => r.status === "pending")
                          .length > 0 ? (
                          filteredReferrals
                            .filter((r) => r.status === "pending")
                            .map((referral) => (
                              <EnhancedReferralCard
                                key={referral._id}
                                referral={referral}
                                isExpanded={expandedReferral === referral._id}
                                onToggle={() => {
                                  if (expandedReferral === referral._id) {
                                    setExpandedReferral(null);
                                  } else {
                                    setExpandedReferral(referral._id);
                                  }
                                }}
                              />
                            ))
                        ) : (
                          <EnhancedEmptyState message="No pending referrals found" />
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                        <Card className="border-border">
                          <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                              <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-primary/10">
                                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              Performance Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div className="p-3 sm:p-4 rounded-md sm:rounded-lg bg-muted/50">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Conversion Rate
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-foreground">
                                  {stats?.conversionRate || 0}%
                                </p>
                              </div>
                              <div className="p-3 sm:p-4 rounded-md sm:rounded-lg bg-muted/50">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Total Earnings
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-foreground">
                                  {formatCurrency(stats?.totalEarnings || 0)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span>Active Referrals</span>
                                <span className="font-medium">
                                  {stats?.activeReferrals || 0}
                                </span>
                              </div>
                              <Progress
                                value={
                                  stats?.activeReferrals
                                    ? (stats.activeReferrals /
                                        (stats.totalReferrals || 1)) *
                                      100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-border">
                          <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                              <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-primary/10">
                                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              Referral Overview
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 sm:space-y-6">
                            <div className="p-3 sm:p-4 rounded-md sm:rounded-lg bg-muted/50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  Total Referrals
                                </span>
                                <span className="text-xs sm:text-sm font-medium">
                                  {stats?.totalReferrals || 0}
                                </span>
                              </div>
                              <Progress
                                value={
                                  stats?.totalReferrals
                                    ? Math.min(
                                        (stats.totalReferrals / 50) * 100,
                                        100
                                      )
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Active Users
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  {stats?.activeReferrals || 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm">
                                  Pending Users
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
                                  {(stats?.totalReferrals || 0) -
                                    (stats?.activeReferrals || 0)}
                                </span>
                              </div>
                              {agentRankInfo && (
                                <div className="flex justify-between">
                                  <span className="text-xs sm:text-sm">
                                    Next Rank Progress
                                  </span>
                                  <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {agentRankInfo.progress}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                {filteredReferrals.length > 0 && (
                  <CardFooter className="bg-muted/50 border-t border-border px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-4">
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        Showing{" "}
                        <span className="font-semibold">
                          {filteredReferrals.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">
                          {referrals.length}
                        </span>{" "}
                        referrals
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="rounded-md sm:rounded-lg bg-transparent text-xs"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="rounded-md sm:rounded-lg bg-transparent text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </TooltipProvider>
  );
}

// Enhanced Referral Card Component
interface EnhancedReferralCardProps {
  referral: {
    _id: string;
    referred: {
      firstName: string;
      lastName: string;
      userName?: string | undefined;
      email: string;
      avatar?: string;
    };
    createdAt: string;
    status: "active" | "pending" | "inactive";
    earnings: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

function EnhancedReferralCard({
  referral,
  isExpanded,
  onToggle,
}: EnhancedReferralCardProps) {
  const statusConfig = {
    active: {
      color:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
      icon: <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />,
      dot: "bg-emerald-500",
    },
    pending: {
      color:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
      icon: <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />,
      dot: "bg-amber-500",
    },
    inactive: {
      color:
        "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700",
      icon: <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />,
      dot: "bg-slate-400",
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="border-border hover:shadow-md transition-all duration-300 overflow-hidden group">
        <CardContent className="p-0">
          <div
            className="p-3 sm:p-4 md:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onToggle}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border-2 border-background shadow-sm">
                    <AvatarImage
                      src={
                        referral.referred.avatar ||
                        `/placeholder.svg?height=56&width=56&query=user` ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                    />
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background ${
                      statusConfig[referral.status].dot
                    }`}
                  ></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">
                    {referral.referred.firstName} {referral.referred.lastName}
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">
                      {referral.referred.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                <Badge
                  className={`${
                    statusConfig[referral.status].color
                  } px-2 sm:px-3 py-1 sm:py-1.5 font-medium flex-shrink-0 text-xs`}
                >
                  {statusConfig[referral.status].icon}
                  <span className="capitalize">{referral.status}</span>
                </Badge>
                {referral.earnings > 0 && (
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Earnings
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                      {formatCurrency(referral.earnings)}
                    </p>
                  </div>
                )}
                <div className="w-5 sm:w-6 flex justify-center">
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-border"
              >
                <div className="p-3 sm:p-4 md:p-6 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <div className="p-3 sm:p-4 rounded-md sm:rounded-lg bg-background border border-border">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 flex items-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        User Status
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <Badge
                          className={`${
                            statusConfig[referral.status].color
                          } w-fit text-xs`}
                        >
                          {statusConfig[referral.status].icon}
                          <span className="capitalize">{referral.status}</span>
                        </Badge>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {referral.status === "active"
                            ? "User has made purchases and is actively engaged"
                            : referral.status === "pending"
                            ? "User has signed up but hasn't made any purchases yet"
                            : "User account is currently inactive"}
                        </p>
                        {referral.status === "active" && (
                          <div className="mt-2 sm:mt-3">
                            <div className="flex justify-between text-xs mb-1 sm:mb-2">
                              <span className="text-muted-foreground">
                                Activity Score
                              </span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                High (85%)
                              </span>
                            </div>
                            <Progress value={85} className="h-1.5 sm:h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-md sm:rounded-lg bg-background border border-border">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 flex items-center">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Referral Details
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Referral ID
                          </p>
                          <p className="text-xs sm:text-sm font-mono text-foreground">
                            {referral._id.substring(0, 12)}...
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Join Date
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            {new Date(referral.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        {referral.referred.userName && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Username
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-foreground">
                              @{referral.referred.userName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-md sm:rounded-lg bg-background border border-border">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 flex items-center">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Commission Details
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Earned
                          </p>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                            {formatCurrency(referral.earnings)}
                          </p>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            Commission Rate
                          </span>
                          <span className="font-medium text-foreground">
                            {referral.status === "active" ? "2-5%" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Empty State Component
function EnhancedEmptyState({ message = "No referrals found" }) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 rounded-full bg-primary/10">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
        </div>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 text-center">
          {message}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base md:text-lg text-muted-foreground text-center max-w-2xl mb-4 sm:mb-6 md:mb-8">
          Invite your network to join our platform and start earning commissions
          on their transactions. Share your referral link to get started!
        </CardDescription>
        <Button
          size="sm"
          className="sm:size-default lg:size-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
          onClick={() => {
            const section = document.getElementById("referral-links");
            if (section) {
              const headerOffset = 80;
              const elementPosition = section.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }
          }}
        >
          <Share2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
          Share Referral Links
        </Button>
      </CardContent>
    </Card>
  );
}
