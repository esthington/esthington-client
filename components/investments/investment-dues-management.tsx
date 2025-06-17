"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet, type InvestmentDue, type InvestmentDueStats } from "@/contexts/wallet-context"
import { useAuth } from "@/contexts/auth-context"

function InvestmentDuesManagement() {
  const { toast } = useToast()
  const { isAdmin, isSuperAdmin } = useAuth()
  const { getInvestmentDues, getInvestmentDueStats, approveInvestmentDue, rejectInvestmentDue } = useWallet()

  const [investmentDues, setInvestmentDues] = useState<InvestmentDue[]>([])
  const [stats, setStats] = useState<InvestmentDueStats>({
    total: 0,
    pending: 0,
    paid: 0,
    failed: 0,
    overdue: 0,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    activeInvestors: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDue, setSelectedDue] = useState<InvestmentDue | null>(null)
  const [showDueDetails, setShowDueDetails] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isSuperAdmin

  // Fetch investment dues stats
  const fetchInvestmentDueStats = async () => {
    try {
      const statsData = await getInvestmentDueStats()
      if (statsData && typeof statsData === "object") {
        setStats({
          total: Number(statsData.total) || 0,
          pending: Number(statsData.pending) || 0,
          paid: Number(statsData.paid) || 0,
          failed: Number(statsData.failed) || 0,
          overdue: Number(statsData.overdue) || 0,
          totalAmount: Number(statsData.totalAmount) || 0,
          pendingAmount: Number(statsData.pendingAmount) || 0,
          paidAmount: Number(statsData.paidAmount) || 0,
          overdueAmount: Number(statsData.overdueAmount) || 0,
          activeInvestors: Number(statsData.activeInvestors) || 0,
        })
      }
    } catch (error: any) {
      console.error("Error fetching investment due stats:", error)
    }
  }

  // Fetch investment dues
  const fetchInvestmentDues = async () => {
    if (!hasAdminAccess) return

    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "nextPayoutDate",
      }

      // Add filters
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== "all") params.status = statusFilter
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      // Handle tab-based filtering
      if (activeTab !== "all") {
        params.status = activeTab
      }

      const response = await getInvestmentDues(params)
      setInvestmentDues(response.dues || [])
      setTotalCount(response.totalCount || 0)
      setTotalPages(response.totalPages || 0)

      // Fetch stats separately
      await fetchInvestmentDueStats()
    } catch (error: any) {
      console.error("Error fetching investment dues:", error)
      toast({
        title: "Error",
        description: "Failed to fetch investment dues. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when filters change
  useEffect(() => {
    if (hasAdminAccess) {
      const timeoutId = setTimeout(() => {
        fetchInvestmentDues()
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, statusFilter, startDate, endDate, activeTab, currentPage, hasAdminAccess])

  // Handle approve investment due
  const handleApprove = async () => {
    if (!selectedDue) return

    setIsSubmitting(true)
    try {
      const success = await approveInvestmentDue(selectedDue.payoutId, approvalNotes)
      if (success) {
        setShowApproveDialog(false)
        setApprovalNotes("")
        fetchInvestmentDues()
        toast({
          title: "Success",
          description: "Investment payout approved. Funds moved from pending to main balance.",
        })
      }
    } catch (error: any) {
      console.error("Error approving investment due:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reject investment due
  const handleReject = async () => {
    if (!selectedDue || !rejectReason.trim()) return

    setIsSubmitting(true)
    try {
      const success = await rejectInvestmentDue(selectedDue.payoutId, rejectReason)
      if (success) {
        setShowRejectDialog(false)
        setRejectReason("")
        fetchInvestmentDues()
      }
    } catch (error: any) {
      console.error("Error rejecting investment due:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle view investment due details
  const handleViewDue = (due: InvestmentDue) => {
    setSelectedDue(due)
    setShowDueDetails(true)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Export investment dues
  const handleExportDues = () => {
    toast({
      title: "Export Started",
      description: "Your investment dues export will be ready shortly.",
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      case "not_due":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Lock className="mr-1 h-3 w-3" />
            Not Due
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Get investment type badge
  const getInvestmentTypeBadge = (type?: string) => {
    switch (type) {
      case "property":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Building className="mr-1 h-3 w-3" />
            Property
          </Badge>
        )
      case "rental":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Building className="mr-1 h-3 w-3" />
            Rental
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Investment
          </Badge>
        )
    }
  }

  // Check if actions are allowed for this investment
  const canApproveReject = (due: any) => {
    return due.canApproveReject && due.status === "pending"
  }

  // Check if user has admin access
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You don't have permission to view investment dues management.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Investment Dues Table Component
  function InvestmentDuesTable() {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading investment dues...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (investmentDues.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No investment dues found</p>
              <p className="text-sm text-muted-foreground">No investments match your current filters</p>
            </div>
          </CardContent>
        </Card>
      )
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
                    <TableHead className="font-semibold w-[200px] min-w-[200px]">Investor</TableHead>
                    <TableHead className="font-semibold w-[250px] min-w-[250px]">Investment</TableHead>
                    <TableHead className="font-semibold w-[120px] min-w-[120px]">Due Amount</TableHead>
                    <TableHead className="font-semibold w-[120px] min-w-[120px]">Due Date</TableHead>
                    <TableHead className="font-semibold w-[120px] min-w-[120px]">Status</TableHead>
                    <TableHead className="font-semibold w-[150px] min-w-[150px]">Progress</TableHead>
                    <TableHead className="text-right font-semibold w-[100px] min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investmentDues.map((due) => (
                    <TableRow key={due._id} className="hover:bg-muted/30">
                      <TableCell className="w-[200px] min-w-[200px]">
                        <div className="flex items-center gap-3 max-w-[180px]">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {due.user.firstName.charAt(0)}
                              {due.user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {due.user.firstName} {due.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{due.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[250px] min-w-[250px]">
                        <div className="max-w-[230px]">
                          <div className="font-medium text-sm truncate">{due.investment.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {getInvestmentTypeBadge(due.investment.type)}
                            {due.investment.duration && (
                              <span className="text-xs text-muted-foreground">{due.investment.duration} months</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            Property: {due.investment.propertyId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px]">
                        <div className="font-medium">{formatCurrency(due.amount)}</div>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px]">
                        <div className="text-sm">{format(new Date(due.nextPayoutDate), "MMM d, yyyy")}</div>
                        <div className="text-xs text-muted-foreground">
                          {due.isOverdue ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </span>
                          ) : due.status === "pending" ? (
                            <span className="text-gray-600 flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Not Due
                            </span>
                          ) : (
                            "Due"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[120px]">{getStatusBadge(due.status)}</TableCell>
                      <TableCell className="w-[150px] min-w-[150px]">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(due.actualReturn)} / {formatCurrency(due.expectedReturn)}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min(due.progressPercentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(due.progressPercentage)}% complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-[100px] min-w-[100px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                    setSelectedDue(due)
                                    setShowApproveDialog(true)
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Approve Payout
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDue(due)
                                    setShowRejectDialog(true)
                                  }}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Reject Payout
                                </DropdownMenuItem>
                              </>
                            )}
                            {!canApproveReject(due) && due.status !== "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled>
                                  <Lock className="mr-2 h-4 w-4 text-gray-400" />
                                  Actions Disabled
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
            {investmentDues.map((due) => (
              <Card key={due._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {due.user.firstName.charAt(0)}
                        {due.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {due.user.firstName} {due.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{due.investment.title}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
                              setSelectedDue(due)
                              setShowApproveDialog(true)
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve Payout
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDue(due)
                              setShowRejectDialog(true)
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
                    <span className="text-muted-foreground text-sm">Due Amount:</span>
                    <div className="font-medium">{formatCurrency(due.amount)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Due Date:</span>
                    <div className="font-medium">{format(new Date(due.nextPayoutDate), "MMM d, yyyy")}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Status:</span>
                    <div className="mt-1">{getStatusBadge(due.status)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Type:</span>
                    <div className="mt-1">{getInvestmentTypeBadge(due.investment.type)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">{Math.round(due.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(due.progressPercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(due.actualReturn)} / {formatCurrency(due.expectedReturn)}
                  </div>
                </div>

                {due.isOverdue && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Overdue Payment</span>
                    </div>
                  </div>
                )}

                {due.status === "pending" && (
                  <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-medium">Payout Not Due Yet</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
              {totalCount} investment dues
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
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 overflow-x-hidden">
      <div className="w-full max-w-full">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Investment Dues Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage and approve investment payouts (all investments shown)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchInvestmentDues} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExportDues} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All investments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.pendingAmount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.overdueAmount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.paidAmount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.activeInvestors}</div>
                <p className="text-xs text-muted-foreground">Unique investors</p>
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
                    <SelectItem value="paid">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 min-w-max">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs sm:text-sm">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="text-xs sm:text-sm">
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs sm:text-sm">
                    Failed
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="text-xs sm:text-sm">
                    Overdue
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-4">
                <InvestmentDuesTable />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <InvestmentDuesTable />
              </TabsContent>

              <TabsContent value="paid" className="space-y-4">
                <InvestmentDuesTable />
              </TabsContent>

              <TabsContent value="failed" className="space-y-4">
                <InvestmentDuesTable />
              </TabsContent>

              <TabsContent value="overdue" className="space-y-4">
                <InvestmentDuesTable />
              </TabsContent>
            </Tabs>
          </div>

          {/* Investment Due Details Dialog */}
          {selectedDue && (
            <Dialog open={showDueDetails} onOpenChange={setShowDueDetails}>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Investment Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedDue.investment.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getInvestmentTypeBadge(selectedDue.investment.type)}
                        {getStatusBadge(selectedDue.status)}
                        {selectedDue.isOverdue && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatCurrency(selectedDue.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {format(new Date(selectedDue.nextPayoutDate), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Investor</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {selectedDue.user.firstName.charAt(0)}
                            {selectedDue.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedDue.user.firstName} {selectedDue.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{selectedDue.user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Investment Details</p>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedDue.investment.title}</p>
                          <p className="text-xs text-muted-foreground">Property: {selectedDue.investment.propertyId}</p>
                          {selectedDue.investment.duration && (
                            <p className="text-xs text-muted-foreground">
                              Duration: {selectedDue.investment.duration} months
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Investment Progress</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Actual Return:</span>
                          <span className="font-medium">{formatCurrency(selectedDue.actualReturn)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Expected Return:</span>
                          <span className="font-medium">{formatCurrency(selectedDue.expectedReturn)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(selectedDue.progressPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(selectedDue.progressPercentage)}% complete
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Payout History</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedDue.payouts && selectedDue.payouts.length > 0 ? (
                          selectedDue.payouts.map((payout, index) => (
                            <div key={payout._id || index} className="flex justify-between items-center text-sm">
                              <span>{format(new Date(payout.date), "MMM d, yyyy")}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(payout.amount)}</span>
                                {getStatusBadge(payout.status)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No payout history available</p>
                        )}
                      </div>
                    </div>

                    {selectedDue.adminNotes && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">Admin Notes</p>
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">{selectedDue.adminNotes}</div>
                      </div>
                    )}

                    {selectedDue.rejectionReason && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm font-medium">Rejection Reason</p>
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedDue.rejectionReason}</div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Investment ID</p>
                      <p className="text-sm font-mono">{selectedDue.payoutId}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm">{format(new Date(selectedDue.updatedAt), "MMM d, yyyy HH:mm")}</p>
                    </div>
                  </div>

                  {selectedDue.status === "pending" && canApproveReject(selectedDue) && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          This investment payout is due for approval. Approving will move funds to the investor's
                          wallet.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDue.status === "pending" && (
                    <div className="bg-gray-50 dark:bg-gray-950/30 p-3 rounded-md border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                          This investment payout is not due yet. Actions are disabled until the payout date.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDue.isOverdue && (
                    <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                          This payout is overdue and requires immediate attention.
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
                          setShowDueDetails(false)
                          setShowRejectDialog(true)
                        }}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Payout
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDueDetails(false)
                          setShowApproveDialog(true)
                        }}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Payout
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setShowDueDetails(false)} className="w-full sm:w-auto">
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
                      Approve payout for {formatCurrency(selectedDue?.amount || 0)}?
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      This action will add the funds to the investor's wallet balance.
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
                  onClick={() => setShowApproveDialog(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button onClick={handleApprove} disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? "Approving..." : "Approve Payout"}
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
                      Reject payout for {formatCurrency(selectedDue?.amount || 0)}?
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      This action will mark the payout as failed and may require manual intervention.
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
                  {isSubmitting ? "Rejecting..." : "Reject Payout"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export { InvestmentDuesManagement }
export default InvestmentDuesManagement
