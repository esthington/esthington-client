"use client";

import { useState, useEffect, useCallback } from "react";
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
  TrendingUp,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Briefcase,
  RefreshCw,
  Users,
  AlertTriangle,
  Lock,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { apiConfig } from "@/lib/api";

// Updated types to match the controller response
interface InvestmentDue {
  _id: string;
  userId: string;
  investmentId: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  expectedReturn: number;
  actualReturn: number;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    userName?: string;
    phone?: string;
  };
  investment: {
    _id: string;
    title: string;
    propertyId: string;
    returnRate: number;
    investmentPeriod: number;
    payoutFrequency: string;
    type: string;
    status: string;
  };
  payoutAmount: number;
  nextPayoutDate: string;
  payoutStatus: "pending" | "completed" | "overdue" | "not_due";
  isDue: boolean;
  isOverdue: boolean;
  progressPercentage: number;
  currentPayoutPeriod: number;
  totalPayouts: number;
  completedPayouts: number;
  remainingPayouts: number;
  canApprove: boolean;
  daysOverdue?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface InvestmentDueStats {
  totalInvestments: number;
  pendingPayouts: number;
  overduePayouts: number;
  completedInvestments: number;
  totalExpectedReturns: number;
  totalActualReturns: number;
  pendingPayoutAmount: number;
  overduePayoutAmount: number;
  activeInvestorsCount: number;
  investmentTypesCount: number;
  completionRate: number;
}

// Default stats to prevent undefined errors
const defaultStats: InvestmentDueStats = {
  totalInvestments: 0,
  pendingPayouts: 0,
  overduePayouts: 0,
  completedInvestments: 0,
  totalExpectedReturns: 0,
  totalActualReturns: 0,
  pendingPayoutAmount: 0,
  overduePayoutAmount: 0,
  activeInvestorsCount: 0,
  investmentTypesCount: 0,
  completionRate: 0,
};

