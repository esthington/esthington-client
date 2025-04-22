"use client"

import { useState } from "react"
import {
  DollarSign,
  MoreHorizontal,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  CreditCard,
  Wallet,
  Building,
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

export function TransactionManagementPage() {
  // Use the management context
  const {
    filteredTransactions,
    transactionFilter,
    setTransactionFilter,
    getTransaction,
    approveTransaction,
    rejectTransaction,
    isLoading,
    isSubmitting,
  } = useManagement()

  // Use permissions hook (assuming admin role for this component)
  const { hasPermission } = useManagementPermissions("admin")

  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetails(true)
  }

  const handleApproveTransaction = async (transaction) => {
    if (transaction.status === "pending") {
      await approveTransaction(transaction.id)
      if (selectedTransaction?.id === transaction.id) {
        setSelectedTransaction({
          ...selectedTransaction,
          status: "completed",
        })
      }
    }
  }

  const handleRejectTransaction = async (transaction) => {
    if (transaction.status === "pending") {
      await rejectTransaction(transaction.id)
      if (selectedTransaction?.id === transaction.id) {
        setSelectedTransaction({
          ...selectedTransaction,
          status: "failed",
        })
      }
    }
  }

  const handleExportTransactions = () => {
    // In a real app, this would call an API to export transactions
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "purchase":
        return <Building className="h-4 w-4 text-blue-500" />
      case "investment":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case "bank_transfer":
        return <Building className="h-4 w-4 text-purple-500" />
      case "wallet":
        return <Wallet className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4" />
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
    },
    {
      accessorKey: "user.name",
      header: "User",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={transaction.user.avatar || "/placeholder.svg"}
                alt={transaction.user.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-sm">{transaction.user.name}</div>
          </div>
        )
      },
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
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.amount)}</div>,
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
        const transaction = row.original
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
                <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {transaction.status === "pending" && hasPermission("approveTransactions") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleApproveTransaction(transaction)}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRejectTransaction(transaction)}>
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
            <h1 className="text-2xl font-bold">Transaction Management</h1>
            <p className="text-muted-foreground">Monitor and manage all financial transactions</p>
          </div>

          {hasPermission("exportReports") && (
            <Button variant="outline" onClick={handleExportTransactions}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" onValueChange={setTransactionFilter}>
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredTransactions}
              searchPlaceholder="Search transactions..."
              searchColumn="id"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="purchases" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredTransactions}
              searchPlaceholder="Search purchases..."
              searchColumn="id"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="investments" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredTransactions}
              searchPlaceholder="Search investments..."
              searchColumn="id"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredTransactions}
              searchPlaceholder="Search withdrawals..."
              searchColumn="id"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="deposits" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredTransactions}
              searchPlaceholder="Search deposits..."
              searchColumn="id"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredTransactions}
              searchPlaceholder="Search pending transactions..."
              searchColumn="id"
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Detailed information about the transaction</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTransaction.id}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedTransaction.type}
                    </Badge>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(selectedTransaction.amount)}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTransaction.date} • {selectedTransaction.time}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">User</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <img
                        src={selectedTransaction.user.avatar || "/placeholder.svg"}
                        alt={selectedTransaction.user.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedTransaction.user.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedTransaction.user.email}</p>
                    </div>
                  </div>
                </div>

                {selectedTransaction.property && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Property</p>
                    <p className="text-sm">{selectedTransaction.property.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedTransaction.property.location}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm font-medium">Payment Method</p>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                    <p className="text-sm capitalize">{selectedTransaction.paymentMethod.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Reference</p>
                  <p className="text-sm">{selectedTransaction.reference}</p>
                </div>
              </div>

              {selectedTransaction.status === "pending" && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      This transaction is pending approval
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedTransaction.status === "pending" && hasPermission("approveTransactions") ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectTransaction(selectedTransaction)
                      setShowTransactionDetails(false)
                    }}
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Reject Transaction"}
                  </Button>

                  <Button
                    onClick={() => {
                      handleApproveTransaction(selectedTransaction)
                      setShowTransactionDetails(false)
                    }}
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Approve Transaction"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setShowTransactionDetails(false)} className="w-full sm:w-auto">
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </FadeIn>
  )
}
