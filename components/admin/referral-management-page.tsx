"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Settings,
  DollarSign,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Award,
  MoreHorizontal,
  Copy,
  LinkIcon,
  TrendingUp,
  Filter,
  Share2,
  ArrowUpRight,
  Sparkles,
  UserPlus,
  BarChart3,
  Wallet,
} from "lucide-react";
import PageTransition from "@/components/animations/page-transition";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useReferrals } from "@/contexts/referrals-context";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    media.addEventListener("change", listener);
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}

// Define the ReferralStatus enum directly in this file to avoid import issues
const ReferralStatus = {
  ACTIVE: "active",
  PENDING: "pending",
  INACTIVE: "inactive",
};

export default function ReferralManagementPage() {
  const {
    referrals,
    isLoading,
    stats,
    earnings,
    commissionRates,
    agentRankInfo,
    getUserReferrals,
    getReferralStats,
    generateReferralLink,
    getReferralEarnings,
    getReferralCommissionRates,
    getAgentRankInfo,
    processReferral,
    copyReferralLink,
  } = useReferrals();

  const isMobile = useMediaQuery("(max-width: 640px)");
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showReferralLinkDialog, setShowReferralLinkDialog] = useState(false);

  // Settings state (in a real app, this would be fetched from the API)
  const [currentSettings, setCurrentSettings] = useState({
    signupCommission: 250,
    investmentCommissionPercentage: 5,
    purchaseCommissionPercentage: 2.5,
    minimumPayoutAmount: 1000,
    payoutFrequency: "monthly",
    referralLinkExpiry: 30, // days
    multiTierReferral: false,
    autoApproval: true,
  });

  // Load data on component mount
  useEffect(() => {
    getUserReferrals();
    getReferralStats();
    getReferralEarnings();
    getReferralCommissionRates();
    getAgentRankInfo();
  }, [
    getUserReferrals,
    getReferralStats,
    getReferralEarnings,
    getReferralCommissionRates,
    getAgentRankInfo,
  ]);

  // Filter referrals based on search query, status, and type
  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      searchQuery === "" ||
      (referral.referrer.firstName + " " + referral.referrer.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (referral.referred.firstName + " " + referral.referred.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      referral._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || referral.status === statusFilter;

    // In a real app, you would have a type field in your referral model
    // For now, we'll just return true for type filtering
    const matchesType = true;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle approving a commission
  const handleApproveCommission = async () => {
    if (!selectedReferral) return;

    try {
      await processReferral(
        selectedReferral.referred._id,
        "investment", // You would determine the actual type based on the referral
        1000 // You would determine the actual amount based on the referral
      );

      toast.success(
        "Commission approved. The commission has been approved and paid."
      );

      setShowCommissionDialog(false);
      getUserReferrals(); // Refresh the referrals list
    } catch (error) {
      toast.error("Failed to process commission");
    }
  };

  // Handle rejecting a commission
  const handleRejectCommission = () => {
    // In a real app, this would make an API call to reject the commission
    toast.success("Commission rejected. The commission has been rejected.");
    setShowCommissionDialog(false);
  };

  // Handle saving settings
  const handleSaveSettings = () => {
    // In a real app, this would make an API call to update the settings
    toast.success(
      "Settings saved. Your referral program settings have been updated."
    );
    setShowSettingsDialog(false);
  };

  // Handle generating a new referral link
  const handleGenerateReferralLink = async () => {
    try {
      await generateReferralLink();
      setShowReferralLinkDialog(true);
    } catch (error) {
      toast.error("Failed to generate referral link");
    }
  };

  // Handle copying the referral link
  const handleCopyReferralLink = () => {
    copyReferralLink();
  };

  // Handle exporting data
  const handleExportData = () => {
    toast.success("Export started. Your data export has been initiated.");
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case ReferralStatus.ACTIVE:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
            Active
          </Badge>
        );
      case ReferralStatus.PENDING:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
            Pending
          </Badge>
        );
      case ReferralStatus.INACTIVE:
        return (
          <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">
            Inactive
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Render commission status badge
  const renderCommissionBadge = (paid: boolean) => {
    return paid ? (
      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
        Paid
      </Badge>
    ) : (
      <Badge variant="outline">Unpaid</Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (isLoading && !referrals.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Referral Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold tracking-tight">
              Referral Management
            </h1>
            <p className="text-muted-foreground">
              Manage referrals, commissions, and program settings
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateReferralLink}
              className="border-dashed"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral Link
            </Button>
            <Button
              variant="default"
              onClick={() => router.push("/dashboard/referrals/settings")}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Program Settings
            </Button>
          </div>
        </div>

        <StaggerChildren>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2 text-violet-500" />
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {stats?.totalReferrals || 0}
                    </div>
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                      <UserPlus className="h-5 w-5 text-violet-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">+12%</span>
                    <span className="ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Award className="h-4 w-4 mr-2 text-emerald-500" />
                    Active Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {stats?.activeReferrals || 0}
                    </div>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="flex justify-between items-center mb-1">
                      <span>Conversion Rate</span>
                      <span className="font-medium">
                        {stats?.conversionRate || 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats?.conversionRate || 0}
                      className="h-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Pending Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {formatCurrency(stats?.pendingEarnings || 0)}
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <Wallet className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center">
                    <span>
                      {
                        referrals.filter(
                          (r) => r.status === ReferralStatus.PENDING
                        ).length
                      }{" "}
                      pending referrals
                    </span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-indigo-500" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {formatCurrency(stats?.totalEarnings || 0)}
                    </div>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <BarChart3 className="h-5 w-5 text-indigo-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">+8.5%</span>
                    <span className="ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </StaggerChildren>

        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <TabsList className="mb-4 md:mb-0 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
              <TabsTrigger
                value="all"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
              >
                All Referrals
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
              >
                Pending Referrals
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search referrals..."
                  className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ReferralStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ReferralStatus.PENDING}>
                    Pending
                  </SelectItem>
                  <SelectItem value={ReferralStatus.INACTIVE}>
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle>All Referrals</CardTitle>
                    <CardDescription>
                      View and manage all referrals in the system
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="self-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Referred</TableHead>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[120px]">Earnings</TableHead>
                          <TableHead className="w-[80px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReferrals.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-3">
                                  <Users className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="font-medium mb-1">
                                  No referrals found
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  No referrals match your current filters
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReferrals.map((referral) => (
                            <TableRow key={referral._id} className="group">
                              <TableCell className="font-medium">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">
                                        {referral._id.substring(0, 8)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Full ID: {referral._id}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div className="flex items-center gap-3 cursor-pointer">
                                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                        <AvatarImage
                                          src={
                                            referral.referrer?.avatar ||
                                            "/placeholder.svg"
                                          }
                                          alt={`${referral.referrer.firstName} ${referral.referrer.lastName}`}
                                        />
                                        <AvatarFallback className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                          {referral.referrer.firstName?.[0]}
                                          {referral.referrer.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {referral.referrer.firstName}{" "}
                                          {referral.referrer.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {referral.referrer.email}
                                        </div>
                                      </div>
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="flex justify-between space-x-4">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={
                                            referral.referrer?.avatar ||
                                            "/placeholder.svg"
                                          }
                                          alt={`${referral.referrer.firstName} ${referral.referrer.lastName}`}
                                        />
                                        <AvatarFallback className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                          {referral.referrer.firstName?.[0]}
                                          {referral.referrer.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">
                                          {referral.referrer.firstName}{" "}
                                          {referral.referrer.lastName}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          {referral.referrer.email}
                                        </p>
                                        <div className="flex items-center pt-1">
                                          <span className="text-xs text-muted-foreground mr-2">
                                            Agent Rank:
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {referral.referrer.agentRank ||
                                              "Basic"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              <TableCell>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div className="flex items-center gap-3 cursor-pointer">
                                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                        <AvatarImage
                                          src={
                                            referral.referred?.avatar ||
                                            "/placeholder.svg"
                                          }
                                          alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                                        />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                          {referral.referred.firstName?.[0]}
                                          {referral.referred.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {referral.referred.firstName}{" "}
                                          {referral.referred.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {referral.referred.email}
                                        </div>
                                      </div>
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="flex justify-between space-x-4">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={
                                            referral.referred?.avatar ||
                                            "/placeholder.svg"
                                          }
                                          alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                                        />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                          {referral.referred.firstName?.[0]}
                                          {referral.referred.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">
                                          {referral.referred.firstName}{" "}
                                          {referral.referred.lastName}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          {referral.referred.email}
                                        </p>
                                        <div className="flex items-center pt-1">
                                          <span className="text-xs text-muted-foreground mr-2">
                                            Joined:
                                          </span>
                                          <span className="text-xs">
                                            {new Date(
                                              referral.createdAt
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  referral.createdAt
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {renderStatusBadge(referral.status)}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {formatCurrency(referral.earnings)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">
                                          Open menu
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-[180px]"
                                    >
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem asChild>
                                        <Link
                                          href={`/dashboard/referrals/${referral._id}`}
                                          className="flex items-center cursor-pointer"
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {referral.status ===
                                        ReferralStatus.PENDING && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedReferral(referral);
                                            setShowCommissionDialog(true);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <DollarSign className="h-4 w-4 mr-2" />
                                          Process Referral
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between py-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredReferrals.length} of {referrals.length}{" "}
                  referrals
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle>Pending Referrals</CardTitle>
                    <CardDescription>
                      Review and process pending referrals
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="self-start bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  >
                    {
                      referrals.filter(
                        (r) => r.status === ReferralStatus.PENDING
                      ).length
                    }{" "}
                    pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Referred</TableHead>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[120px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.filter(
                          (r) => r.status === ReferralStatus.PENDING
                        ).length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-3">
                                  <CheckCircle className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="font-medium mb-1">
                                  All caught up!
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  No pending referrals to process
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          referrals
                            .filter((r) => r.status === ReferralStatus.PENDING)
                            .map((referral) => (
                              <TableRow key={referral._id} className="group">
                                <TableCell className="font-medium">
                                  {referral._id.substring(0, 8)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                      <AvatarImage
                                        src={
                                          referral.referrer?.avatar ||
                                          "/placeholder.svg"
                                        }
                                        alt={`${referral.referrer.firstName} ${referral.referrer.lastName}`}
                                      />
                                      <AvatarFallback className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                        {referral.referrer.firstName?.[0]}
                                        {referral.referrer.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {referral.referrer.firstName}{" "}
                                        {referral.referrer.lastName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {referral.referrer.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                      <AvatarImage
                                        src={
                                          referral.referred?.avatar ||
                                          "/placeholder.svg"
                                        }
                                        alt={`${referral.referred.firstName} ${referral.referred.lastName}`}
                                      />
                                      <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        {referral.referred.firstName?.[0]}
                                        {referral.referred.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {referral.referred.firstName}{" "}
                                        {referral.referred.lastName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {referral.referred.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    referral.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        setSelectedReferral(referral);
                                        setShowCommissionDialog(true);
                                      }}
                                    >
                                      Process
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-8 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        setSelectedReferral(referral);
                                        setShowCommissionDialog(true);
                                      }}
                                    >
                                      <ArrowUpRight className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                  <CardTitle>Referral Performance</CardTitle>
                  <CardDescription>
                    Key metrics for your referral program
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Conversion Rate
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold">
                            {stats?.conversionRate || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${stats?.conversionRate || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {agentRankInfo && (
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">
                            Agent Rank Progress
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                          >
                            {agentRankInfo.currentRank}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Current:{" "}
                              <span className="font-medium">
                                {agentRankInfo.currentRank}
                              </span>
                            </span>
                            <span className="text-sm">
                              Next:{" "}
                              <span className="font-medium">
                                {agentRankInfo.nextRank}
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                              style={{ width: `${agentRankInfo.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground flex justify-between items-center">
                            <span>
                              {agentRankInfo.currentReferrals} of{" "}
                              {agentRankInfo.requiredReferrals} referrals needed
                            </span>
                            <span className="font-medium">
                              {agentRankInfo.progress}% complete
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div>
                      <h4 className="text-sm font-medium mb-4">
                        Monthly Performance
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">
                            New Referrals
                          </div>
                          <div className="text-lg font-bold">12</div>
                          <div className="text-xs text-emerald-500 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +20%
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">
                            Conversions
                          </div>
                          <div className="text-lg font-bold">8</div>
                          <div className="text-xs text-emerald-500 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +15%
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">
                            Revenue
                          </div>
                          <div className="text-lg font-bold">₦24k</div>
                          <div className="text-xs text-emerald-500 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +32%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Commission Rates</CardTitle>
                      <CardDescription>
                        Current commission rates by agent rank
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 border-none">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Your Rank
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {commissionRates ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/30">
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Rank</TableHead>
                            <TableHead>Investment Rate</TableHead>
                            <TableHead>Property Rate</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(commissionRates).map(
                            ([rank, rates], index) => (
                              <TableRow
                                key={rank}
                                className={
                                  agentRankInfo?.currentRank === rank
                                    ? "bg-violet-50/50 dark:bg-violet-900/10"
                                    : ""
                                }
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {index === 0 && (
                                      <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center">
                                        <Award className="h-3 w-3 text-zinc-500" />
                                      </div>
                                    )}
                                    {index === 1 && (
                                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                                        <Award className="h-3 w-3 text-slate-500" />
                                      </div>
                                    )}
                                    {index === 2 && (
                                      <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center">
                                        <Award className="h-3 w-3 text-amber-500" />
                                      </div>
                                    )}
                                    {index === 3 && (
                                      <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center">
                                        <Award className="h-3 w-3 text-violet-500" />
                                      </div>
                                    )}
                                    {rank}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                  >
                                    {rates.investment}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                  >
                                    {rates.property}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {agentRankInfo?.currentRank === rank ? (
                                    <Badge className="bg-violet-500">
                                      Current
                                    </Badge>
                                  ) : agentRankInfo?.nextRank === rank ? (
                                    <Badge variant="outline">Next</Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full">
                    <h4 className="text-sm font-medium mb-2">
                      How to increase your rank
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Refer more users to increase your agent rank and earn
                      higher commission rates.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                      onClick={handleGenerateReferralLink}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Your Referral Link
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Commission Processing Dialog */}
      <Dialog
        open={showCommissionDialog}
        onOpenChange={setShowCommissionDialog}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Process Referral</DialogTitle>
            <DialogDescription>
              Review and process this referral.
            </DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm">
                    <AvatarImage
                      src={
                        selectedReferral.referred?.avatar || "/placeholder.svg"
                      }
                      alt={`${selectedReferral.referred.firstName} ${selectedReferral.referred.lastName}`}
                    />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {selectedReferral.referred.firstName?.[0]}
                      {selectedReferral.referred.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold">
                      {selectedReferral.referred.firstName}{" "}
                      {selectedReferral.referred.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Referred by {selectedReferral.referrer.firstName}{" "}
                      {selectedReferral.referrer.lastName}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Referral ID
                    </Label>
                    <div className="font-medium">
                      {selectedReferral._id.substring(0, 8)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Date
                    </Label>
                    <div className="font-medium">
                      {new Date(
                        selectedReferral.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Status
                    </Label>
                    <div className="font-medium capitalize">
                      {renderStatusBadge(selectedReferral.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Current Earnings
                    </Label>
                    <div className="font-medium">
                      {formatCurrency(selectedReferral.earnings)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="commission-type">Commission Type</Label>
                  <Select defaultValue="investment">
                    <SelectTrigger id="commission-type">
                      <SelectValue placeholder="Select commission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">
                        Investment Commission
                      </SelectItem>
                      <SelectItem value="property">
                        Property Commission
                      </SelectItem>
                      <SelectItem value="signup">Signup Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Transaction Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₦
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1000"
                      className="pl-8"
                      defaultValue="1000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission will be calculated based on the agent's rank and
                    commission rate.
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add notes about this referral"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={handleRejectCommission}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApproveCommission}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Link Dialog */}
      <Dialog
        open={showReferralLinkDialog}
        onOpenChange={setShowReferralLinkDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Referral Link</DialogTitle>
            <DialogDescription>
              Share this link with others to earn commissions.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="referral-link" className="sr-only">
                  Referral Link
                </Label>
                <Input
                  id="referral-link"
                  defaultValue={stats?.referralLink || ""}
                  readOnly
                  className="bg-white dark:bg-slate-900"
                />
              </div>
              <Button
                size="sm"
                className="px-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                onClick={handleCopyReferralLink}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" size="sm" className="w-[48%]">
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" className="w-[48%]">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-lg border border-violet-100 dark:border-violet-800/20">
            <h4 className="text-sm font-medium text-violet-800 dark:text-violet-300 mb-1 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
              Referral Rewards
            </h4>
            <p className="text-sm text-violet-700 dark:text-violet-400">
              You'll earn up to{" "}
              {commissionRates?.[agentRankInfo?.currentRank || "Basic"]
                ?.investment || 5}
              % commission on investments and{" "}
              {commissionRates?.[agentRankInfo?.currentRank || "Basic"]
                ?.property || 2.5}
              % on property purchases.
            </p>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogDescription>
              This link will be used to track referrals you bring to the
              platform.
            </DialogDescription>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
