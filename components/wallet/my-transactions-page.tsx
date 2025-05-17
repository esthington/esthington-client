"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Wallet,
  LayoutDashboard,
  Repeat,
  BarChart3,
  CircleDollarSign,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import FadeIn from "@/components/animations/fade-in";
import { useWallet } from "@/contexts/wallet-context";
import type { Transaction } from "@/contexts/wallet-context";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function MyTransactionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { wallet, isLoading, getTransactions, getTransactionById } =
    useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const itemsPerPage = 10;
  const isAdmin = user?.role === "admin";

  // Fetch transactions from API with filters
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        // Build filter params
        const params: any = {
          page: currentPage,
          limit: itemsPerPage,
        };

        // Add type filter
        if (typeFilter !== "all") {
          params.type = typeFilter;
        } else if (activeTab !== "all") {
          // If no specific type filter but tab is selected
          if (activeTab === "deposits") params.type = "deposit";
          else if (activeTab === "withdrawals") params.type = "withdrawal";
          else if (activeTab === "transfers") params.type = "transfer";
          else if (activeTab === "investments") params.type = "investment";
        }

        // Add status filter
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        // Add date filter
        if (dateFilter !== "all") {
          const today = new Date();
          let startDate;

          if (dateFilter === "today") {
            startDate = new Date(today.setHours(0, 0, 0, 0));
          } else if (dateFilter === "yesterday") {
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
          } else if (dateFilter === "this_week") {
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 7);
          } else if (dateFilter === "this_month") {
            startDate = new Date(today);
            startDate.setMonth(startDate.getMonth() - 1);
          }

          if (startDate) {
            params.startDate = startDate.toISOString();
          }
        }

        // Call API
        const response = await getTransactions(params);
        setTransactions(response.transactions);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [
    currentPage,
    typeFilter,
    statusFilter,
    dateFilter,
    activeTab,
    getTransactions,
    toast,
  ]);

  // Handle transaction approval (admin only)
  const handleApproveTransaction = async (transactionId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: "Approved by admin" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction approved successfully",
        });

        // Refresh transactions
        const updatedTransaction = await getTransactionById(transactionId);
        if (updatedTransaction) {
          setTransactions((prev) =>
            prev.map((tx) =>
              tx._id === transactionId ? updatedTransaction : tx
            )
          );
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve transaction");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve transaction",
        variant: "destructive",
      });
    }
  };

  // Handle transaction rejection (admin only)
  const handleRejectTransaction = async (
    transactionId: string,
    reason: string
  ) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction rejected successfully",
        });

        // Refresh transactions
        const updatedTransaction = await getTransactionById(transactionId);
        if (updatedTransaction) {
          setTransactions((prev) =>
            prev.map((tx) =>
              tx._id === transactionId ? updatedTransaction : tx
            )
          );
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject transaction");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject transaction",
        variant: "destructive",
      });
    }
  };

  // Filter transactions based on search query and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by search query
      if (
        searchQuery &&
        !transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !transaction.reference.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery]);

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px]"></div>
            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
              <ArrowDownLeft className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      case "withdrawal":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px]"></div>
            <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
              <ArrowUpRight className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      case "transfer":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
            <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
              <Repeat className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      case "refund":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[2px]"></div>
            <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-2 rounded-full">
              <ArrowDownLeft className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      case "investment":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
            <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-slate-400 rounded-full opacity-20 blur-[2px]"></div>
            <div className="relative bg-gradient-to-br from-slate-400 to-slate-500 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </div>
        );
    }
  };

  const getStatusDetails = (status: Transaction["status"]) => {
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

  // Calculate transaction totals
  const totalDeposits = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "deposit" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const totalInvestments = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "investment" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  return (
    <div className="space-y-8 pb-10">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <div className="mr-3 bg-gradient-to-br from-slate-500 to-slate-600 p-2 rounded-lg shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              My Transactions
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              >
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export current view</DropdownMenuItem>
              <DropdownMenuItem>Export all transactions</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <BreadcrumbLink
                  href="/dashboard/my-wallet"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <Wallet className="h-3.5 w-3.5 mr-1" />
                  My Wallet
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Transactions
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm">
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm">
                    <Filter className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="transfer_in">Received</SelectItem>
                    <SelectItem value="transfer_out">Sent</SelectItem>
                    <SelectItem value="investment">Investments</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm">
                    <CreditCard className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 h-10 rounded-xl p-1 bg-slate-100 dark:bg-slate-800/50">
                <TabsTrigger value="all" className="rounded-lg text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="deposits" className="rounded-lg text-xs">
                  Deposits
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="rounded-lg text-xs">
                  Withdrawals
                </TabsTrigger>
                <TabsTrigger value="transfers" className="rounded-lg text-xs">
                  Transfers
                </TabsTrigger>
                <TabsTrigger value="investments" className="rounded-lg text-xs">
                  Investments
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoadingTransactions ? (
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
                      <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <div className="absolute inset-0 bg-slate-400 rounded-full opacity-20 blur-[3px]"></div>
                      <div className="relative bg-gradient-to-br from-slate-400 to-slate-500 p-4 rounded-full">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                      No Transactions Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
                      We couldn't find any transactions matching your search
                      criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setDateFilter("all");
                        setTypeFilter("all");
                        setStatusFilter("all");
                        setActiveTab("all");
                      }}
                      className="rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => {
                      const statusDetails = getStatusDetails(
                        transaction.status
                      );
                      return (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/dashboard/my-transactions/${transaction._id}`
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                                {transaction.description}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(transaction.date).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                                {transaction.reference}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-medium ${
                                transaction.type === "deposit"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {transaction.type === "deposit" ? "+" : "-"}₦
                              {transaction.amount.toLocaleString()}
                            </div>
                            <Badge
                              variant="outline"
                              className={`${statusDetails.bgColor} ${statusDetails.textColor} ${statusDetails.borderColor}`}
                            >
                              <span className={`mr-1 ${statusDetails.color}`}>
                                {statusDetails.icon}
                              </span>
                              {transaction.status}
                            </Badge>
                            {isAdmin && transaction.status === "pending" && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-lg border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveTransaction(transaction._id);
                                  }}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-lg border-rose-200 hover:border-rose-300 hover:bg-rose-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectTransaction(
                                      transaction._id,
                                      "Rejected by admin"
                                    );
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1 text-rose-500" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1 || isLoadingTransactions}
                          className="rounded-lg border-slate-200 dark:border-slate-700"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous</span>
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => {
                              // Show first page, last page, current page and pages around current
                              let pageToShow;
                              if (totalPages <= 5) {
                                pageToShow = i + 1;
                              } else if (currentPage <= 3) {
                                pageToShow = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageToShow = totalPages - 4 + i;
                              } else {
                                pageToShow = currentPage - 2 + i;
                              }

                              return (
                                <Button
                                  key={pageToShow}
                                  variant={
                                    currentPage === pageToShow
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(pageToShow)}
                                  disabled={isLoadingTransactions}
                                  className={`w-8 h-8 p-0 rounded-lg ${
                                    currentPage !== pageToShow
                                      ? "border-slate-200 dark:border-slate-700"
                                      : "bg-gradient-to-r from-slate-600 to-slate-700"
                                  }`}
                                >
                                  {pageToShow}
                                </Button>
                              );
                            }
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={
                            currentPage === totalPages || isLoadingTransactions
                          }
                          className="rounded-lg border-slate-200 dark:border-slate-700"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-slate-500" />
                Transaction Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Total Deposits:
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    ₦{totalDeposits.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Total Withdrawals:
                  </span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">
                    ₦{totalWithdrawals.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Total Investments:
                  </span>
                  <span className="font-medium text-violet-600 dark:text-violet-400">
                    ₦{totalInvestments.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between">
                  <span className="text-slate-900 dark:text-white font-medium">
                    Current Balance:
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    ₦{wallet?.balance?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800 md:col-span-2">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-slate-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 text-center rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all duration-200"
                  onClick={() => router.push("/dashboard/fund-wallet")}
                >
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                      <ArrowDownLeft className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span>Fund Wallet</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 text-center rounded-xl border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 group transition-all duration-200"
                  onClick={() => router.push("/dashboard/withdraw-money")}
                >
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span>Withdraw</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 text-center rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 group transition-all duration-200"
                  onClick={() => router.push("/dashboard/transfer-money")}
                >
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                      <Repeat className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span>Transfer</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 text-center rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70 group transition-all duration-200"
                  onClick={() => router.push("/dashboard/my-wallet")}
                >
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-slate-400 rounded-full opacity-20 blur-[2px] group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-slate-400 to-slate-500 p-2 rounded-full">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span>My Wallet</span>
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            onClick={() => router.push("/dashboard/my-wallet")}
          >
            <ArrowRight className="mr-2 h-4 w-4" /> Return to My Wallet
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
