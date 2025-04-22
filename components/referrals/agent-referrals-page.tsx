"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  DollarSign,
  Search,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Building,
  Copy,
  Share2,
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
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useReferrals } from "@/contexts/referrals-context";
import PageTransition from "@/components/animations/page-transition";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

export default function AgentReferralsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);

  const {
    referrals,
    stats,
    isLoading,
    error,
    getUserReferrals,
    getReferralStats,
  } = useReferrals();

  let referralCode = 58457683;

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter((referral) => {
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

  // Stats data
  const statsData = [
    {
      title: "Total Referrals",
      value: stats?.totalReferrals.toString() || "0",
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Referrals",
      value: stats?.activeReferrals.toString() || "0",
      icon: UserPlus,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      icon: ArrowUpRight,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Total Earnings",
      value: `$${stats?.totalEarnings.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "bg-secondary/10 text-secondary",
    },
  ];

  if (isLoading && referrals.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col space-y-8">
          <FadeIn>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                My Referrals
              </h1>
              <p className="text-gray-400">
                Manage and track all your referrals in one place
              </p>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          <StaggerChildren>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30] hover:border-primary/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">
                              {stat.title}
                            </p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                              {stat.value}
                            </h3>
                          </div>
                          <div className={cn("p-2 rounded-full", stat.color)}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerChildren>

          {/* Referral Links Section */}
          <div className="bg-[#1F1F23]/50 backdrop-blur-sm border border-[#2A2A30] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              My Referral Links
            </h2>
            <p className="text-gray-400 mb-6">
              Share these links with potential users to earn commissions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyer Referral Link */}
              <div className="bg-[#2A2A30]/50 rounded-lg p-4 border border-[#3A3A40]">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-500 mr-3">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    Buyer Referral
                  </h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Earn 2% commission when buyers sign up and make purchases
                </p>
                <div className="flex items-center bg-[#1F1F23] border border-[#3A3A40] rounded-md p-2 mb-4">
                  <input
                    type="text"
                    value={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/buyer/signup?ref=${referralCode || "YOUR_CODE"}`}
                    className="bg-transparent border-none text-gray-300 text-sm flex-grow focus:outline-none px-2"
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${
                          typeof window !== "undefined"
                            ? window.location.origin
                            : ""
                        }/buyer/signup?ref=${
                          referralCode || "YOUR_CODE"
                        }`
                      );
                      toast.success("Buyer referral link copied to clipboard!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Join as a Buyer",
                          text: "Sign up using my referral link and get started investing in properties!",
                          url: `${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                          }/buyer/signup?ref=${
                            referralCode || "YOUR_CODE"
                          }`,
                        });
                      } else {
                        navigator.clipboard.writeText(
                          `${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                          }/buyer/signup?ref=${
                            referralCode || "YOUR_CODE"
                          }`
                        );
                        toast.success(
                          "Buyer referral link copied to clipboard!"
                        );
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Agent Referral Link */}
              <div className="bg-[#2A2A30]/50 rounded-lg p-4 border border-[#3A3A40]">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                    <Building className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    Agent Referral
                  </h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Earn 5% commission when agents sign up and make sales
                </p>
                <div className="flex items-center bg-[#1F1F23] border border-[#3A3A40] rounded-md p-2 mb-4">
                  <input
                    type="text"
                    value={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/agent/signup?ref=${referralCode || "YOUR_CODE"}`}
                    className="bg-transparent border-none text-gray-300 text-sm flex-grow focus:outline-none px-2"
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${
                          typeof window !== "undefined"
                            ? window.location.origin
                            : ""
                        }/agent/signup?ref=${
                          referralCode || "YOUR_CODE"
                        }`
                      );
                      toast.success("Agent referral link copied to clipboard!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Join as an Agent",
                          text: "Sign up using my referral link and start selling properties!",
                          url: `${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                          }/agent/signup?ref=${
                            referralCode || "YOUR_CODE"
                          }`,
                        });
                      } else {
                        navigator.clipboard.writeText(
                          `${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                          }/agent/signup?ref=${
                          referralCode || "YOUR_CODE"
                          }`
                        );
                        toast.success(
                          "Agent referral link copied to clipboard!"
                        );
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search referrals..."
                className="pl-10 bg-[#1F1F23]/50 border-[#2A2A30] text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2A2A30] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2A2A30] text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateSort} onValueChange={setDateSort}>
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2A2A30] text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2A2A30] text-white">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Referrals List */}
          <div className="space-y-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-[#1F1F23]/50 border border-[#2A2A30] p-1 rounded-lg">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  All Referrals
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Pending
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-3">
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((referral) => (
                      <ReferralCard
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
                    <EmptyState />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="active" className="mt-4">
                <div className="space-y-3">
                  {filteredReferrals.filter((r) => r.status === "active")
                    .length > 0 ? (
                    filteredReferrals
                      .filter((r) => r.status === "active")
                      .map((referral) => (
                        <ReferralCard
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
                    <EmptyState message="No active referrals found" />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <div className="space-y-3">
                  {filteredReferrals.filter((r) => r.status === "pending")
                    .length > 0 ? (
                    filteredReferrals
                      .filter((r) => r.status === "pending")
                      .map((referral) => (
                        <ReferralCard
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
                    <EmptyState message="No pending referrals found" />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

interface ReferralCardProps {
  referral: {
    _id: string;
    referred: {
      firstName: string;
      lastName: string;
      email: string;
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
    active: "bg-green-500/20 text-green-500 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const statusIcons = {
    active: <BadgeCheck className="h-3 w-3 mr-1" />,
    pending: <Clock className="h-3 w-3 mr-1" />,
    inactive: <Users className="h-3 w-3 mr-1" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30] hover:border-primary/50 transition-all overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 border border-[#2A2A30]">
                  <AvatarImage
                    src={`/placeholder-40px-height.png?height=40&width=40`}
                    alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {referral.referred.firstName[0]}
                    {referral.referred.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {referral.referred.firstName} {referral.referred.lastName}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {referral.referred.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-sm text-white">
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
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Earnings</p>
                    <p className="text-sm font-medium text-secondary">
                      ${referral.earnings}
                    </p>
                  </div>
                )}

                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4 border-t border-[#2A2A30]"
            >
              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#2A2A30]/50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-400 mb-1">
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
                    <span className="text-xs text-gray-400">
                      {referral.status === "active"
                        ? "Has made purchases"
                        : referral.status === "pending"
                        ? "No purchases yet"
                        : "Account inactive"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#2A2A30]/50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-400 mb-1">
                    Referral Date
                  </h4>
                  <p className="text-sm text-white">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(referral.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="bg-[#2A2A30]/50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-400 mb-1">
                    Earnings
                  </h4>
                  <p className="text-sm text-white">
                    ${referral.earnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {referral.status === "active"
                      ? "Commission earned"
                      : "Potential earnings"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
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
    <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Users className="h-12 w-12 text-gray-500 mb-4" />
        <CardTitle className="text-xl mb-2 text-white">{message}</CardTitle>
        <p className="text-gray-400 text-center max-w-md mb-6">
          Share your referral link with potential users to start earning
          commissions on their transactions.
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          Go to My Referral Link
        </Button>
      </CardContent>
    </Card>
  );
}
