"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  CreditCard,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/contexts/wallet-context";

interface TransactionUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Transaction {
  _id: string;
  reference: string;
  type: string;
  check: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
  description?: string;
  user?: TransactionUser;
  // Add other properties as needed
}
import { useAuth } from "@/contexts/auth-context";

// Transaction types and statuses from wallet context
export const TransactionType = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  TRANSFER: "transfer",
  PAYMENT: "payment",
  REFUND: "refund",
  REFERRAL: "referral",
  INVESTMENT: "investment",
  PROPERTY_PURCHASE: "property_purchase",
} as const;

export const TransactionStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export const PaymentMethod = {
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  WALLET: "wallet",
  PAYSTACK: "paystack",
} as const;

interface TransactionStats {
  byType: Array<{
    type: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    minAmount: number;
    maxAmount: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  byPaymentMethod: Array<{
    paymentMethod: string;
    count: number;
    totalAmount: number;
  }>;
  timeSeries: Array<{
    date: string;
    count: number;
    totalAmount: number;
    depositAmount: number;
    withdrawalAmount: number;
    investmentAmount: number;
    propertyPurchaseAmount: number;
  }>;
}

interface TransactionFilter {
  search?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

function TransactionManagementPage() {
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useAuth();
  const {
    getAllTransactionsAdmin,
    getTransactionStatsAdmin,
    approveTransactionAdmin,
    rejectTransactionAdmin,
    getTransactionById,
  } = useWallet();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  // Filter states
  const [filter, setFilter] = useState<TransactionFilter>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isSuperAdmin;

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!hasAdminAccess) return;

