"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
import Image from "next/image"
import { useInvestments } from "@/contexts/investments-context"
import type { Investment } from "@/contexts/investments-context"

export function AdminInvestmentsPage() {
  const router = useRouter()
  const {
    investments,
    isLoading,
    deleteInvestment,
    toggleFeatured,
    toggleTrending,
    changeInvestmentStatus,
    fetchInvestments,
  } = useInvestments()

  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<"active" | "pending" | "closed">("active")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  const handleViewInvestment = (investment: Investment) => {
    router.push(`/dashboard/admin/investments/${investment.id}`)
  }

  const handleEditInvestment = (investment: Investment) => {
    router.push(`/dashboard/admin/investments/edit/${investment.id}`)
  }

  const handleDeleteInvestment = (investment: Investment) => {
    setSelectedInvestment(investment)
    setShowDeleteDialog(true)
  }

  const handleChangeStatus = (investment: Investment, status: "active" | "pending" | "closed") => {
    setSelectedInvestment(investment)
    setNewStatus(status)
    setShowStatusDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedInvestment) {
      await deleteInvestment(selectedInvestment.id)
      setShowDeleteDialog(false)
    }
  }

  const confirmStatusChange = async () => {
    if (selectedInvestment) {
      await changeInvestmentStatus(selectedInvestment.id, newStatus)
      setShowStatusDialog(false)
    }
  }

  const handleToggleFeatured = async (id: string) => {
    await toggleFeatured(id)
  }

  const handleToggleTrending = async (id: string) => {
    await toggleTrending(id)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
      case "closed":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Closed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columns: ColumnDef<Investment>[] = [
    {
      accessorKey: "title",
      header: "Investment",
      cell: ({ row }) => {
        const investment = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden">
              <Image
                src={investment.images[0] || "/placeholder.svg"}
                alt={investment.title}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{investment.title}</div>
              <div className="text-sm text-muted-foreground">{investment.location}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Value
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.price)}</div>,
    },
    {
      accessorKey: "returnRate",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              ROI
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-200">
            {row.original.returnRate}%
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "funded",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Funded
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${row.original.funded}%` }} />
            </div>
            <span className="ml-2 text-sm">{row.original.funded}%</span>
          </div>
        </div>
      ),
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
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.original.createdAt}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const investment = row.original
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
                <DropdownMenuItem onClick={() => handleViewInvestment(investment)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditInvestment(investment)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Investment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleToggleFeatured(investment.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  {investment.featured ? "Remove Featured" : "Mark as Featured"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleTrending(investment.id)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {investment.trending ? "Remove Trending" : "Mark as Trending"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {investment.status !== "active" && (
                  <DropdownMenuItem onClick={() => handleChangeStatus(investment, "active")}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Activate
                  </DropdownMenuItem>
                )}
                {investment.status !== "pending" && (
                  <DropdownMenuItem onClick={() => handleChangeStatus(investment, "pending")}>
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                    Set to Pending
                  </DropdownMenuItem>
                )}
                {investment.status !== "closed" && (
                  <DropdownMenuItem onClick={() => handleChangeStatus(investment, "closed")}>
                    <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                    Close Investment
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteInvestment(investment)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Investment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const filteredInvestments = () => {
    switch (activeTab) {
      case "active":
        return investments.filter((inv) => inv.status === "active")
      case "pending":
        return investments.filter((inv) => inv.status === "pending")
      case "closed":
        return investments.filter((inv) => inv.status === "closed")
      case "featured":
        return investments.filter((inv) => inv.featured)
      default:
        return investments
    }
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Investment Management</h1>
            <p className="text-muted-foreground">Create and manage investment opportunities</p>
          </div>
          <Button onClick={() => router.push("/dashboard/admin/investments/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Investment
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Investments</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredInvestments()}
              searchPlaceholder="Search investments..."
              searchColumn="title"
            />
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredInvestments()}
              searchPlaceholder="Search active investments..."
              searchColumn="title"
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredInvestments()}
              searchPlaceholder="Search pending investments..."
              searchColumn="title"
            />
          </TabsContent>

          <TabsContent value="closed" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredInvestments()}
              searchPlaceholder="Search closed investments..."
              searchColumn="title"
            />
          </TabsContent>

          <TabsContent value="featured" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredInvestments()}
              searchPlaceholder="Search featured investments..."
              searchColumn="title"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      {selectedInvestment && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Investment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this investment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={selectedInvestment.images[0] || "/placeholder.svg"}
                  alt={selectedInvestment.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedInvestment.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedInvestment.location}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Investment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Change Dialog */}
      {selectedInvestment && (
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Investment Status</DialogTitle>
              <DialogDescription>
                {newStatus === "active"
                  ? "Are you sure you want to activate this investment? It will be visible to all users."
                  : newStatus === "pending"
                    ? "Are you sure you want to set this investment to pending? It will be hidden from users."
                    : "Are you sure you want to close this investment? No new investments will be accepted."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={selectedInvestment.images[0] || "/placeholder.svg"}
                  alt={selectedInvestment.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedInvestment.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">Current status:</span>
                  {getStatusBadge(selectedInvestment.status)}
                </div>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm font-medium mb-2">New status:</p>
              {getStatusBadge(newStatus)}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={newStatus === "active" ? "default" : newStatus === "pending" ? "secondary" : "outline"}
                onClick={confirmStatusChange}
              >
                Confirm Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </FadeIn>
  )
}
