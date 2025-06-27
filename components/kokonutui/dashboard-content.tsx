"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CreditCard,
  Wallet,
  Users,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Filter,
  Download,
  Bell,
  Settings,
  Search,
  Star,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { apiConfig } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardStats {
  // Common stats
  totalTransactions?: number;
  pendingTransactions?: number;
  completedTransactions?: number;
  walletBalance?: number;
  availableBalance?: number;
  pendingBalance?: number;

  // Admin stats
  totalUsers?: number;
  activeUsers?: number;
  newUsersThisMonth?: number;
  userGrowthRate?: number;
  totalProperties?: number;
  availableProperties?: number;
  soldProperties?: number;
  featuredProperties?: number;
  totalInvestments?: number;
  activeInvestments?: number;
  featuredInvestments?: number;
  trendingInvestments?: number;
  totalPlatformRevenue?: number;
  monthlyPlatformRevenue?: number;
  totalCommissionsPaid?: number;
  totalInvestmentValue?: number;
  totalRaisedAmount?: number;
  totalInvestors?: number;
  averageROI?: number;
  totalReferrals?: number;
  totalReferralEarnings?: number;
  usersByRole?: Array<{ _id: string; count: number }>;
  transactionsByType?: Array<{ _id: string; count: number; volume: number }>;

  // Agent stats
  activeReferrals?: number;
  monthlyReferralEarnings?: number;
  level1Earnings?: number;
  level2Earnings?: number;
  level3Earnings?: number;
  totalCommissions?: number;
  paidCommissions?: number;
  pendingCommissions?: number;
  monthlyCommissions?: number;
  totalPlots?: number;
  soldPlots?: number;
  recentSales?: number;
  totalPropertyRevenue?: number;

  // Buyer stats
  totalInvested?: number;
  totalReturns?: number;
  expectedReturns?: number;
  monthlyReturns?: number;
  totalPropertyPurchases?: number;
  totalPropertySpent?: number;
  totalPlotsOwned?: number;
  recentPropertyPurchases?: number;
  monthlyPropertySpent?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  monthlyDeposits?: number;
  monthlyWithdrawals?: number;
  totalMarketplacePurchases?: number;
  totalMarketplaceSpent?: number;
  totalItemsPurchased?: number;
  monthlyMarketplacePurchases?: number;
  completedInvestments?: number;
}

interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  amount?: number;
  timestamp: string;
  status: string;
}

interface DashboardAnalytics {
  userGrowth?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  revenueGrowth?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  transactionVolume?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  commissionEarnings?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  referralGrowth?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  propertyRevenue?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  investmentGrowth?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  returnsReceived?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
  spendingPattern?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
    }>;
  };
}

