"use client"

import { useState } from "react"
import { MoreHorizontal, Ban, Trash2, Eye, Mail, CheckCircle, XCircle, AlertTriangle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { esthingtonCompanies } from "@/lib/company-data"
import Image from "next/image"
import { useManagement } from "@/contexts/management-context"
import { useManagementPermissions } from "@/hooks/use-management-permissions"

export function UserManagementPage() {
  // Use the management context
  const {
    filteredUsers,
    userFilter,
    setUserFilter,
    getUser,
    updateUser,
    deleteUser,
    blacklistUser,
    unblacklistUser,
    isLoading,
    isSubmitting,
  } = useManagement()

  // Use permissions hook (assuming admin role for this component)
  const { hasPermission } = useManagementPermissions("admin")

  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleBlacklistUser = (user) => {
    setSelectedUser(user)
    setShowBlacklistDialog(true)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleEmailUser = (user) => {
    setSelectedUser(user)
    setShowEmailDialog(true)
  }

  const confirmBlacklist = async () => {
    if (selectedUser.status === "blacklisted") {
      await unblacklistUser(selectedUser.id)
    } else {
      await blacklistUser(selectedUser.id)
    }
    setShowBlacklistDialog(false)
  }

  const confirmDelete = async () => {
    await deleteUser(selectedUser.id)
    setShowDeleteDialog(false)
  }

  const confirmSendEmail = () => {
    // In a real app, this would call an API to send the email
    setShowEmailDialog(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "suspended":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Suspended</Badge>
      case "blacklisted":
        return <Badge className="bg-red-500 hover:bg-red-600">Blacklisted</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "suspended":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "blacklisted":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Role
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline" className="capitalize">
            {row.original.role}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: () => <div className="text-center">Company</div>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-center">
            {user.companyId ? (
              <div className="flex items-center justify-center">
                {(() => {
                  const company = esthingtonCompanies.find((c) => c.id === user.companyId)
                  return company ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2 relative">
                        <Image
                          src={company.logo || "/placeholder.svg"}
                          alt={company.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <span>{company.name}</span>
                    </div>
                  ) : (
                    <span>-</span>
                  )
                })()}
              </div>
            ) : (
              <span>-</span>
            )}
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
      accessorKey: "joinDate",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Joined
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.original.joinDate}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
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
                {hasPermission("viewUsers") && (
                  <DropdownMenuItem onClick={() => handleViewUser(user)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleEmailUser(user)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                {hasPermission("blacklistUsers") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBlacklistUser(user)}>
                      <Ban className="mr-2 h-4 w-4" />
                      {user.status === "blacklisted" ? "Remove from Blacklist" : "Blacklist User"}
                    </DropdownMenuItem>
                  </>
                )}
                {hasPermission("deleteUsers") && (
                  <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
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
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users on the platform</p>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setUserFilter}>
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="blacklisted">Blacklisted</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchPlaceholder="Search users..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="buyers" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchPlaceholder="Search buyers..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="agents" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchPlaceholder="Search agents..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="blacklisted" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchPlaceholder="Search blacklisted users..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about the user</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden">
                  <img
                    src={selectedUser.avatar || "/placeholder.svg"}
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedUser.role}
                    </Badge>
                    {getStatusBadge(selectedUser.status)}
                    {selectedUser.verified ? (
                      <Badge variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500 hover:bg-gray-600 text-white">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm">{selectedUser.joinDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-sm">{selectedUser.lastActive}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Transactions</p>
                  <p className="text-sm">{selectedUser.transactions}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Properties</p>
                  <p className="text-sm">{selectedUser.properties}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Wallet Balance</p>
                  <p className="text-sm">${selectedUser.walletBalance?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => handleEmailUser(selectedUser)} className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Email User
              </Button>

              {hasPermission("blacklistUsers") && (
                <Button
                  variant={selectedUser.status === "blacklisted" ? "outline" : "destructive"}
                  onClick={() => handleBlacklistUser(selectedUser)}
                  className="w-full sm:w-auto"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {selectedUser.status === "blacklisted" ? "Remove from Blacklist" : "Blacklist User"}
                </Button>
              )}

              {hasPermission("deleteUsers") && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Blacklist Dialog */}
      {selectedUser && (
        <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser.status === "blacklisted" ? "Remove from Blacklist" : "Blacklist User"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser.status === "blacklisted"
                  ? "Are you sure you want to remove this user from the blacklist? They will regain access to the platform."
                  : "Are you sure you want to blacklist this user? They will lose access to the platform."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={selectedUser.avatar || "/placeholder.svg"}
                  alt={selectedUser.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlacklistDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={selectedUser.status === "blacklisted" ? "default" : "destructive"}
                onClick={confirmBlacklist}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : selectedUser.status === "blacklisted"
                    ? "Remove from Blacklist"
                    : "Blacklist User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {selectedUser && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={selectedUser.avatar || "/placeholder.svg"}
                  alt={selectedUser.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Dialog */}
      {selectedUser && (
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send Email to User</DialogTitle>
              <DialogDescription>Compose an email to send to {selectedUser.name}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={selectedUser.avatar || "/placeholder.svg"}
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="body" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSendEmail}>Send Email</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </FadeIn>
  )
}
