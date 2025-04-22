"use client"

import { useState } from "react"
import { MoreHorizontal, Ban, Trash2, Eye, CheckCircle, AlertTriangle, UserPlus, Key, ArrowUpDown } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FadeIn from "@/components/animations/fade-in"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/lib/table-utils"
import { useManagement } from "@/contexts/management-context"
import { useManagementPermissions } from "@/hooks/use-management-permissions"

export function AdminManagementPage() {
  // Use the management context
  const {
    filteredAdmins,
    adminFilter,
    setAdminFilter,
    getAdmin,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    suspendAdmin,
    activateAdmin,
    isLoading,
    isSubmitting,
  } = useManagement()

  // Use permissions hook (assuming super_admin role for this component)
  const { hasPermission } = useManagementPermissions("super_admin")

  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showAdminDetails, setShowAdminDetails] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)

  // New admin form state
  const [newAdminName, setNewAdminName] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState("admin")
  const [newAdminPermissions, setNewAdminPermissions] = useState([])

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin)
    setShowAdminDetails(true)
  }

  const handleSuspendAdmin = (admin) => {
    setSelectedAdmin(admin)
    setShowSuspendDialog(true)
  }

  const handleDeleteAdmin = (admin) => {
    setSelectedAdmin(admin)
    setShowDeleteDialog(true)
  }

  const handleResetPassword = (admin) => {
    setSelectedAdmin(admin)
    setShowResetPasswordDialog(true)
  }

  const confirmSuspend = async () => {
    if (selectedAdmin.status === "suspended") {
      await activateAdmin(selectedAdmin.id)
    } else {
      await suspendAdmin(selectedAdmin.id)
    }
    setShowSuspendDialog(false)
  }

  const confirmDelete = async () => {
    await deleteAdmin(selectedAdmin.id)
    setShowDeleteDialog(false)
  }

  const confirmResetPassword = () => {
    // In a real app, this would call an API to reset the password
    setShowResetPasswordDialog(false)
  }

  const handleAddAdmin = async () => {
    if (!newAdminName || !newAdminEmail) {
      return
    }

    const newAdmin = {
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
      permissions: newAdminPermissions.length > 0 ? newAdminPermissions : ["users_view", "properties_view"],
      activityLog: [],
    }

    await addAdmin(newAdmin)
    setShowAddAdminDialog(false)

    // Reset form
    setNewAdminName("")
    setNewAdminEmail("")
    setNewAdminRole("admin")
    setNewAdminPermissions([])
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "suspended":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Suspended</Badge>
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
      default:
        return null
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Admin",
      cell: ({ row }) => {
        const admin = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img src={admin.avatar || "/placeholder.svg"} alt={admin.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-medium">{admin.name}</div>
              <div className="text-sm text-muted-foreground">{admin.email}</div>
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
      cell: ({ row }) => <div className="text-center">{getRoleBadge(row.original.role)}</div>,
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
        const admin = row.original
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
                {hasPermission("viewAdmins") && (
                  <DropdownMenuItem onClick={() => handleViewAdmin(admin)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
                {hasPermission("suspendAdmins") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSuspendAdmin(admin)}>
                      <Ban className="mr-2 h-4 w-4" />
                      {admin.status === "suspended" ? "Activate Admin" : "Suspend Admin"}
                    </DropdownMenuItem>
                  </>
                )}
                {hasPermission("deleteAdmins") && (
                  <DropdownMenuItem
                    onClick={() => handleDeleteAdmin(admin)}
                    className="text-red-500 focus:text-red-500"
                    disabled={admin.role === "super_admin"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Admin
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
            <h1 className="text-2xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">Manage administrator accounts</p>
          </div>

          {hasPermission("createAdmins") && (
            <Button onClick={() => setShowAddAdminDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" onValueChange={setAdminFilter}>
          <TabsList>
            <TabsTrigger value="all">All Admins</TabsTrigger>
            <TabsTrigger value="super_admin">Super Admins</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredAdmins}
              searchPlaceholder="Search admins..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="super_admin" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredAdmins}
              searchPlaceholder="Search super admins..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredAdmins}
              searchPlaceholder="Search admins..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="suspended" className="mt-4">
            <DataTable
              columns={columns}
              data={filteredAdmins}
              searchPlaceholder="Search suspended admins..."
              searchColumn="name"
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Admin Details Dialog */}
      {selectedAdmin && (
        <Dialog open={showAdminDetails} onOpenChange={setShowAdminDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Admin Details</DialogTitle>
              <DialogDescription>Detailed information about the administrator</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden">
                  <img
                    src={selectedAdmin.avatar || "/placeholder.svg"}
                    alt={selectedAdmin.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{selectedAdmin.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedAdmin.role)}
                    {getStatusBadge(selectedAdmin.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm">{selectedAdmin.joinDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-sm">{selectedAdmin.lastActive}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAdmin.permissions.includes("all") ? (
                    <Badge className="bg-purple-500">All Permissions</Badge>
                  ) : (
                    <>
                      {selectedAdmin.permissions.includes("users_manage") && (
                        <Badge className="bg-blue-500">Manage Users</Badge>
                      )}
                      {selectedAdmin.permissions.includes("users_view") && (
                        <Badge className="bg-blue-300">View Users</Badge>
                      )}
                      {selectedAdmin.permissions.includes("properties_manage") && (
                        <Badge className="bg-green-500">Manage Properties</Badge>
                      )}
                      {selectedAdmin.permissions.includes("properties_view") && (
                        <Badge className="bg-green-300">View Properties</Badge>
                      )}
                      {selectedAdmin.permissions.includes("transactions_manage") && (
                        <Badge className="bg-amber-500">Manage Transactions</Badge>
                      )}
                      {selectedAdmin.permissions.includes("transactions_view") && (
                        <Badge className="bg-amber-300">View Transactions</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Activity</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedAdmin.activityLog.map((activity, index) => (
                    <div key={index} className="text-sm border-l-2 border-primary pl-3 py-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp} • {activity.target}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => handleResetPassword(selectedAdmin)} className="w-full sm:w-auto">
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </Button>

              {hasPermission("suspendAdmins") && (
                <Button
                  variant={selectedAdmin.status === "suspended" ? "default" : "secondary"}
                  onClick={() => handleSuspendAdmin(selectedAdmin)}
                  className="w-full sm:w-auto"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {selectedAdmin.status === "suspended" ? "Activate Admin" : "Suspend Admin"}
                </Button>
              )}

              {hasPermission("deleteAdmins") && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteAdmin(selectedAdmin)}
                  className="w-full sm:w-auto"
                  disabled={selectedAdmin.role === "super_admin"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Admin
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspend Dialog */}
      {selectedAdmin && (
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAdmin.status === "suspended" ? "Activate Admin" : "Suspend Admin"}</DialogTitle>
              <DialogDescription>
                {selectedAdmin.status === "suspended"
                  ? "Are you sure you want to activate this admin? They will regain access to the admin panel."
                  : "Are you sure you want to suspend this admin? They will lose access to the admin panel."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={selectedAdmin.avatar || "/placeholder.svg"}
                  alt={selectedAdmin.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedAdmin.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={selectedAdmin.status === "suspended" ? "default" : "secondary"}
                onClick={confirmSuspend}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : selectedAdmin.status === "suspended"
                    ? "Activate Admin"
                    : "Suspend Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {selectedAdmin && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Admin</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this admin? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={selectedAdmin.avatar || "/placeholder.svg"}
                  alt={selectedAdmin.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedAdmin.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={selectedAdmin.role === "super_admin" || isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Password Dialog */}
      {selectedAdmin && (
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Admin Password</DialogTitle>
              <DialogDescription>Send a password reset link to this admin's email address.</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={selectedAdmin.avatar || "/placeholder.svg"}
                  alt={selectedAdmin.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedAdmin.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmResetPassword}>Send Reset Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new administrator account</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Admin Role
              </label>
              <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="users_manage"
                    className="rounded border-gray-300"
                    checked={newAdminPermissions.includes("users_manage")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAdminPermissions([...newAdminPermissions, "users_manage"])
                      } else {
                        setNewAdminPermissions(newAdminPermissions.filter((p) => p !== "users_manage"))
                      }
                    }}
                  />
                  <label htmlFor="users_manage" className="text-sm">
                    Manage Users
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="properties_manage"
                    className="rounded border-gray-300"
                    checked={newAdminPermissions.includes("properties_manage")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAdminPermissions([...newAdminPermissions, "properties_manage"])
                      } else {
                        setNewAdminPermissions(newAdminPermissions.filter((p) => p !== "properties_manage"))
                      }
                    }}
                  />
                  <label htmlFor="properties_manage" className="text-sm">
                    Manage Properties
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="transactions_manage"
                    className="rounded border-gray-300"
                    checked={newAdminPermissions.includes("transactions_manage")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAdminPermissions([...newAdminPermissions, "transactions_manage"])
                      } else {
                        setNewAdminPermissions(newAdminPermissions.filter((p) => p !== "transactions_manage"))
                      }
                    }}
                  />
                  <label htmlFor="transactions_manage" className="text-sm">
                    Manage Transactions
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="all"
                    className="rounded border-gray-300"
                    checked={newAdminPermissions.includes("all")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAdminPermissions(["all"])
                      } else {
                        setNewAdminPermissions([])
                      }
                    }}
                  />
                  <label htmlFor="all" className="text-sm">
                    All Permissions
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={isSubmitting || !newAdminName || !newAdminEmail}>
              {isSubmitting ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  )
}
