"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  BarChart3,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
  Zap,
  CircleDollarSign,
  LayoutDashboard,
  PiggyBank,
  CreditCardIcon,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedCard } from "@/components/ui/animated-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FadeIn from "@/components/animations/fade-in";
import { useWallet } from "@/contexts/wallet-context";
import { format } from "date-fns";

export default function MyWalletPage() {
  const router = useRouter();
  const {
    wallet,
    transactions,
    pendingTransactions,
    refreshWalletData,
    isLoading,
  } = useWallet();
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all-time");
  const [showBalanceAnimation, setShowBalanceAnimation] = useState(false);

  // Trigger balance animation on load
  useEffect(() => {
    if (!isLoading && wallet) {
      setShowBalanceAnimation(true);
    }
  }, [isLoading, wallet]);

  // Handle manual refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWalletData();
    setTimeout(() => setIsRefreshing(false), 1000); // Show spinner for at least 1 second
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy • h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  // Format date for grouping
  const formatDateForGrouping = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return format(date, "MMMM d, yyyy");
      }
    } catch (error) {
      return "Unknown Date";
    }
  };

  // Get transaction status icon and color
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          textColor: "text-emerald-700 dark:text-emerald-300",
          borderColor: "border-emerald-200 dark:border-emerald-800/50",
        };
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          textColor: "text-amber-700 dark:text-amber-300",
          borderColor: "border-amber-200 dark:border-amber-800/50",
        };
      case "failed":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "text-rose-500",
          bgColor: "bg-rose-50 dark:bg-rose-900/20",
          textColor: "text-rose-700 dark:text-rose-300",
          borderColor: "border-rose-200 dark:border-rose-800/50",
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "text-slate-500",
          bgColor: "bg-slate-100 dark:bg-slate-800",
          textColor: "text-slate-700 dark:text-slate-300",
          borderColor: "border-slate-200 dark:border-slate-700",
        };
    }
  };

  // Get transaction type icon and color
  const getTypeDetails = (type: string) => {
    switch (type) {
      case "deposit":
        return {
          icon: <ArrowDownLeft className="h-4 w-4" />,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          label: "Deposit",
          gradientFrom: "from-emerald-500",
          gradientTo: "to-teal-500",
          iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
          lightBg:
            "bg-gradient-to-br from-emerald-50 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/10",
          borderColor: "border-emerald-100 dark:border-emerald-800/30",
          hoverBg: "hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30",
          customIcon: (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-[2px]"></div>
              <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                <ArrowDownLeft className="h-4 w-4 text-white" />
              </div>
            </div>
          ),
        };
      case "withdrawal":
        return {
          icon: <ArrowUpRight className="h-4 w-4" />,
          color: "text-rose-500",
          bgColor: "bg-rose-50 dark:bg-rose-900/20",
          label: "Withdrawal",
          gradientFrom: "from-rose-500",
          gradientTo: "to-pink-500",
          iconBg: "bg-gradient-to-br from-rose-400 to-pink-500",
          lightBg:
            "bg-gradient-to-br from-rose-50 to-pink-50/80 dark:from-rose-900/20 dark:to-pink-900/10",
          borderColor: "border-rose-100 dark:border-rose-800/30",
          hoverBg: "hover:bg-rose-100/50 dark:hover:bg-rose-900/30",
          customIcon: (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full opacity-20 blur-[2px]"></div>
              <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>
            </div>
          ),
        };
      case "transfer":
        return {
          icon: <ArrowUpRight className="h-4 w-4" />,
          color: "text-violet-500",
          bgColor: "bg-violet-50 dark:bg-violet-900/20",
          label: "Transfer",
          gradientFrom: "from-violet-500",
          gradientTo: "to-purple-500",
          iconBg: "bg-gradient-to-br from-violet-400 to-purple-500",
          lightBg:
            "bg-gradient-to-br from-violet-50 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/10",
          borderColor: "border-violet-100 dark:border-violet-800/30",
          hoverBg: "hover:bg-violet-100/50 dark:hover:bg-violet-900/30",
          customIcon: (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 blur-[2px]"></div>
              <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                <Repeat className="h-4 w-4 text-white" />
              </div>
            </div>
          ),
        };
      case "payment":
        return {
          icon: <CreditCard className="h-4 w-4" />,
          color: "text-cyan-500",
          bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
          label: "Payment",
          gradientFrom: "from-cyan-500",
          gradientTo: "to-sky-500",
          iconBg: "bg-gradient-to-br from-cyan-400 to-sky-500",
          lightBg:
            "bg-gradient-to-br from-cyan-50 to-sky-50/80 dark:from-cyan-900/20 dark:to-sky-900/10",
          borderColor: "border-cyan-100 dark:border-cyan-800/30",
          hoverBg: "hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30",
          customIcon: (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-full opacity-20 blur-[2px]"></div>
              <div className="relative bg-gradient-to-br from-cyan-400 to-sky-500 p-2 rounded-full">
                <CreditCardIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          ),
        };
      default:
        return {
          icon: <Wallet className="h-4 w-4" />,
          color: "text-slate-500",
          bgColor: "bg-slate-100 dark:bg-slate-800",
          label: "Transaction",
          gradientFrom: "from-slate-500",
          gradientTo: "to-slate-600",
          iconBg: "bg-gradient-to-br from-slate-400 to-slate-500",
          lightBg:
            "bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/30",
          borderColor: "border-slate-200 dark:border-slate-700",
          hoverBg: "hover:bg-slate-100/70 dark:hover:bg-slate-800/70",
          customIcon: (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full opacity-20 blur-[2px]"></div>
              <div className="relative bg-gradient-to-br from-slate-400 to-slate-500 p-2 rounded-full">
                <Wallet className="h-4 w-4 text-white" />
              </div>
            </div>
          ),
        };
    }
  };

  // Filter transactions based on active tab and search query
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by tab
    const tabFilter =
      activeTab === "all" ||
      (activeTab === "deposits" && transaction.type === "deposit") ||
      (activeTab === "withdrawals" && transaction.type === "withdrawal") ||
      (activeTab === "transfers" && transaction.type === "transfer");

    // Filter by search
    const searchFilter =
      !searchQuery ||
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getTypeDetails(transaction.type)
        .label.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchQuery.toLowerCase());

    return tabFilter && searchFilter;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce(
    (groups: any, transaction) => {
      const date = formatDateForGrouping(
        transaction.date || transaction.createdAt || ""
      );
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  // Calculate quick stats
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate monthly change
  const currentMonthDeposits = transactions
    .filter((t) => {
      const date = new Date(t.date || t.createdAt || "");
      const now = new Date();
      return (
        t.type === "deposit" &&
        t.status === "completed" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthDeposits = transactions
    .filter((t) => {
      const date = new Date(t.date || t.createdAt || "");
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return (
        t.type === "deposit" &&
        t.status === "completed" &&
        date.getMonth() === lastMonth &&
        date.getFullYear() === lastMonthYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const depositChange =
    previousMonthDeposits === 0
      ? 100
      : ((currentMonthDeposits - previousMonthDeposits) /
          previousMonthDeposits) *
        100;

  // Calculate net flow (deposits - withdrawals)
  const netFlow = totalDeposits - totalWithdrawals;
  const isPositiveFlow = netFlow >= 0;

  return (
    <div className="space-y-8 pb-10">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <div className="mr-3 bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg shadow-md">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              My Wallet
            </h1>
            {/* <p className="text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
              Manage your funds and transactions
            </p> */}
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading || isRefreshing}
                    className="h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    {isRefreshing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update your wallet data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              onClick={() => router.push("/dashboard/fund-wallet")}
              className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Fund Wallet
            </Button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium flex items-center">
                  <Wallet className="h-3.5 w-3.5 mr-1" />
                  My Wallet
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      {/* Main Balance and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <FadeIn delay={0.2}>
          <AnimatedCard className="overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-purple-700 dark:from-violet-800 dark:to-purple-900 text-white lg:col-span-2 shadow-lg rounded-2xl relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute right-1/4 bottom-0 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
            </div>
            <CardHeader className="relative">
              <CardTitle className="text-white/90 flex items-center text-lg">
                <CircleDollarSign className="h-5 w-5 mr-2" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-1/2 bg-white/10" />
                  <Skeleton className="h-6 w-1/3 bg-white/10" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex flex-col items-baseline">
                    <h2
                      className={`text-5xl font-bold transition-all duration-1000 ease-out ${
                        showBalanceAnimation
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      ₦{wallet?.availableBalance?.toLocaleString() || "0"}
                    </h2>
                    <div
                      className={`ml-3 mt-2 px-2 py-1 rounded-full bg-white/20 text-xs font-medium transition-all duration-1000 ease-out delay-300 ${
                        showBalanceAnimation
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      Available
                    </div>
                  </div>
                  {/* <p className="text-white/70 text-sm">
                    Your current available balance
                  </p> */}
                </div>
              )}
            </CardContent>
            <div className="grid grid-cols-2 gap-4 px-6 pb-6 relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-sm">Total Balance</p>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <p className="text-xl font-semibold">
                  ₦{wallet?.balance?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-sm">Pending</p>
                  <Clock className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <p className="text-xl font-semibold">
                  ₦{wallet?.pendingBalance?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </AnimatedCard>
        </FadeIn>

        {/* <FadeIn delay={0.5}>
          <AnimatedCard className="lg:col-span-2 shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Pending Transactions
                  </CardTitle>
                  
                </div>
                {pendingTransactions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  >
                    {pendingTransactions.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : pendingTransactions.length > 0 ? (
                <div className="space-y-3">
                  {pendingTransactions.slice(0, 5).map((transaction) => {
                    const typeDetails = getTypeDetails(transaction.type);
                    return (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer group"
                        onClick={() =>
                          router.push(
                            `/dashboard/transactions/${transaction._id}`
                          )
                        }
                      >
                        <div className="flex items-center flex-grow overflow-hidden">
                          {typeDetails.customIcon}
                          <div className="min-w-0 overflow-hidden ml-3">
                            <p className="text-sm font-medium truncate">
                              {transaction.description}
                            </p>
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className="mr-2 text-xs px-1.5 py-0 h-5 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300"
                              >
                                {typeDetails.label}
                              </Badge>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(
                                  transaction.date ||
                                    transaction.createdAt ||
                                    ""
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p
                            className={`text-sm font-semibold ${
                              transaction.type === "deposit"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}₦
                            {transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[3px]"></div>
                    <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 my-9">
                    No pending transactions
                  </p>
                </div>
              )}
            </CardContent>
            {pendingTransactions.length > 5 && (
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl"
                  onClick={() => {
                    setActiveTab("all");
                    const pendingSection = document.getElementById(
                      "transaction-history"
                    );
                    pendingSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  View All Pending Transactions
                </Button>
              </CardFooter>
            )}
          </AnimatedCard>
        </FadeIn> */}

        {/* Quick Actions */}
        <FadeIn delay={0.3}>
          <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
            <CardHeader className="py-6 px-6">
              <CardTitle className="text-base flex items-center">
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                Quick Actions
              </CardTitle>
              {/* <CardDescription>Manage your wallet funds</CardDescription> */}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all duration-200 rounded-xl"
                onClick={() => router.push("/dashboard/fund-wallet")}
              >
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                    <ArrowDownLeft className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Fund Wallet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add money to your wallet
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 group transition-all duration-200 rounded-xl"
                onClick={() => router.push("/dashboard/withdraw-money")}
              >
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Withdraw</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transfer to bank account
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 group transition-all duration-200 rounded-xl"
                onClick={() => router.push("/dashboard/transfer-money")}
              >
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                    <Repeat className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Transfer</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Send to another user
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
              </Button>
            </CardContent>
          </AnimatedCard>
        </FadeIn>
      </div>

      {/* Stats and Pending Transactions */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn delay={0.4}>
          <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-violet-500" />
                Financial Overview
              </CardTitle>
              <CardDescription>Summary of your wallet activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px]"></div>
                            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                              <ArrowDownLeft className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                              Total Deposits
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {depositChange > 0 ? (
                            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {depositChange.toFixed(1)}%
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {Math.abs(depositChange).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        ₦{totalDeposits.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px]"></div>
                            <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                              <ArrowUpRight className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                              Total Withdrawals
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        ₦{totalWithdrawals.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-500"></div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                            <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                              <PiggyBank className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                              Net Flow
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {isPositiveFlow ? (
                            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Positive
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Negative
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        ₦{Math.abs(netFlow).toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-500"></div>
                  </div>
                </>
              )}
            </CardContent>
          </AnimatedCard>
        </FadeIn>
      </div> */}

      {/* Transaction History */}
      <FadeIn delay={0.6}>
        <AnimatedCard
          id="transaction-history"
          className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-violet-500" />
                  Transaction History
                </CardTitle>
                {/* <CardDescription>
                  View all your wallet transactions
                </CardDescription> */}
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setDateFilter("all-time")}>
                      All time
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateFilter("this-week")}
                    >
                      This week
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateFilter("this-month")}
                    >
                      This month
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDateFilter("last-7-days")}
                    >
                      Last 7 days
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateFilter("last-30-days")}
                    >
                      Last 30 days
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateFilter("last-90-days")}
                    >
                      Last 90 days
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-slate-200 dark:border-slate-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-9 h-10 rounded-xl border-slate-200 dark:border-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs
                  defaultValue={activeTab}
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-4 h-10 rounded-xl p-1 bg-slate-100 dark:bg-slate-800/50">
                    <TabsTrigger value="all" className="rounded-lg text-xs">
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="deposits"
                      className="rounded-lg text-xs"
                    >
                      Deposits
                    </TabsTrigger>
                    <TabsTrigger
                      value="withdrawals"
                      className="rounded-lg text-xs"
                    >
                      Withdrawals
                    </TabsTrigger>
                    <TabsTrigger
                      value="transfers"
                      className="rounded-lg text-xs"
                    >
                      Transfers
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ) : Object.keys(groupedTransactions).length > 0 ? (
                Object.entries(groupedTransactions).map(
                  ([date, transactions]: [string, any]) => (
                    <div key={date} className="space-y-3">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 px-1 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        {date}
                      </h3>
                      <div className="space-y-2">
                        {transactions.map((transaction: any) => {
                          const typeDetails = getTypeDetails(transaction.type);
                          const statusDetails = getStatusDetails(
                            transaction.status
                          );
                          return (
                            <div
                              key={transaction._id}
                              className={`flex items-center justify-between p-3 ${typeDetails.lightBg} border ${typeDetails.borderColor} rounded-xl ${typeDetails.hoverBg} transition-all duration-200 cursor-pointer group`}
                              onClick={() =>
                                router.push(
                                  `/dashboard/my-transactions/${transaction._id}`
                                )
                              }
                            >
                              <div className="flex items-center flex-grow overflow-hidden">
                                {typeDetails.customIcon}
                                <div className="min-w-0 overflow-hidden ml-3">
                                  <p className="text-sm font-medium truncate">
                                    {transaction.description}
                                  </p>
                                  <div className="flex items-center flex-wrap gap-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs px-1.5 py-0 h-5 ${statusDetails.borderColor} ${statusDetails.textColor}`}
                                    >
                                      {typeDetails.label}
                                    </Badge>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {format(
                                        new Date(
                                          transaction.date ||
                                            transaction.createdAt ||
                                            ""
                                        ),
                                        "h:mm a"
                                      )}
                                    </p>
                                    {transaction.paymentMethod && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-1.5 py-0 h-5 border-slate-200 dark:border-slate-700"
                                      >
                                        {transaction.paymentMethod.replace(
                                          "_",
                                          " "
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="flex items-center justify-end">
                                  <p
                                    className={`text-sm font-semibold ${
                                      transaction.type === "deposit"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    {transaction.type === "deposit" ? "+" : "-"}
                                    ₦{transaction.amount.toLocaleString()}
                                  </p>
                                  <span
                                    className={`ml-2 flex-shrink-0 ${statusDetails.color}`}
                                  >
                                    {statusDetails.icon}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs capitalize ${statusDetails.textColor}`}
                                >
                                  {transaction.status}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[3px]"></div>
                    <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-4 rounded-full">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No transactions found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {activeTab === "all"
                      ? "You haven't made any transactions yet."
                      : `You don't have any ${activeTab} yet.`}
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/fund-wallet")}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl shadow-md"
                  >
                    Fund Your Wallet
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          {Object.keys(groupedTransactions).length > 0 &&
            filteredTransactions.length > 10 && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700"
                  onClick={() => router.push("/dashboard/transactions")}
                >
                  View All Transactions
                </Button>
              </CardFooter>
            )}
        </AnimatedCard>
      </FadeIn>
    </div>
  );
}