    setIsLoading(true);
    try {
      const params: any = {
        page: filter.page || 1,
        limit: filter.limit || 10,
      };

      // Add all filters to params for server-side processing
      if (filter.search) params.search = filter.search;
      if (filter.type && filter.type !== "all") params.type = filter.type;
      if (filter.status && filter.status !== "all")
        params.status = filter.status;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;

      const response = await getAllTransactionsAdmin(params);

      setTransactions(response.transactions || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction stats
  const fetchStats = async () => {
    if (!hasAdminAccess) return;

    try {
      const statsData = await getTransactionStatsAdmin();
      if (statsData) {
        setStats(statsData);
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  // Update filter when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilter: TransactionFilter = {
        page: 1, // Reset to first page when filters change
        limit: 10,
      };

      if (searchTerm) newFilter.search = searchTerm;
      if (typeFilter !== "all") newFilter.type = typeFilter;
      if (statusFilter !== "all") newFilter.status = statusFilter;
      if (startDate) newFilter.startDate = startDate;
      if (endDate) newFilter.endDate = endDate;

      // Handle tab-based filtering
      if (activeTab === "pending") {
        newFilter.status = "pending";
      } else if (activeTab === "completed") {
        newFilter.status = "completed";
      } else if (activeTab === "failed") {
        newFilter.status = "failed";
      } else if (activeTab === "deposits") {
        newFilter.type = "deposit";
      } else if (activeTab === "withdrawals") {
        newFilter.type = "withdrawal";
      } else if (activeTab === "investments") {
        newFilter.type = "investment";
      }

      setFilter(newFilter);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, statusFilter, startDate, endDate, activeTab]);

  // Fetch data when filter changes
  useEffect(() => {
    if (hasAdminAccess) {
      fetchTransactions();
    }
  }, [filter, hasAdminAccess]);

  // Fetch stats on mount
  useEffect(() => {
    if (hasAdminAccess) {
      fetchStats();
    }
  }, [hasAdminAccess]);

  // Handle approve transaction
  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return;

    setIsSubmitting(true);
    try {
      const success = await approveTransactionAdmin(
        selectedTransaction._id,
        approvalNotes
      );
      if (success) {
        setShowApproveDialog(false);
        setApprovalNotes("");
        fetchTransactions();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error approving transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject transaction
  const handleRejectTransaction = async () => {
    if (!selectedTransaction || !rejectReason.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await rejectTransactionAdmin(
        selectedTransaction._id,
        rejectReason
      );
      if (success) {
        setShowRejectDialog(false);
        setRejectReason("");
        fetchTransactions();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Error rejecting transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view transaction details
  const handleViewTransaction = async (transaction: Transaction) => {
    try {
      const transactionDetails = await getTransactionById(transaction._id);
      if (transactionDetails) {
        setSelectedTransaction(transactionDetails);
        setShowTransactionDetails(true);
      }
    } catch (error: any) {
      console.error("Error fetching transaction details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction details.",
        variant: "destructive",
      });
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  // Export transactions
  const handleExportTransactions = () => {
    // Implementation for exporting transactions
    toast({
      title: "Export Started",
      description: "Your transaction export will be ready shortly.",
    });
  };

  // Get status badge
  const getStatusBadge = (status: any) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case TransactionStatus.PENDING:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case TransactionStatus.FAILED:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case TransactionStatus.CANCELLED:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get type badge
  const getTypeBadge = (type: any) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <ArrowDownLeft className="mr-1 h-3 w-3" />
            Deposit
          </Badge>
        );
      case TransactionType.WITHDRAWAL:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            Withdrawal
          </Badge>
        );
      case TransactionType.INVESTMENT:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Investment
          </Badge>
        );
      case TransactionType.PROPERTY_PURCHASE:
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Building className="mr-1 h-3 w-3" />
            Property
          </Badge>
        );
      case TransactionType.TRANSFER:
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
            <RefreshCw className="mr-1 h-3 w-3" />
            Transfer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <DollarSign className="mr-1 h-3 w-3" />
            {type}
          </Badge>
        );
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case PaymentMethod.CARD:
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case PaymentMethod.BANK_TRANSFER:
        return <Building className="h-4 w-4 text-purple-500" />;
      case PaymentMethod.WALLET:
        return <Wallet className="h-4 w-4 text-green-500" />;
      case PaymentMethod.PAYSTACK:
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      default:
        return <Wallet className="h-4 w-4 text-green-500" />;
    }
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

  // Calculate stats from current stats data
  const calculatedStats = useMemo(() => {
    if (!stats)
      return { total: 0, pending: 0, completed: 0, failed: 0, totalVolume: 0 };

    const statusStats = stats.byStatus.reduce(
      (acc, stat) => {
        if (
          stat.status === "pending" ||
          stat.status === "completed" ||
          stat.status === "failed"
        ) {
          acc[stat.status] = stat.count;
        }
        acc.totalVolume += stat.totalAmount;
        return acc;
      },
      { pending: 0, completed: 0, failed: 0, totalVolume: 0 } as {
        pending: number;
        completed: number;
        failed: number;
        totalVolume: number;
      }
    );

    const total = stats.byStatus.reduce((sum, stat) => sum + stat.count, 0);

    return {
      total,
      pending: statusStats.pending,
      completed: statusStats.completed,
      failed: statusStats.failed,
      totalVolume: statusStats.totalVolume,
    };
  }, [stats]);

  // Check if user has admin access
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to view transaction management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transaction Table Component
  function TransactionTable() {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (transactions.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                No transactions found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {/* <TableHead className="font-semibold">
                      Transaction ID
                    </TableHead> */}
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">
                      Payment Method
                    </TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction._id}
                      className="hover:bg-muted/30"
                    >
                      {/* <TableCell>
                        <div className="font-mono text-sm w-20 truncate line-clamp-1">
                          {transaction.reference}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {transaction._id.slice(-8)}
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {transaction.user?.firstName?.charAt(0) || ""}
                              {transaction.user?.lastName?.charAt(0) || ""}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {transaction.user?.firstName || ""}{" "}
                              {transaction.user?.lastName || ""}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.user?.email || ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {/* {formatCurrency(transaction.amount)} */}
                          <p
                            className={`text-sm font-semibold ${
                              transaction.check === "incoming"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {transaction.check === "incoming" ? "+" : "-"}₦
                            {transaction.amount.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-sm capitalize">
                            {transaction.paymentMethod?.replace("_", " ") ||
                              "Wallet"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(
                            new Date(transaction.createdAt ?? ""),
                            "MMM d, yyyy"
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(
                            new Date(transaction.createdAt ?? ""),
                            "HH:mm"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {/* {transaction.status ===
                              TransactionStatus.PENDING && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowApproveDialog(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )} */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="block md:hidden">
          <div className="grid gap-4">
            {transactions.map((transaction) => (
              <Card key={transaction._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {transaction.user?.firstName?.charAt(0) || ""}
                        {transaction.user?.lastName?.charAt(0) || ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {transaction.user?.firstName || ""}{" "}
                        {transaction.user?.lastName || ""}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {transaction.reference}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {/* {transaction.status === TransactionStatus.PENDING && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )} */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(transaction.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">
                      {format(
                        new Date(transaction.createdAt ?? ""),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalCount)} of {totalCount}{" "}
              transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Transaction Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage all financial transactions
              </p>
            </div>
            <Button
              onClick={handleExportTransactions}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Stats Cards */}
    

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by transaction ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="investment">Investments</SelectItem>
                    <SelectItem value="property_purchase">
                      Property Purchases
                    </SelectItem>
                    <SelectItem value="transfer">Transfers</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="date"
                    placeholder="Start date"
                    className="pl-10"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="date"
                    placeholder="End date"
                    className="pl-10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs and Content */}
          <div className="w-full">
            <Tabs
              defaultValue="all"
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7 min-w-max">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All
                  </TabsTrigger>
                  {/* <TabsTrigger value="pending" className="text-xs sm:text-sm">
                    Pending
                  </TabsTrigger> */}
                  <TabsTrigger value="completed" className="text-xs sm:text-sm">
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs sm:text-sm">
                    Failed
                  </TabsTrigger>
                  <TabsTrigger value="deposits" className="text-xs sm:text-sm">
                    Deposits
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdrawals"
                    className="text-xs sm:text-sm"
                  >
                    Withdrawals
                  </TabsTrigger>
                  <TabsTrigger
                    value="investments"
                    className="text-xs sm:text-sm"
                  >
                    Investments
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-4">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="failed" className="space-y-4">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="deposits" className="space-y-4">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="withdrawals" className="space-y-4">
                <TransactionTable />
              </TabsContent>

              <TabsContent value="investments" className="space-y-4">
                <TransactionTable />
              </TabsContent>
            </Tabs>
          </div>

          {/* Transaction Details Dialog */}
          {selectedTransaction && (
            <Dialog
              open={showTransactionDetails}
              onOpenChange={setShowTransactionDetails}
            >
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedTransaction.reference}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeBadge(selectedTransaction.type)}
                        {getStatusBadge(selectedTransaction.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(selectedTransaction.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(selectedTransaction.createdAt ?? ""),
                          "MMM d, yyyy HH:mm"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">User</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {selectedTransaction.user?.firstName?.charAt(0) ||
                              ""}
                            {selectedTransaction.user?.lastName?.charAt(0) ||
                              ""}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedTransaction.user?.firstName || ""}{" "}
                            {selectedTransaction.user?.lastName || ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTransaction.user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 w-fit">
                      <p className="text-sm font-medium">Payment Method</p>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(
                          selectedTransaction.paymentMethod
                        )}
                        <p className="text-sm capitalize">
                          {selectedTransaction.paymentMethod?.replace(
                            "_",
                            " "
                          ) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm">
                        {selectedTransaction.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="text-sm font-mono">
                        {selectedTransaction._id}
                      </p>
                    </div>
                  </div>

                  {selectedTransaction.status === TransactionStatus.PENDING && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          This transaction is still pending 
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* <DialogFooter className="flex-col sm:flex-row gap-2">
                  {selectedTransaction.status === TransactionStatus.PENDING ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowTransactionDetails(false);
                          setShowRejectDialog(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Transaction
                      </Button>
                      <Button
                        onClick={() => {
                          setShowTransactionDetails(false);
                          setShowApproveDialog(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Transaction
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowTransactionDetails(false)}
                      className="w-full sm:w-auto"
                    >
                      Close
                    </Button>
                  )}
                </DialogFooter> */}
              </DialogContent>
            </Dialog>
          )}

          {/* Approve Transaction Dialog */}
          <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Approve Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">
                      Approve transaction for{" "}
                      {formatCurrency(selectedTransaction?.amount || 0)}?
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      This action will complete the transaction and update the
                      user's balance.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Input
                    placeholder="Add any notes about this approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApproveDialog(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveTransaction}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Approving..." : "Approve Transaction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Transaction Dialog */}
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reject Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Reject transaction for{" "}
                      {formatCurrency(selectedTransaction?.amount || 0)}?
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      This action will mark the transaction as failed and may
                      refund the user's balance.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Please provide a reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectTransaction}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Rejecting..." : "Reject Transaction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export { TransactionManagementPage };
export default TransactionManagementPage;
