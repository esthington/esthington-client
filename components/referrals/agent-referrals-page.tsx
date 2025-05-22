"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  ArrowUpRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Building,
  Copy,
  Share2,
  Link,
  X,
  Filter,
  TrendingUp,
  Wallet,
  ExternalLink,
  BarChart3,
  Calendar,
  Mail,
  User,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle,
  FileText,
  HelpCircle,
  ChevronRight,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useReferrals } from "@/contexts/referrals-context";
import { useAuth } from "@/contexts/auth-context";
import PageTransition from "@/components/animations/page-transition";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
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
  }, [getUserReferrals, getReferralStats]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats data
  const statsData = [
    {
      title: "Total Referrals",
      value: stats?.totalReferrals.toString() || "0",
      icon: Users,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      title: "Active Referrals",
      value: stats?.activeReferrals.toString() || "0",
      icon: UserPlus,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      trend: "+8% from last month",
      trendUp: true,
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      icon: ArrowUpRight,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      trend: "+5% from last month",
      trendUp: true,
    },
    {
      title: "Total Earnings",
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: Wallet,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      trend: "+15% from last month",
      trendUp: true,
    },
  ];

  if (isLoading && referrals.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" className="text-purple-600" />
          <p className="text-muted-foreground animate-pulse">
            Loading your referrals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <PageTransition>
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex flex-col space-y-8">
            <FadeIn>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-neutral-800 dark:text-slate-100">
                    My Referrals
                  </h1>
                  <p className="text-muted-foreground">
                    Manage and track all your referrals in one place
                  </p>
                </div>
                <Button
                  className="bg-primary text-white shadow-md self-start"
                  onClick={() => {
                    const section = document.getElementById("referral-links");
                    section?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Referral Links
                </Button>
              </div>
            </FadeIn>

            {/* Stats Cards */}
            <StaggerChildren>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                  <StaggerItem key={index}>
                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardDescription
                          className={cn(
                            "flex items-center",
                            stat.color.split(" ")[1]
                          )}
                        >
                          <stat.icon className="inline-block mr-2 h-4 w-4" />
                          {stat.title}
                        </CardDescription>
                        <CardTitle className="text-3xl">{stat.value}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs flex items-center">
                          {stat.trendUp ? (
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          ) : (
                            <TrendingUp className="h-3 w-3 mr-1 text-red-500 transform rotate-180" />
                          )}
                          <span
                            className={
                              stat.trendUp ? "text-green-500" : "text-red-500"
                            }
                          >
                            {stat.trend}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            </StaggerChildren>

            {/* Referral Links Section */}
            <Card className="border shadow-md" id="referral-links">
              <CardHeader className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800 px-6">
                <div className="flex items-center">
                  <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full mr-3">
                    <Link className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <CardTitle>My Referral Links</CardTitle>
                    <CardDescription>
                      Share these links with potential users to earn commissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6 p-4 bg-blue-50 dark:bg-neutral-900 rounded-lg border border-blue-100 dark:border-blue-800/20">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Your Referral Code
                      </h4>
                      <div className="flex items-center mt-1">
                        <code className="bg-white dark:bg-neutral-800 px-3 py-1 rounded text-sm font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {referralCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-800"
                          onClick={() => {
                            navigator.clipboard.writeText(referralCode);
                            toast.success("Referral code copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Buyer Referral Link */}
                  <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Buyer Referral
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Earn 2% commission when buyers sign up and make
                          purchases
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                        <div className="flex-grow p-3 overflow-hidden">
                          <input
                            type="text"
                            value={`${
                              typeof window !== "undefined"
                                ? window.location.origin
                                : ""
                            }/buyer/signup?ref=${referralCode}`}
                            className="bg-transparent border-none text-sm w-full focus:outline-none truncate"
                            readOnly
                          />
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-none h-full border-l border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${
                                    typeof window !== "undefined"
                                      ? window.location.origin
                                      : ""
                                  }/buyer/signup?ref=${referralCode}`
                                );
                                toast.success(
                                  "Buyer referral link copied to clipboard!"
                                );
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy link</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-none h-full border-l border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
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
                                    "Buyer referral link copied to clipboard!"
                                  );
                                }
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Share link</TooltipContent>
                        </Tooltip>
                      </div>

                      {/* <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Buyer Referrals
                      </Button> */}
                    </div>
                  </div>

                  {/* Agent Referral Link */}
                  <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                        <Building className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Agent Referral
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Earn 5% commission when agents sign up and make sales
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                        <div className="flex-grow p-3 overflow-hidden">
                          <input
                            type="text"
                            value={`${
                              typeof window !== "undefined"
                                ? window.location.origin
                                : ""
                            }/agent/signup?ref=${referralCode}`}
                            className="bg-transparent border-none text-sm w-full focus:outline-none truncate"
                            readOnly
                          />
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-none h-full border-l border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${
                                    typeof window !== "undefined"
                                      ? window.location.origin
                                      : ""
                                  }/agent/signup?ref=${referralCode}`
                                );
                                toast.success(
                                  "Agent referral link copied to clipboard!"
                                );
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy link</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-none h-full border-l border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
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
                                    "Agent referral link copied to clipboard!"
                                  );
                                }
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Share link</TooltipContent>
                        </Tooltip>
                      </div>

                      {/* <Button
                        variant="outline"
                        className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Agent Referrals
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 px-6 py-4">
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Need help with referrals?{" "}
                    <a
                      href="#"
                      className="text-purple-600 hover:underline ml-1"
                    >
                      View our referral guide
                    </a>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Referrals Management */}
            <Card className="border shadow-md">
              <CardHeader className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800 px-6">
                <div className="flex items-center">
                  <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <CardTitle>Manage Referrals</CardTitle>
                    <CardDescription>
                      Track and manage all your referred users
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search referrals..."
                      className="pl-10 bg-white dark:bg-neutral-900 border-slate-200 dark:border-slate-700"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateSort} onValueChange={setDateSort}>
                      <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Sort by" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Referrals List */}
                <div className="space-y-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                      >
                        All Referrals
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                      >
                        Active
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                      >
                        Pending
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                      <div className="space-y-4">
                        {filteredReferrals.length > 0 ? (
                          filteredReferrals.map((referral) => (
                            <ReferralCard
                              key={referral._id}
                              referral={{
                                ...referral,
                                referred: {
                                  ...referral.referred,
                                  userName: referral.referred.userName ?? "",
                                },
                              }}
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
                          <EmptyState
                            message={
                              searchQuery
                                ? `No referrals found matching "${searchQuery}"`
                                : activeTab !== "all"
                                ? `No ${activeTab} referrals found`
                                : "No referrals found"
                            }
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
              {filteredReferrals.length > 0 && (
                <CardFooter className="bg-slate-50 dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 px-6 py-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredReferrals.length} of {referrals.length}{" "}
                      referrals
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="text-xs h-8"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="text-xs h-8"
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
      </PageTransition>
    </TooltipProvider>
  );
}

interface ReferralCardProps {
  referral: {
    _id: string;
    referred: {
      firstName: string;
      lastName: string;
      userName: string;
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

function ReferralCard({ referral, isExpanded, onToggle }: ReferralCardProps) {
  const statusColors = {
    active:
      "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    pending:
      "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    inactive:
      "bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-slate-700",
  };

  const statusIcons = {
    active: <CheckCircle className="h-3 w-3 mr-1" />,
    pending: <Clock className="h-3 w-3 mr-1" />,
    inactive: <AlertCircle className="h-3 w-3 mr-1" />,
  };

  // Format currency
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all overflow-hidden shadow-sm hover:shadow-md">
        <CardContent className="p-0">
          <div
            className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                  <AvatarImage
                    src={
                      referral.referred.avatar ||
                      `/placeholder.svg?height=40&width=40&query=user`
                    }
                    alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                  />
                  {/* <AvatarFallback className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {referral.referred.firstName[0]}
                    {referral.referred.lastName[0]}
                  </AvatarFallback> */}
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium">
                    {referral.referred.firstName} {referral.referred.lastName}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {referral.referred.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-sm">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center",
                    statusColors[referral.status]
                  )}
                >
                  {statusIcons[referral.status]}
                  <span className="capitalize">{referral.status}</span>
                </Badge>

                {referral.earnings > 0 && (
                  <div className="text-right flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {formatCurrency(referral.earnings)}
                    </p>
                  </div>
                )}

                <div className="w-6 flex justify-center">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4"
            >
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-neutral-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Status
                  </h4>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center mr-2",
                        statusColors[referral.status]
                      )}
                    >
                      {statusIcons[referral.status]}
                      <span className="capitalize">{referral.status}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {referral.status === "active"
                        ? "Has made purchases"
                        : referral.status === "pending"
                        ? "No purchases yet"
                        : "Account inactive"}
                    </span>
                  </div>

                  {referral.status === "active" && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Activity Level
                        </span>
                        <span className="font-medium">High</span>
                      </div>
                      <Progress value={85} className="h-1.5" />
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-neutral-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Referral Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Date Joined
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm">
                          {new Date(referral.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {referral.referred.userName && (
                      <div className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Username
                          </p>
                          <p className="text-sm font-medium">
                            @{referral.referred.userName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-neutral-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                    Earnings
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Current Earnings
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(referral.earnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {referral.status === "active"
                          ? "Commission earned"
                          : "Potential earnings"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-700"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact User
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-white"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ message = "No referrals found" }) {
  return (
    <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-transparent">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-slate-100 dark:bg-neutral-800 p-6 mb-4">
          <Users className="h-10 w-10 text-slate-400" />
        </div>
        <CardTitle className="text-xl mb-2">{message}</CardTitle>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Share your referral link with potential users to start earning
          commissions on their transactions.
        </p>
        <Button
          className="bg-primary text-white shadow-md"
          onClick={() => {
            const section = document.getElementById("referral-links");
            section?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Referral Links
        </Button>
      </CardContent>
    </Card>
  );
}
