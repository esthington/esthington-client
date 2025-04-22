"use client"

import { useState } from "react"
import {
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Building,
  User,
  CreditCard,
  FileText,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import FadeIn from "@/components/animations/fade-in"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/lib/table-utils"
import { useManagement } from "@/contexts/management-context"
import { useManagementPermissions } from "@/hooks/use-management-permissions"

export function ApprovalsPage() {
  // Use the management context
  const {
    filteredApprovals,
    approvalFilter,
    setApprovalFilter,
    getApproval,
    approveRequest,
    rejectRequest,
    isLoading,
    isSubmitting,
  } = useManagement()

  // Use permissions hook (assuming admin role for this component)
  const { hasPermission } = useManagementPermissions("admin")

  const [selectedApproval, setSelectedApproval] = useState(null)
  const [showApprovalDetails, setShowApprovalDetails] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)

  const handleViewApproval = (approval) => {
    setSelectedApproval(approval)
    setShowApprovalDetails(true)
  }

  const handleApproveRequest = async (approval) => {
    if (approval.status === "pending") {
      await approveRequest(approval.id)
      if (selectedApproval?.id === approval.id) {
        setSelectedApproval({
          ...selectedApproval,
          status: "approved",
        })
      }
      setShowApprovalDetails(false)
    }
  }

  const handleRejectRequest = (approval) => {
    if (approval.status === "pending") {
      setSelectedApproval(approval)
      setShowRejectionDialog(true)
    }
  }

  const confirmRejection = async () => {
    await rejectRequest(selectedApproval.id, rejectionReason)
    setShowRejectionDialog(false)
    setShowApprovalDetails(false)
    setRejectionReason("")
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "property":
        return <Building className="h-4 w-4 text-blue-500" />
      case "withdrawal":
        return <CreditCard className="h-4 w-4 text-green-500" />
      case "kyc":
        return <User className="h-4 w-4 text-purple-500" />
      case "document":
        return <FileText className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
    },
    {
      accessorKey: "title",
      header: "Request",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.title}>
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <div className="flex items-center justify-center gap-2">
            {getTypeIcon(type)}
            <span className="capitalize">{type}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "user.name",
      header: "User",
      cell: ({ row }) => {
        const approval = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={approval.user.avatar || "/placeholder.svg"}
                alt={approval.user.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-sm">{approval.user.name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <div className="flex items-center justify-center gap-2">
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.original.date}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const approval = row.original
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewApproval(approval)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {approval.status === "pending" && hasPermission("approveRequests") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleApproveRequest(approval)}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRejectRequest(approval)}>
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Approval Requests</h1>
            <p className="text-muted-foreground">Manage pending approval requests</p>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setApprovalFilter}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredApprovals}
              searchPlaceholder="Search requests..."
              searchColumn="title"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredApprovals}
              searchPlaceholder="Search pending requests..."
              searchColumn="title"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredApprovals}
              searchPlaceholder="Search approved requests..."
              searchColumn="title"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredApprovals}
              searchPlaceholder="Search rejected requests..."
              searchColumn="title"
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Details Dialog */}
      {selectedApproval && (
        <Dialog open={showApprovalDetails} onOpenChange={setShowApprovalDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Approval Request Details</DialogTitle>
              <DialogDescription>Review the details of this approval request</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedApproval.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedApproval.type}
                    </Badge>
                    {getStatusBadge(selectedApproval.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {selectedApproval.date} • {selectedApproval.time}
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {selectedApproval.id}</div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm">{selectedApproval.description}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Submitted By</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img
                      src={selectedApproval.user.avatar || "/placeholder.svg"}
                      alt={selectedApproval.user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedApproval.user.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedApproval.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Render different details based on approval type */}
              {selectedApproval.type === "property" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm">{selectedApproval.details.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm">{formatCurrency(selectedApproval.details.price)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Images</p>
                    <p className="text-sm">{selectedApproval.details.images} images uploaded</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-sm">{selectedApproval.details.documents} documents uploaded</p>
                  </div>
                </div>
              )}

              {selectedApproval.type === "withdrawal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm">{formatCurrency(selectedApproval.details.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Bank Account</p>
                    <p className="text-sm">{selectedApproval.details.bankAccount}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm font-medium">Reason</p>
                    <p className="text-sm">{selectedApproval.details.reason}</p>
                  </div>
                </div>
              )}

              {selectedApproval.type === "kyc" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Document Type</p>
                    <p className="text-sm">{selectedApproval.details.documentType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Document Number</p>
                    <p className="text-sm">{selectedApproval.details.documentNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Expiry Date</p>
                    <p className="text-sm">{selectedApproval.details.documentExpiry}</p>
                  </div>
                </div>
              )}

              {selectedApproval.status === "pending" && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      This request is pending your approval
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedApproval.status === "pending" && hasPermission("approveRequests") ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectRequest(selectedApproval)}
                    className="w-full sm:w-auto"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Request
                  </Button>

                  <Button
                    onClick={() => handleApproveRequest(selectedApproval)}
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Approve Request"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setShowApprovalDetails(false)} className="w-full sm:w-auto">
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {selectedApproval && (
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this request</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full min-h-[100px] p-3 mt-2 rounded-md border border-input bg-background"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRejection}
                disabled={!rejectionReason.trim() || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Reject Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </FadeIn>
  )
}
