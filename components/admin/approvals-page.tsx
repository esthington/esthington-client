"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  ArrowUpRight,
  Building,
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
import { useWallet, type BankAccount } from "@/contexts/wallet-context";
import { useAuth } from "@/contexts/auth-context";

interface WithdrawalRequest {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  bankAccount: BankAccount;
  status: "pending" | "approved" | "rejected" | "completed";
  note?: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  rejectionReason?: string;
}

interface WithdrawalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  totalAmount: number;
  pendingAmount: number;
}

function WithdrawalApprovalManagement() {
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useAuth();
  const { approveWithdrawal, rejectWithdrawal, getPendingWithdrawals } =
    useWallet();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState<WithdrawalStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [showWithdrawalDetails, setShowWithdrawalDetails] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isSuperAdmin;

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    if (!hasAdminAccess) return;

    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
      };

      // Add filters
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Handle tab-based filtering
      if (activeTab !== "all") {
        params.status = activeTab;
      }

      const response = await getPendingWithdrawals(params);
      setWithdrawals(response.withdrawals || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);

      // Calculate stats from current data
      const calculatedStats = response.withdrawals.reduce(
        (acc: any, withdrawal: any) => {
          acc.total++;
          acc.totalAmount += withdrawal.amount;

          switch (withdrawal.status) {
            case "pending":
              acc.pending++;
              acc.pendingAmount += withdrawal.amount;
              break;
            case "approved":
              acc.approved++;
              break;
            case "rejected":
              acc.rejected++;
              break;
            case "completed":
              acc.completed++;
              break;
          }
          return acc;
        },
        {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          completed: 0,
          totalAmount: 0,
          pendingAmount: 0,
        }
      );

      setStats(calculatedStats);
    } catch (error: any) {
      console.error("Error fetching withdrawals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch withdrawal requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    if (hasAdminAccess) {
      const timeoutId = setTimeout(() => {
        fetchWithdrawals();
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    activeTab,
    currentPage,
    hasAdminAccess,
  ]);

  // Handle approve withdrawal
  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    setIsSubmitting(true);
    try {
      const success = await approveWithdrawal(
        selectedWithdrawal._id,
        approvalNotes
      );
      if (success) {
        setShowApproveDialog(false);
        setApprovalNotes("");
        fetchWithdrawals();
      }
    } catch (error: any) {
      console.error("Error approving withdrawal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject withdrawal
  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await rejectWithdrawal(
        selectedWithdrawal._id,
        rejectReason
      );
      if (success) {
        setShowRejectDialog(false);
        setRejectReason("");
        fetchWithdrawals();
      }
    } catch (error: any) {
      console.error("Error rejecting withdrawal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view withdrawal details
  const handleViewWithdrawal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawalDetails(true);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export withdrawals
  const handleExportWithdrawals = () => {
    toast({
      title: "Export Started",
      description: "Your withdrawal export will be ready shortly.",
    });
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Check if user has admin access
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to view withdrawal management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Withdrawal Table Component
  function WithdrawalTable() {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading withdrawals...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (withdrawals.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <ArrowUpRight className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                No withdrawal requests found
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
        <Card className="hidden lg:block overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[200px] min-w-[200px]">
                      User
                    </TableHead>
                    <TableHead className="font-semibold w-[120px] min-w-[120px]">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold w-[200px] min-w-[200px]">
                      Bank Account
                    </TableHead>
                    <TableHead className="font-semibold w-[120px] min-w-[120px]">
                      Status
                    </TableHead>
                    {/* <TableHead className="font-semibold w-[150px] min-w-[150px]">
                      Reference
                    </TableHead> */}
                    <TableHead className="font-semibold w-[120px] min-w-[120px]">
                      Date
                    </TableHead>
                    <TableHead className="text-right font-semibold w-[100px] min-w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow
                      key={withdrawal._id}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="w-[200px] min-w-[200px]">
                        <div className="flex items-center gap-3 max-w-[180px]">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {withdrawal.user.firstName.charAt(0)}
                              {withdrawal.user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {withdrawal.user.firstName}{" "}
                              {withdrawal.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {withdrawal.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px]">
                        <div className="font-medium">
                          {formatCurrency(withdrawal.amount)}
                        </div>
                      </TableCell>
                      <TableCell className="w-[200px] min-w-[200px]">
                        <div className="flex items-center gap-2 max-w-[180px]">
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {withdrawal.bankAccount.bankName}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              {withdrawal.bankAccount.accountNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px]">
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      {/* <TableCell className="w-[150px] min-w-[150px]">
                        <div className="font-mono text-sm truncate max-w-[130px]">
                          {withdrawal.reference}
                        </div>
                      </TableCell> */}
                      <TableCell className="w-[120px] min-w-[120px]">
                        <div className="text-sm">
                          {format(
                            new Date(withdrawal.createdAt),
                            "MMM d, yyyy"
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(withdrawal.createdAt), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-[100px] min-w-[100px]">
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
                              onClick={() => handleViewWithdrawal(withdrawal)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {withdrawal.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setShowApproveDialog(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
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
        <div className="block lg:hidden">
          <div className="grid gap-4">
            {withdrawals.map((withdrawal) => (
              <Card key={withdrawal._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {withdrawal.user.firstName.charAt(0)}
                        {withdrawal.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {withdrawal.user.firstName} {withdrawal.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {withdrawal.user.email}
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
                        onClick={() => handleViewWithdrawal(withdrawal)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {withdrawal.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Amount:
                    </span>
                    <div className="font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Status:
                    </span>
                    <div className="mt-1">
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bank:</span>
                    <div className="font-medium">
                      {withdrawal.bankAccount.bankName}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {withdrawal.bankAccount.accountNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">
                      {format(
                        new Date(withdrawal.createdAt),
                        "MMM d, yyyy HH:mm"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
              withdrawals
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
    <div className="min-h-screen  overflow-x-hidden">
      <div className="w-full max-w-full">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Withdrawal Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Review and approve withdrawal requests
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchWithdrawals} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExportWithdrawals} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.approved}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Amount
                </CardTitle>
                <DollarSign className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(stats.pendingAmount)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by user or reference..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
              defaultValue="pending"
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 min-w-max">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs sm:text-sm">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs sm:text-sm">
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs sm:text-sm">
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs sm:text-sm">
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-4">
                <WithdrawalTable />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <WithdrawalTable />
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                <WithdrawalTable />
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <WithdrawalTable />
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                <WithdrawalTable />
              </TabsContent>
            </Tabs>
          </div>

          {/* Withdrawal Details Dialog */}
          {selectedWithdrawal && (
            <Dialog
              open={showWithdrawalDetails}
              onOpenChange={setShowWithdrawalDetails}
            >
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Withdrawal Request Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedWithdrawal.reference}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(selectedWithdrawal.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(selectedWithdrawal.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(selectedWithdrawal.createdAt),
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
                            {selectedWithdrawal.user.firstName.charAt(0)}
                            {selectedWithdrawal.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedWithdrawal.user.firstName}{" "}
                            {selectedWithdrawal.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedWithdrawal.user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Bank Account</p>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedWithdrawal.bankAccount.bankName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {selectedWithdrawal.bankAccount.accountNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedWithdrawal.bankAccount.accountName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedWithdrawal.note && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">User Note</p>
                        <p className="text-sm">{selectedWithdrawal.note}</p>
                      </div>
                    )}

                    {selectedWithdrawal.adminNotes && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">Admin Notes</p>
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          {selectedWithdrawal.adminNotes}
                        </div>
                      </div>
                    )}

                    {selectedWithdrawal.rejectionReason && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">Rejection Reason</p>
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {selectedWithdrawal.rejectionReason}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Request ID</p>
                      <p className="text-sm font-mono">
                        {selectedWithdrawal._id}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm">
                        {format(
                          new Date(selectedWithdrawal.updatedAt),
                          "MMM d, yyyy HH:mm"
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedWithdrawal.status === "pending" && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          This withdrawal request is pending approval
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  {selectedWithdrawal.status === "pending" ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowWithdrawalDetails(false);
                          setShowRejectDialog(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Withdrawal
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWithdrawalDetails(false);
                          setShowApproveDialog(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Withdrawal
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowWithdrawalDetails(false)}
                      className="w-full sm:w-auto"
                    >
                      Close
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Approve Dialog */}
          <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Approve Withdrawal Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">
                      Approve withdrawal for{" "}
                      {formatCurrency(selectedWithdrawal?.amount || 0)}?
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      This action will process the withdrawal to the user's bank
                      account.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about this approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="mt-1"
                    rows={3}
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
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Approving..." : "Approve Withdrawal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reject Withdrawal Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Reject withdrawal for{" "}
                      {formatCurrency(selectedWithdrawal?.amount || 0)}?
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      This action will cancel the withdrawal and refund the
                      user's balance.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-1"
                    rows={3}
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
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Rejecting..." : "Reject Withdrawal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export { WithdrawalApprovalManagement };
export default WithdrawalApprovalManagement;