function InvestmentDuesManagement() {
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useAuth();

  // State management
  const [investmentDues, setInvestmentDues] = useState<InvestmentDue[]>([]);
  const [stats, setStats] = useState<InvestmentDueStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDue, setSelectedDue] = useState<InvestmentDue | null>(null);
  const [showDueDetails, setShowDueDetails] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isSuperAdmin;

  // Fetch investment dues stats
  const fetchInvestmentDueStats = useCallback(async () => {
    if (!hasAdminAccess) return;

    setIsStatsLoading(true);
    try {
      const response = await apiConfig.get("/investment-dues/stats", {
        withCredentials: true,
      });

      if (response.status === 200 && response.data.success) {
        const statsData = response.data.data;
        setStats({
          totalInvestments: Number(statsData.totalInvestments) || 0,
          pendingPayouts: Number(statsData.pendingPayouts) || 0,
          overduePayouts: Number(statsData.overduePayouts) || 0,
          completedInvestments: Number(statsData.completedInvestments) || 0,
          totalExpectedReturns: Number(statsData.totalExpectedReturns) || 0,
          totalActualReturns: Number(statsData.totalActualReturns) || 0,
          pendingPayoutAmount: Number(statsData.pendingPayoutAmount) || 0,
          overduePayoutAmount: Number(statsData.overduePayoutAmount) || 0,
          activeInvestorsCount: Number(statsData.activeInvestorsCount) || 0,
          investmentTypesCount: Number(statsData.investmentTypesCount) || 0,
          completionRate: Number(statsData.completionRate) || 0,
        });
      } else {
        console.warn("Invalid stats response:", response.data);
        setStats(defaultStats);
      }
    } catch (error: any) {
      console.error("Error fetching investment due stats:", error);
      setStats(defaultStats);
      toast({
        title: "Warning",
        description: "Failed to load statistics. Showing default values.",
        variant: "destructive",
      });
    } finally {
      setIsStatsLoading(false);
    }
  }, [hasAdminAccess, toast]);

  // Fetch investment dues
  const fetchInvestmentDues = useCallback(async () => {
    if (!hasAdminAccess) return;

    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "nextPayoutDate",
        sortOrder: "asc",
      };

      // Add filters
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Handle tab-based filtering
      if (activeTab !== "all") {
        params.status = activeTab === "paid" ? "completed" : activeTab;
      }

      const response = await apiConfig.get("/investment-dues", {
        params,
        withCredentials: true,
      });

      if (response.status === 200 && response.data.success) {
        const data = response.data.data || [];
        const pagination = response.data.pagination || {};

        setInvestmentDues(data);
        setTotalCount(pagination.total || 0);
        setTotalPages(pagination.totalPages || 0);
      } else {
        console.warn("Invalid response format:", response.data);
        setInvestmentDues([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error: any) {
      console.error("Error fetching investment dues:", error);
      setInvestmentDues([]);
      setTotalCount(0);
      setTotalPages(0);
      toast({
        title: "Error",
        description: "Failed to fetch investment dues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    hasAdminAccess,
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    activeTab,
    toast,
  ]);

  // Initial data fetch
  useEffect(() => {
    if (hasAdminAccess) {
      fetchInvestmentDueStats();
      fetchInvestmentDues();
    }
  }, [hasAdminAccess, fetchInvestmentDueStats, fetchInvestmentDues]);

  // Debounced search effect
  useEffect(() => {
    if (!hasAdminAccess) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      fetchInvestmentDues();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    activeTab,
    hasAdminAccess,
    fetchInvestmentDues,
  ]);

  // Handle approve investment due
  const handleApprove = async () => {
    if (!selectedDue) return;

    setIsSubmitting(true);
    try {
      const response = await apiConfig.patch(
        `/investment-dues/${selectedDue._id}/approve`,
        { notes: approvalNotes },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.success) {
        setShowApproveDialog(false);
        setApprovalNotes("");
        setSelectedDue(null);
        await Promise.all([fetchInvestmentDues(), fetchInvestmentDueStats()]);
        toast({
          title: "Success",
          description:
            response.data.message || "Investment payout approved successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error approving investment due:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to approve investment payout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject investment due
  const handleReject = async () => {
    if (!selectedDue || !rejectReason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiConfig.patch(
        `/investment-dues/${selectedDue._id}/reject`,
        { reason: rejectReason.trim() },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.success) {
        setShowRejectDialog(false);
        setRejectReason("");
        setSelectedDue(null);
        await Promise.all([fetchInvestmentDues(), fetchInvestmentDueStats()]);
        toast({
          title: "Success",
          description:
            response.data.message || "Investment payout rejected successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error rejecting investment due:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to reject investment payout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view investment due details
  const handleViewDue = (due: InvestmentDue) => {
    setSelectedDue(due);
    setShowDueDetails(true);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export investment dues
  const handleExportDues = () => {
    toast({
      title: "Export Started",
      description: "Your investment dues export will be ready shortly.",
    });
  };

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([fetchInvestmentDues(), fetchInvestmentDueStats()]);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
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
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        );
      case "not_due":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Lock className="mr-1 h-3 w-3" />
            Not Due
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get investment type badge
  const getInvestmentTypeBadge = (type?: string) => {
    switch (type) {
      case "real_estate":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Building className="mr-1 h-3 w-3" />
            Real Estate
          </Badge>
        );
      case "agriculture":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Building className="mr-1 h-3 w-3" />
            Agriculture
          </Badge>
        );
      case "business":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Briefcase className="mr-1 h-3 w-3" />
            Business
          </Badge>
        );
      case "stocks":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Stocks
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Investment
          </Badge>
        );
    }
  };

  // Check if actions are allowed for this investment
  const canApproveReject = (due: InvestmentDue) => {
    return due.canApprove && due.isDue && due.payoutStatus === "pending";
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
                You don't have permission to view investment dues management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Investment Dues Table Component
  function InvestmentDuesTable() {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Loading investment dues...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (investmentDues.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                No investment dues found
              </p>
              <p className="text-sm text-muted-foreground">
                No investments match your current filters
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[200px]">
                      Investor
                    </TableHead>
                    <TableHead className="font-semibold w-[250px]">
                      Investment
                    </TableHead>
                    <TableHead className="font-semibold w-[120px]">
                      Payout Amount
                    </TableHead>
                    <TableHead className="font-semibold w-[120px]">
                      Due Date
                    </TableHead>
                    <TableHead className="font-semibold w-[120px]">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold w-[150px]">
                      Progress
                    </TableHead>
                    <TableHead className="text-right font-semibold w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investmentDues.map((due) => (
                    <TableRow key={due._id} className="hover:bg-muted/30">
                      <TableCell className="w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {due.user?.firstName?.charAt(0) || "U"}
                              {due.user?.lastName?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {due.user?.firstName || "Unknown"}{" "}
                              {due.user?.lastName || "User"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {due.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[250px]">
                        <div>
                          <div className="font-medium text-sm truncate">
                            {due.investment?.title || "Unknown Investment"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getInvestmentTypeBadge(due.investment?.type)}
                            {due.investment?.investmentPeriod && (
                              <span className="text-xs text-muted-foreground">
                                {due.investment.investmentPeriod} months
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <div className="font-medium">
                          {formatCurrency(due.payoutAmount || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {due.currentPayoutPeriod}/{due.totalPayouts}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <div className="text-sm">
                          {due.nextPayoutDate
                            ? format(
                                new Date(due.nextPayoutDate),
                                "MMM d, yyyy"
                              )
                            : "N/A"}
                        </div>
                        {due.isOverdue && due.daysOverdue && (
                          <div className="text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {Math.round(due.daysOverdue)} days overdue
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        {getStatusBadge(due.payoutStatus)}
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(due.actualReturn || 0)} /{" "}
                            {formatCurrency(due.expectedReturn || 0)}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  due.progressPercentage || 0,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(due.progressPercentage || 0)}% complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-[100px]">
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
                              onClick={() => handleViewDue(due)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canApproveReject(due) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDue(due);
                                    setShowApproveDialog(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Approve Payout
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDue(due);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Reject Payout
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
          </Card>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden">
          <div className="grid gap-4">
            {investmentDues.map((due) => (
              <Card key={due._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {due.user?.firstName?.charAt(0) || "U"}
                        {due.user?.lastName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {due.user?.firstName || "Unknown"}{" "}
                        {due.user?.lastName || "User"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {due.investment?.title || "Unknown Investment"}
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
                      <DropdownMenuItem onClick={() => handleViewDue(due)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canApproveReject(due) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDue(due);
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve Payout
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDue(due);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Reject Payout
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Payout Amount:
                    </span>
                    <div className="font-medium">
                      {formatCurrency(due.payoutAmount || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Due Date:
                    </span>
                    <div className="font-medium">
                      {due.nextPayoutDate
                        ? format(new Date(due.nextPayoutDate), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Status:
                    </span>
                    <div className="mt-1">
                      {getStatusBadge(due.payoutStatus)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Type:</span>
                    <div className="mt-1">
                      {getInvestmentTypeBadge(due.investment?.type)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">
                      {Math.round(due.progressPercentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(due.progressPercentage || 0, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(due.actualReturn || 0)} /{" "}
                    {formatCurrency(due.expectedReturn || 0)}
                  </div>
                </div>

                {due.isOverdue && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Overdue by {Math.round(due.daysOverdue || 0)} days
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
              investment dues
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
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Investment Dues Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and approve investment payouts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading || isStatsLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isLoading || isStatsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            {/* <Button onClick={handleExportDues} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Investments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.totalInvestments
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                All active investments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payouts
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {isStatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.pendingPayouts
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.pendingPayoutAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isStatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.overduePayouts
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.overduePayoutAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isStatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.completedInvestments
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalActualReturns)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Investors
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isStatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.activeInvestorsCount
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(stats.completionRate)}% completion rate
              </p>
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
                  placeholder="Search by investor or investment..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="not_due">Not Due</SelectItem>
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
        <Tabs
          defaultValue="all"
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
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completed
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-xs sm:text-sm">
                Overdue
              </TabsTrigger>
              <TabsTrigger value="not_due" className="text-xs sm:text-sm">
                Not Due
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            <InvestmentDuesTable />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <InvestmentDuesTable />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <InvestmentDuesTable />
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <InvestmentDuesTable />
          </TabsContent>

          <TabsContent value="not_due" className="space-y-4">
            <InvestmentDuesTable />
          </TabsContent>
        </Tabs>

        {/* Investment Due Details Dialog */}
        {selectedDue && (
          <Dialog open={showDueDetails} onOpenChange={setShowDueDetails}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Investment Payout Details</DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedDue.investment?.title || "Unknown Investment"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getInvestmentTypeBadge(selectedDue.investment?.type)}
                      {getStatusBadge(selectedDue.payoutStatus)}
                      {selectedDue.isOverdue && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {Math.round(selectedDue.daysOverdue || 0)} days
                          overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatCurrency(selectedDue.payoutAmount || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due:{" "}
                      {selectedDue.nextPayoutDate
                        ? format(
                            new Date(selectedDue.nextPayoutDate),
                            "MMM d, yyyy"
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Investor</p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {selectedDue.user?.firstName?.charAt(0) || "U"}
                          {selectedDue.user?.lastName?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {selectedDue.user?.firstName || "Unknown"}{" "}
                          {selectedDue.user?.lastName || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedDue.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Investment Progress</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Actual Return:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedDue.actualReturn || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Expected Return:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedDue.expectedReturn || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              selectedDue.progressPercentage || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(selectedDue.progressPercentage || 0)}%
                        complete
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Payout Schedule</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Current Payout:</span>
                        <span className="font-medium">
                          {selectedDue.currentPayoutPeriod} of{" "}
                          {selectedDue.totalPayouts}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frequency:</span>
                        <span className="font-medium capitalize">
                          {selectedDue.investment?.payoutFrequency?.replace(
                            "_",
                            " "
                          ) || "Monthly"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining Payouts:</span>
                        <span className="font-medium">
                          {selectedDue.remainingPayouts}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Investment Details</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Investment ID:</span>
                        <span className="font-mono text-xs">
                          {selectedDue._id}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Return Rate:</span>
                        <span className="font-medium">
                          {selectedDue.investment?.returnRate || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span className="font-medium">
                          {selectedDue.investment?.investmentPeriod || 0} months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {canApproveReject(selectedDue) && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        This payout is due for approval. Approving will transfer{" "}
                        {formatCurrency(selectedDue.payoutAmount)} to the
                        investor's wallet.
                      </p>
                    </div>
                  </div>
                )}

                {selectedDue.isOverdue && (
                  <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        This payout is{" "}
                        {Math.round(selectedDue.daysOverdue || 0)} days overdue
                        and requires immediate attention.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {canApproveReject(selectedDue) ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowDueDetails(false);
                        setShowRejectDialog(true);
                      }}
                      className="w-full sm:w-auto"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Payout
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDueDetails(false);
                        setShowApproveDialog(true);
                      }}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Payout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowDueDetails(false)}
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
              <DialogTitle>Approve Investment Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Approve payout for{" "}
                    {formatCurrency(selectedDue?.payoutAmount || 0)}?
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    This action will transfer the funds to the investor's wallet
                    balance.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
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
                onClick={() => {
                  setShowApproveDialog(false);
                  setApprovalNotes("");
                }}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve Payout"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Investment Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    Reject payout for{" "}
                    {formatCurrency(selectedDue?.payoutAmount || 0)}?
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This action will mark the payout as failed and create a
                    rejection record.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please provide a detailed reason for rejection..."
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
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Payout"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export { InvestmentDuesManagement };
export default InvestmentDuesManagement;