export default function DashboardContentProfessional() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({});
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    fetchDashboardData();
  }, [user, dateRange]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsResponse, activitiesResponse, analyticsResponse] =
        await Promise.all([
          apiConfig.get(`/dashboard/stats?dateRange=${dateRange}`),
          apiConfig.get("/dashboard/activity?limit=15"),
          apiConfig.get(`/dashboard/analytics?dateRange=${dateRange}`),
        ]);

      setStats(statsResponse.data.data || {});
      setActivities(activitiesResponse.data.data || []);
      setAnalytics(analyticsResponse.data.data || {});
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (rate: number) => {
    return rate >= 0
      ? "text-emerald-600 dark:text-emerald-500"
      : "text-red-600 dark:text-red-500";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "investment":
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case "property_purchase":
        return <Building2 className="h-4 w-4 text-green-500" />;
      case "referral":
        return <Users className="h-4 w-4 text-orange-500" />;
      case "user_registration":
        return <Users className="h-4 w-4 text-indigo-500" />;
      case "property_listing":
        return <Building2 className="h-4 w-4 text-teal-500" />;
      case "investment_created":
        return <Target className="h-4 w-4 text-pink-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "pending":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "failed":
        return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "active":
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h3>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={() => fetchDashboardData()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced Admin Dashboard
  const renderAdminContent = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-base text-foreground">
            Platform Overview
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Monitor your platform's performance and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-border hover:bg-muted/50 bg-transparent"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Total Users
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats.totalUsers || 0)}
              </div>
              <div className="flex items-center text-sm">
                {getGrowthIcon(stats.userGrowthRate || 0)}
                <span
                  className={`ml-2 font-medium ${getGrowthColor(
                    stats.userGrowthRate || 0
                  )}`}
                >
                  {Math.abs(stats.userGrowthRate || 0)}%
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatNumber(stats.activeUsers || 0)} active users
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Platform Revenue
              </CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.totalPlatformRevenue || 0)}
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="ml-2 font-medium text-emerald-600">
                  {formatCurrency(stats.monthlyPlatformRevenue || 0)}
                </span>
                <span className="text-gray-500 ml-1">this month</span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatCurrency(stats.totalCommissionsPaid || 0)} in commissions
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Total Investments
              </CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats.totalInvestments || 0)}
              </div>
              <div className="flex items-center text-sm">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="ml-2 font-medium text-purple-600">
                  {formatCurrency(stats.totalInvestmentValue || 0)}
                </span>
                <span className="text-gray-500 ml-1">total value</span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatNumber(stats.activeInvestments || 0)} active •{" "}
                {stats.averageROI || 0}% avg ROI
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Properties
              </CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats.totalProperties || 0)}
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                <span className="ml-2 font-medium text-orange-600">
                  {formatNumber(stats.soldProperties || 0)} sold
                </span>
                <span className="text-gray-500 ml-1">
                  • {formatNumber(stats.availableProperties || 0)} available
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatNumber(stats.featuredProperties || 0)} featured listings
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-md  bg-neutral-50 dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Latest platform activities and transactions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {activities.slice(0, 6).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end space-y-1">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md  bg-neutral-50 dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Platform Insights
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Key performance indicators and metrics
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>User Analytics</DropdownMenuItem>
                  <DropdownMenuItem>Revenue Breakdown</DropdownMenuItem>
                  <DropdownMenuItem>Transaction Trends</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Total Investors
                  </span>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(stats.totalInvestors || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Active participants
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Funds Raised
                  </span>
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalRaisedAmount || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total capital
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Transaction Volume
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(stats.completedTransactions || 0)} completed
                </span>
              </div>
              <Progress
                value={
                  ((stats.completedTransactions || 0) /
                    (stats.totalTransactions || 1)) *
                  100
                }
                className="h-2"
              />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Property Sales
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(
                    ((stats.soldProperties || 0) /
                      (stats.totalProperties || 1)) *
                      100
                  )}
                  % sold
                </span>
              </div>
              <Progress
                value={
                  ((stats.soldProperties || 0) / (stats.totalProperties || 1)) *
                  100
                }
                className="h-2"
              />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Investment Completion
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(
                    ((stats.activeInvestments || 0) /
                      (stats.totalInvestments || 1)) *
                      100
                  )}
                  % active
                </span>
              </div>
              <Progress
                value={
                  ((stats.activeInvestments || 0) /
                    (stats.totalInvestments || 1)) *
                  100
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Enhanced Agent Dashboard
  const renderAgentContent = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-base text-foreground">
            Agent Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Track your properties, referrals, and earnings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-border hover:bg-muted/50 bg-transparent"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Wallet Balance
              </CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.walletBalance || 0)}
              </div>
              <div className="flex flex-row justify-between items-center mt-4 gap-1 w-full">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5 mr-0.5" />
                  Fund
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-gray-300 dark:bg-gray-500 py-2 border-gray-300"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  Send
                </Button>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatCurrency(stats.availableBalance || 0)} available
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                My Properties
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats.totalProperties || 0)}
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="ml-2 font-medium text-blue-600">
                  {formatNumber(stats.soldProperties || 0)} sold
                </span>
                <span className="text-gray-500 ml-1">
                  • {formatNumber(stats.availableProperties || 0)} available
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatCurrency(stats.totalPropertyRevenue || 0)} total revenue
              </div>
            </CardContent>
          </Card>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Referrals
              </CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats.totalReferrals || 0)}
              </div>
              <div className="flex items-center text-sm">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="ml-2 font-medium text-purple-600">
                  {formatNumber(stats.activeReferrals || 0)} active
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatCurrency(stats.totalReferralEarnings || 0)} total
                earnings
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Commissions
              </CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.totalCommissions || 0)}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="ml-2 font-medium text-orange-600">
                  {formatCurrency(stats.pendingCommissions || 0)} pending
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {formatCurrency(stats.monthlyCommissions || 0)} this month
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-md bg-neutral-50 dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Referral Breakdown
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Multi-level commission structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-card">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.level1Earnings || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Level 1
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  Direct referrals
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.level2Earnings || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Level 2
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  2nd tier
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.level3Earnings || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Level 3
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  3rd tier
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Monthly Earnings
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(stats.monthlyReferralEarnings || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Paid Commissions
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(stats.paidCommissions || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Commission Rate
                </span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  5% - 15%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-neutral-50 dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Your latest transactions and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {activities.slice(0, 6).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end space-y-1">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Enhanced Buyer Dashboard
  const renderBuyerContent = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-base text-foreground">
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Track your investments, properties, and returns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-border hover:bg-muted/50 bg-transparent"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-card">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Wallet Balance
              </CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {formatCurrency(stats.walletBalance || 0)}
              </div>
              <div className="flex flex-row justify-between items-center mt-4 gap-1 w-full">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5 mr-0.5" />
                  Fund
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-gray-300 dark:bg-gray-500 py-2 border-gray-300 "
                >
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  Send
                </Button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {formatCurrency(stats.availableBalance || 0)} available •{" "}
                {formatCurrency(stats.pendingBalance || 0)} pending
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-card bg-neutral-50 dark:bg-neutral-900">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                My Investments
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {formatNumber(stats.totalInvestments || 0)}
              </div>
              <div className="flex items-center text-sm">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="ml-2 font-medium text-blue-600">
                  {formatCurrency(stats.totalInvested || 0)}
                </span>
                <span className="text-muted-foreground ml-1">invested</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {formatNumber(stats.completedInvestments || 0)} completed •{" "}
                {formatNumber(
                  (stats.totalInvestments || 0) -
                    (stats.completedInvestments || 0)
                )}{" "}
                active
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-card bg-neutral-50 dark:bg-neutral-900">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Properties Owned
              </CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {formatNumber(stats.totalPlotsOwned || 0)}
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span className="ml-2 font-medium text-purple-600">
                  {formatNumber(stats.totalPropertyPurchases || 0)} purchases
                </span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {formatCurrency(stats.totalPropertySpent || 0)} total spent
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-md  bg-card bg-neutral-50 dark:bg-neutral-900">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Investment Returns
              </CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {formatCurrency(stats.totalReturns || 0)}
              </div>
              <div className="flex items-center text-sm">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="ml-2 font-medium text-orange-600">
                  {formatCurrency(stats.monthlyReturns || 0)}
                </span>
                <span className="text-muted-foreground ml-1">this month</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {formatCurrency(stats.expectedReturns || 0)} expected total
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-md bg-neutral-50 dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Portfolio Performance
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track your investment progress and returns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Total Invested
                  </span>
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalInvested || 0)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Returns Earned
                  </span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalReturns || 0)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Portfolio Progress
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {Math.round(
                    ((stats.totalReturns || 0) / (stats.expectedReturns || 1)) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  ((stats.totalReturns || 0) / (stats.expectedReturns || 1)) *
                  100
                }
                className="h-3"
              />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {Math.round(
                      ((stats.totalReturns || 0) / (stats.totalInvested || 1)) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {formatNumber(stats.totalInvestments || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {formatNumber(stats.completedInvestments || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-neutral-50 dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Your latest investment activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {activities.slice(0, 6).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end space-y-1">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render dashboard content based on user role
  const renderDashboardContent = () => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      return renderAdminContent();
    } else if (user?.role === "agent") {
      return renderAgentContent();
    } else {
      return renderBuyerContent();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome back, {user?.firstName}!
                </h2>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {renderDashboardContent()}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-md ">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md ">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
