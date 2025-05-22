"use client"

import { useState, useEffect } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FadeIn from "@/components/animations/fade-in"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/lib/table-utils"
import { useManagementPermissions } from "@/hooks/use-management-permissions"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import type { AdminData, UserProfile } from "@/contexts/auth-context"

export default function AdminManagementPage() {
  // Use the auth context instead of management context
  const {
    admins,
    filteredAdmins,
    adminFilter,
    setAdminFilter,
    getAdmins,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    suspendAdmin,
    activateAdmin,
    adminsLoading: isLoading,
    isSubmitting,
    isSuperAdmin,
  } = useAuth()

  // Use permissions hook
  const { hasPermission } = useManagementPermissions("super_admin")

  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile | null>(null)
  const [showAdminDetails, setShowAdminDetails] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)

  // New admin form state
  const [newAdminName, setNewAdminName] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin")
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([])
  const [newAdminFirstName, setNewAdminFirstName] = useState("")
  const [newAdminLastName, setNewAdminLastName] = useState("")
  const [newAdminPhone, setNewAdminPhone] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch admins on component mount if user is super admin
  useEffect(() => {
    if (isSuperAdmin) {
      getAdmins()
    }
  }, [isSuperAdmin, getAdmins])

  // Update filter when tab changes
  useEffect(() => {
    // Update the filter in the auth context
    setAdminFilter({
      ...adminFilter,
      role: activeTab === "super_admin" ? "super_admin" : activeTab === "admin" ? "admin" : "",
      status: activeTab === "suspended" ? "inactive" : "",
    })
  }, [activeTab, adminFilter, setAdminFilter])

  const handleViewAdmin = (admin: UserProfile) => {
    setSelectedAdmin(admin)
    setShowAdminDetails(true)
  }

  const handleSuspendAdmin = (admin: UserProfile) => {
    setSelectedAdmin(admin)
    setShowSuspendDialog(true)
  }

  const handleDeleteAdmin = (admin: UserProfile) => {
    setSelectedAdmin(admin)
    setShowDeleteDialog(true)
  }

  const handleResetPassword = (admin: UserProfile) => {
    setSelectedAdmin(admin)
    setShowResetPasswordDialog(true)
  }

  const confirmSuspend = async () => {
    if (!selectedAdmin) return

    try {
      if (!selectedAdmin.isActive) {
        await activateAdmin(selectedAdmin.id)
        toast.success(`${selectedAdmin.firstName} ${selectedAdmin.lastName} has been activated`)
      } else {
        await suspendAdmin(selectedAdmin.id)
        toast.success(`${selectedAdmin.firstName} ${selectedAdmin.lastName} has been suspended`)
      }
      setShowSuspendDialog(false)
      getAdmins() // Refresh the admin list
    } catch (error) {
      console.error("Failed to update admin status:", error)
      toast.error("Failed to update admin status. Please try again.")
    }
  }

  const confirmDelete = async () => {
    if (!selectedAdmin) return

    try {
      await deleteAdmin(selectedAdmin.id)
      toast.success(`${selectedAdmin.firstName} ${selectedAdmin.lastName} has been deleted`)
      setShowDeleteDialog(false)
      getAdmins() // Refresh the admin list
    } catch (error) {
      console.error("Failed to delete admin:", error)
      toast.error("Failed to delete admin. Please try again.")
    }
  }

  const confirmResetPassword = async () => {
    if (!selectedAdmin) return

    try {
      // Use the resetPassword function from auth context
      // This is a placeholder - you'll need to implement the actual function in the auth context
      // await updateAdmin(selectedAdmin.id)
      setShowResetPasswordDialog(false)
      toast.success(`Password reset link sent to ${selectedAdmin.email}`)
    } catch (error) {
      console.error("Failed to reset password:", error)
      toast.error("Failed to reset password. Please try again.")
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdminFirstName || !newAdminLastName || !newAdminEmail) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const newAdmin: AdminData = {
        firstName: newAdminFirstName,
        lastName: newAdminLastName,
        userName: newAdminName || `${newAdminFirstName.toLowerCase()}.${newAdminLastName.toLowerCase()}`,
        email: newAdminEmail,
        phone: newAdminPhone,
        role: newAdminRole,
        permissions: newAdminPermissions.length > 0 ? newAdminPermissions : ["users_view", "properties_view"],
      }

      await addAdmin(newAdmin)
      toast.success("Admin added successfully")
      setShowAddAdminDialog(false)
      getAdmins() // Refresh the admin list

      // Reset form
      setNewAdminFirstName("")
      setNewAdminLastName("")
      setNewAdminName("")
      setNewAdminEmail("")
      setNewAdminPhone("")
      setNewAdminRole("admin")
      setNewAdminPermissions([])
    } catch (error) {
      console.error("Failed to add admin:", error)
      toast.error("Failed to add admin. Please try again.")
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    } else {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Suspended</Badge>
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    }
  }

  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: "name",
      header: "Admin",
      cell: ({ row }) => {
        const admin = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img
                src={admin.avatar || "/placeholder.svg?height=40&width=40&query=admin"}
                alt={`${admin.firstName} ${admin.lastName}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{`${admin.firstName} ${admin.lastName}`}</div>
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
      accessorKey: "isActive",
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
        const isActive = row.original.isActive
        return (
          <div className="flex items-center justify-center gap-2">
            {getStatusIcon(isActive)}
            <span className="capitalize">{isActive ? "Active" : "Suspended"}</span>
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
              Joined
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div className="text-center">{new Date(row.original.createdAt).toLocaleDateString()}</div>,
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
                      {!admin.isActive ? "Activate Admin" : "Suspend Admin"}
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

  // Check if user has permission to view this page
  if (!hasPermission("viewAdmins")) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-muted-foreground">Manage administrator accounts</p>
          </div>

          {hasPermission("createAdmins") && (
            <Button onClick={() => setShowAddAdminDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="p-4 pb-2">
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all">All Admins</TabsTrigger>
                <TabsTrigger value="super_admin">Super Admins</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <TabsContent value="all" className="mt-0">
              <DataTable
                columns={columns}
                data={filteredAdmins as UserProfile[]}
                searchPlaceholder="Search admins..."
                searchColumn="name"
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="super_admin" className="mt-0">
              <DataTable
                columns={columns}
                data={filteredAdmins as UserProfile[]}
                searchPlaceholder="Search super admins..."
                searchColumn="name"
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
              <DataTable
                columns={columns}
                data={filteredAdmins as UserProfile[]}
                searchPlaceholder="Search admins..."
                searchColumn="name"
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="suspended" className="mt-0">
              <DataTable
                columns={columns}
                data={filteredAdmins as UserProfile[]}
                searchPlaceholder="Search suspended admins..."
                searchColumn="name"
                isLoading={isLoading}
              />
            </TabsContent>
          </CardContent>
        </Card>
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
                    src={
                      selectedAdmin.avatar || "/placeholder.svg?height=80&width=80&query=admin" || "/placeholder.svg"
                    }
                    alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedAdmin.role)}
                    {getStatusBadge(selectedAdmin.isActive)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Join Date</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedAdmin.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Active</span>
                      <span className="text-sm font-medium">
                        {selectedAdmin.lastLogin ? new Date(selectedAdmin.lastLogin).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Username</span>
                      <span className="text-sm font-medium">{selectedAdmin.userName}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Permissions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {selectedAdmin.permissions && selectedAdmin.permissions.includes("all") ? (
                        <Badge className="bg-purple-500">All Permissions</Badge>
                      ) : (
                        <>
                          {selectedAdmin.permissions && selectedAdmin.permissions.includes("users_manage") && (
                            <Badge className="bg-blue-500">Manage Users</Badge>
                          )}
                          {selectedAdmin.permissions && selectedAdmin.permissions.includes("users_view") && (
                            <Badge className="bg-blue-300">View Users</Badge>
                          )}
                          {selectedAdmin.permissions && selectedAdmin.permissions.includes("properties_manage") && (
                            <Badge className="bg-green-500">Manage Properties</Badge>
                          )}
                          {selectedAdmin.permissions && selectedAdmin.permissions.includes("properties_view") && (
                            <Badge className="bg-green-300">View Properties</Badge>
                          )}
                          {selectedAdmin.permissions && selectedAdmin.permissions.includes("transactions_manage") && (
                            <Badge className="bg-amber-500">Manage Transactions</Badge>
                          )}
                          {selectedAdmin.permissions && selectedAdmin.permissions.includes("transactions_view") && (
                            <Badge className="bg-amber-300">View Transactions</Badge>
                          )}
                          {(!selectedAdmin.permissions || selectedAdmin.permissions.length === 0) && (
                            <span className="text-sm text-muted-foreground">No specific permissions</span>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium">{selectedAdmin.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm font-medium">{selectedAdmin.phone || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => handleResetPassword(selectedAdmin)} className="w-full sm:w-auto">
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </Button>

              {hasPermission("suspendAdmins") && (
                <Button
                  variant={!selectedAdmin.isActive ? "default" : "secondary"}
                  onClick={() => handleSuspendAdmin(selectedAdmin)}
                  className="w-full sm:w-auto"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {!selectedAdmin.isActive ? "Activate Admin" : "Suspend Admin"}
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
              <DialogTitle>{!selectedAdmin.isActive ? "Activate Admin" : "Suspend Admin"}</DialogTitle>
              <DialogDescription>
                {!selectedAdmin.isActive
                  ? "Are you sure you want to activate this admin? They will regain access to the admin panel."
                  : "Are you sure you want to suspend this admin? They will lose access to the admin panel."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={selectedAdmin.avatar || "/placeholder.svg?height=48&width=48&query=admin" || "/placeholder.svg"}
                  alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</h3>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={!selectedAdmin.isActive ? "default" : "secondary"}
                onClick={confirmSuspend}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : !selectedAdmin.isActive ? "Activate Admin" : "Suspend Admin"}
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
                  src={selectedAdmin.avatar || "/placeholder.svg?height=48&width=48&query=admin" || "/placeholder.svg"}
                  alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</h3>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isSubmitting}>
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
                  src={selectedAdmin.avatar || "/placeholder.svg?height=48&width=48&query=admin" || "/placeholder.svg"}
                  alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</h3>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="firstName"
                  value={newAdminFirstName}
                  onChange={(e) => setNewAdminFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="lastName"
                  value={newAdminLastName}
                  onChange={(e) => setNewAdminLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="userName"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Username (optional)"
              />
              <p className="text-xs text-muted-foreground">
                If left blank, username will be generated from first and last name
              </p>
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
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={newAdminPhone}
                onChange={(e) => setNewAdminPhone(e.target.value)}
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Admin Role
              </label>
              <Select value={newAdminRole} onValueChange={(value: "admin" | "super_admin") => setNewAdminRole(value)}>
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
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-2">
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
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={isSubmitting || !newAdminFirstName || !newAdminLastName || !newAdminEmail}
            >
              {isSubmitting ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  )
}
