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
  ChevronRight,
  Award,
  Sparkles,
  Zap,
  Target,
  Globe,
  Shield,
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
          bg: "bg-amber-100 dark:bg-amber-950",
          text: "text-amber-800 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          badge: "bg-amber-500 hover:bg-amber-600",
        };
      case AgentRank.SILVER:
        return {
          bg: "bg-slate-200 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-300 dark:border-slate-700",
          badge: "bg-slate-400 hover:bg-slate-500",
        };
      case AgentRank.GOLD:
        return {
          bg: "bg-yellow-100 dark:bg-yellow-950",
          text: "text-yellow-800 dark:text-yellow-300",
          border: "border-yellow-200 dark:border-yellow-800",
          badge: "bg-yellow-500 hover:bg-yellow-600",
        };
      case AgentRank.PLATINUM:
        return {
          bg: "bg-cyan-100 dark:bg-cyan-950",
          text: "text-cyan-800 dark:text-cyan-300",
          border: "border-cyan-200 dark:border-cyan-800",
          badge: "bg-cyan-500 hover:bg-cyan-600",
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          badge: "bg-slate-400 hover:bg-slate-500",
        };
    }
  };

  // Enhanced stats data with better design
  const statsData = [
    {
      title: "Total Referrals",
      value: stats?.totalReferrals.toString() || "0",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient:
        "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      trend: "+12%",
      trendUp: true,
      description: "Total users referred",
    },
    {
      title: "Active Referrals",
      value: stats?.activeReferrals.toString() || "0",
      icon: Zap,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient:
        "from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      trend: "+8%",
      trendUp: true,
      description: "Currently active users",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      icon: Target,
      gradient: "from-amber-500 to-orange-500",
      bgGradient:
        "from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      trend: "+5%",
      trendUp: true,
      description: "Signup to active ratio",
    },
    {
      title: "Total Earnings",
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: Gem,
      gradient: "from-purple-500 to-pink-500",
      bgGradient:
        "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      trend: "+15%",
      trendUp: true,
      description: "Lifetime commission earned",
    },
  ];

  if (isLoading && referrals.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Loading your referrals
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col space-y-8">
              {/* Enhanced Header */}
              <FadeIn>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-slate-800 dark:via-purple-800 dark:to-slate-800 p-8 md:p-12">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fillOpacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                          <Rocket className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                            Referral Hub
                          </h1>
                          <p className="text-lg text-slate-300 max-w-2xl">
                            Transform connections into commissions. Track,
                            manage, and optimize your referral network with
                            enterprise-grade tools.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        size="lg"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          const section =
                            document.getElementById("referral-links");
                          section?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <Share2 className="mr-2 h-5 w-5" />
                        Share Links
                      </Button>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          const section =
                            document.getElementById("referral-analytics");
                          section?.scrollIntoView({ behavior: "smooth" });
                          setActiveTab("analytics");
                        }}
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        View Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Keep the existing Agent Rank Progress Card unchanged */}
              {agentRankInfo && (
                <FadeIn>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                      <div className="flex items-center">
                        <div
                          className={`p-3 rounded-full mr-4 ${
                            getRankColors(agentRankInfo.currentRank).bg
                          }`}
                        >
                          <Award
                            className={`h-5 w-5 ${
                              getRankColors(agentRankInfo.currentRank).text
                            }`}
                          />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Agent Rank Progress
                            <Badge
                              className={`${
                                getRankColors(agentRankInfo.currentRank).badge
                              } text-white`}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {agentRankInfo.currentRank}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Your current rank and progress to the next level
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Current Rank
                            </span>
                            <span className="font-medium">
                              {agentRankInfo.currentRank}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Next Rank
                            </span>
                            <span className="font-medium">
                              {agentRankInfo.nextRank}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {agentRankInfo.progress}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Current Referrals
                            </span>
                            <span className="font-medium">
                              {agentRankInfo.currentReferrals}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Required for Next
                            </span>
                            <span className="font-medium">
                              {agentRankInfo.requiredReferrals}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
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

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium">
                                {agentRankInfo.currentRank}
                              </span>
                              <span className="font-medium">
                                {agentRankInfo.nextRank}
                              </span>
                            </div>
                            <Progress
                              value={agentRankInfo.progress}
                              className="h-3"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsData.map((stat, index) => (
                    <StaggerItem key={index}>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent"></div>
                          <CardContent className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className={`p-3 rounded-2xl ${stat.iconBg} backdrop-blur-sm`}
                              >
                                <stat.icon
                                  className={`h-6 w-6 ${stat.iconColor}`}
                                />
                              </div>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                {stat.trendUp ? (
                                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
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
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {stat.title}
                              </h3>
                              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                {stat.value}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
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
              <Card
                className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                id="referral-links"
              >
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Referral Command Center
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                        Deploy your referral arsenal and watch your network grow
                        exponentially
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-start gap-4">
                   
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground dark:text-blue-100 mb-2">
                          Your Unique Referral Code
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 px-2 py-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-mono text-lg font-semibold text-slate-700 dark:text-slate-300">
                            {referralCode}
                          </div>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm hover:shadow-sm transition-all duration-300 hover:scale-105"
                            onClick={() => {
                              navigator.clipboard.writeText(referralCode);
                              toast.success(
                                "Referral code copied to clipboard!"
                              );
                            }}
                          >
                            <Copy className="h-5 w-5 mr-2" />
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Buyer Referral Link */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
                            <UserPlus className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              Buyer Referral
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                              Earn{" "}
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                2% commission
                              </span>{" "}
                              on all purchases
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden shadow-sm">
                            <div className="flex-grow p-4 overflow-hidden">
                              <input
                                type="text"
                                value={`${
                                  typeof window !== "undefined"
                                    ? window.location.origin
                                    : ""
                                }/buyer/signup?ref=${referralCode}`}
                                className="bg-transparent border-none text-sm w-full focus:outline-none truncate text-slate-700 dark:text-slate-300"
                                readOnly
                              />
                            </div>
                            <div className="flex">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 border-l border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
                                    <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy buyer link</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 border-l border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
                                    <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 border border-purple-200/50 dark:border-purple-800/30 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                            <Crown className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              Agent Referral
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                              Earn{" "}
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                5% commission
                              </span>{" "}
                              on all sales
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden shadow-sm">
                            <div className="flex-grow p-4 overflow-hidden">
                              <input
                                type="text"
                                value={`${
                                  typeof window !== "undefined"
                                    ? window.location.origin
                                    : ""
                                }/agent/signup?ref=${referralCode}`}
                                className="bg-transparent border-none text-sm w-full focus:outline-none truncate text-slate-700 dark:text-slate-300"
                                readOnly
                              />
                            </div>
                            <div className="flex">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 border-l border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
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
                                    <Copy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy agent link</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 border-l border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
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
                                    <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                <CardFooter className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-t border-slate-200/50 dark:border-slate-700/50 px-8 py-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Need help with referrals?</p>
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm hover:underline"
                        >
                          View our comprehensive referral guide →
                        </a>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm hover:shadow-sm transition-all duration-300 hover:scale-105">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Advanced Analytics
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Enhanced Referrals Management */}
              <Card
                className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                id="referral-analytics"
              >
                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-sm">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Referral Management Suite
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                        Monitor, analyze, and optimize your entire referral
                        ecosystem
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Enhanced Filters and Search */}
                  <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        placeholder="Search referrals by name, email, or ID..."
                        className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 rounded-sm text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-48 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 rounded-sm">
                          <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-slate-400" />
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
                        <SelectTrigger className="w-48 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 rounded-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-slate-400" />
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
                    <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 mb-8">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm rounded-sm px-6 py-3 font-medium transition-all duration-200"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        All Referrals
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm rounded-sm px-6 py-3 font-medium transition-all duration-200"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Active
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm rounded-sm px-6 py-3 font-medium transition-all duration-200"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </TabsTrigger>
                      <TabsTrigger
                        value="analytics"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm rounded-sm px-6 py-3 font-medium transition-all duration-200"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      <div className="space-y-4">
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
                      <div className="space-y-4">
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
                      <div className="space-y-4">
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
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              Performance Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Conversion Rate
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                  {stats?.conversionRate || 0}%
                                </p>
                              </div>
                              <div className="p-4 rounded-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Avg. Earnings
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                  ₦2.4k
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Monthly Growth</span>
                                <span className="font-medium">+24%</span>
                              </div>
                              <Progress value={75} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              Goals & Targets
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="p-4 rounded-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  Monthly Target
                                </span>
                                <span className="text-sm font-medium">
                                  8/15
                                </span>
                              </div>
                              <Progress value={53} className="h-2" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm">This Month</span>
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  +8 referrals
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Next Rank</span>
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  2 more needed
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                {filteredReferrals.length > 0 && (
                  <CardFooter className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border-t border-slate-200/50 dark:border-slate-700/50 px-8 py-6">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-slate-600 dark:text-slate-400">
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
                          className="rounded-lg"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="rounded-lg"
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
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      icon: <CheckCircle className="h-4 w-4 mr-2" />,
      dot: "bg-emerald-500",
    },
    pending: {
      color:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
      icon: <Clock className="h-4 w-4 mr-2" />,
      dot: "bg-amber-500",
    },
    inactive: {
      color:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      icon: <AlertCircle className="h-4 w-4 mr-2" />,
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
      <Card className="border-0 shadow-sm hover:shadow-sm transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden group">
        <CardContent className="p-0">
          <div
            className="p-6 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-700 shadow-sm">
                    <AvatarImage
                      src={
                        referral.referred.avatar ||
                        `/placeholder.svg?height=56&width=56&query=user`
                      }
                      alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                    />
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                      statusConfig[referral.status].dot
                    }`}
                  ></div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {referral.referred.firstName} {referral.referred.lastName}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{referral.referred.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Badge
                  className={`${
                    statusConfig[referral.status].color
                  } px-3 py-1.5 font-medium`}
                >
                  {statusConfig[referral.status].icon}
                  <span className="capitalize">{referral.status}</span>
                </Badge>

                {referral.earnings > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Earnings
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(referral.earnings)}
                    </p>
                  </div>
                )}

                <div className="w-6 flex justify-center">
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
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
                className="border-t border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-sm bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        User Status
                      </h4>
                      <div className="space-y-3">
                        <Badge
                          className={`${
                            statusConfig[referral.status].color
                          } w-fit`}
                        >
                          {statusConfig[referral.status].icon}
                          <span className="capitalize">{referral.status}</span>
                        </Badge>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {referral.status === "active"
                            ? "User has made purchases and is actively engaged"
                            : referral.status === "pending"
                            ? "User has signed up but hasn't made any purchases yet"
                            : "User account is currently inactive"}
                        </p>
                        {referral.status === "active" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-500 dark:text-slate-400">
                                Activity Score
                              </span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                High (85%)
                              </span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-sm bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Referral Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Referral ID
                          </p>
                          <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                            {referral._id.substring(0, 12)}...
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Join Date
                          </p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Username
                            </p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              @{referral.referred.userName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-sm bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Commission Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Total Earned
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(referral.earnings)}
                          </p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">
                            Commission Rate
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
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
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center justify-center p-12">
        <div className="mb-8 p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm">
          <Users className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {message}
        </CardTitle>
        <CardDescription className="text-lg text-slate-600 dark:text-slate-400 text-center max-w-2xl mb-8">
          Invite your network to join our platform and start earning commissions
          on their transactions. Share your referral link to get started!
        </CardDescription>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm hover:shadow-sm transition-all duration-300 hover:scale-105"
          onClick={() => {
            const section = document.getElementById("referral-links");
            section?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share Referral Links
        </Button>
      </CardContent>
    </Card>
  );
}
