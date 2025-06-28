"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  Copy,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Filter,
  Briefcase,
  ShoppingCart,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import type { UserProfile } from "@/contexts/auth-context"
import { UserStatus } from "@/contexts/auth-context"
import type { UserFilter } from "@/types/user-management"

// Form schema for adding/editing users
const userFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.string().min(1, "Please select a role"),
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(false),
})

type UserFormData = z.infer<typeof userFormSchema>

export default function UserManagementPage() {
  const { toast } = useToast()
  const {
    users,
    userFilter,
    setUserFilter,
    getUsers,
    updateUser,
    deleteUser,
    blacklistUser,
    unblacklistUser,
    resetUserPassword,
    usersLoading: isLoading,
    isSubmitting,
    isAdmin,
  } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [tempPassword, setTempPassword] = useState("")

  // Form for editing users
  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      role: "buyer",
      isActive: true,
      isEmailVerified: false,
    },
  })

  // Available roles
  const availableRoles = [
    { id: "buyer", label: "Buyer" },
    { id: "agent", label: "Agent" },
    { id: "developer", label: "Developer" },
    { id: "investor", label: "Investor" },
  ]

  // Fetch users on component mount if user is admin
  useEffect(() => {
    if (isAdmin) {
      getUsers()
    }
  }, [])

  // Update filter when search term, tab, or role filter changes
  useEffect(() => {
    const newFilter: UserFilter = { ...userFilter }

    if (searchTerm) {
      newFilter.search = searchTerm
    } else {
      delete newFilter.search
    }

    // Handle role filter
    if (roleFilter && roleFilter !== "all") {
      newFilter.role = roleFilter
    } else {
      delete newFilter.role
    }

    if (activeTab === "active") {
      newFilter.status = "active"
      delete newFilter.verified
    } else if (activeTab === "blacklisted") {
      newFilter.status = "blacklisted"
      delete newFilter.verified
    } else if (activeTab === "verified") {
      newFilter.verified = true
      delete newFilter.status
    } else if (activeTab === "unverified") {
      newFilter.verified = false
      delete newFilter.status
    } else {
      delete newFilter.status
      delete newFilter.verified
    }

    // Only update if filter actually changed
    if (JSON.stringify(newFilter) !== JSON.stringify(userFilter)) {
      setUserFilter(newFilter)
    }
  }, [searchTerm, activeTab, roleFilter]) // Remove setUserFilter and userFilter from dependencies

  // Handle editing a user
  const handleEditUser = async (values: UserFormData) => {
    if (!selectedUser) return

    try {
      await updateUser(selectedUser._id, {
        ...values,
        role: values.role as UserProfile["role"],
      })
      toast({
        title: "Success",
        description: "User updated successfully.",
      })
      setIsEditDialogOpen(false)
      getUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser._id)
      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
      setIsDeleteDialogOpen(false)
      getUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle blacklisting/unblacklisting a user
  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      if (user.status === UserStatus.ACTIVE) {
        await blacklistUser(user._id)
        toast({
          title: "Success",
          description: "User blacklisted successfully.",
        })
      } else {
        await unblacklistUser(user._id)
        toast({
          title: "Success",
          description: "User unblacklisted successfully.",
        })
      }
      getUsers()
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle resetting a user's password
  const handleResetPassword = async () => {
    if (!selectedUser) return

    try {
      const response = await resetUserPassword(selectedUser._id)
      if (response?.tempPassword) {
        setTempPassword(response.tempPassword)
      }
      toast({
        title: "Success",
        description: "Password reset successfully.",
      })
    } catch (error) {
      console.error("Failed to reset password:", error)
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog and populate form
  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user)
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isActive: user.status === UserStatus.ACTIVE,
      isEmailVerified: user.isEmailVerified,
    })
    setIsEditDialogOpen(true)
  }

  // Open reset password dialog
  const openResetPasswordDialog = (user: UserProfile) => {
    setSelectedUser(user)
    setTempPassword("")
    setIsResetPasswordDialogOpen(true)
  }

  // Get stats for dashboard cards - Updated to include buyers and agents
  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, blacklisted: 0, verified: 0, buyers: 0, agents: 0 }

    // Filter out admin and super_admin roles for user management stats
    const regularUsers = users.filter((user) => user.role !== "admin" && user.role !== "super_admin")

    return {
      total: regularUsers.length,
      active: regularUsers.filter((user) => user.status === UserStatus.ACTIVE).length,
      blacklisted: regularUsers.filter((user) => user.status === UserStatus.BLACKLISTED).length,
      verified: regularUsers.filter((user) => user.isEmailVerified).length,
      buyers: regularUsers.filter((user) => user.role === "buyer").length,
      agents: regularUsers.filter((user) => user.role === "agent").length,
    }
  }, [users])

  // User Cards Component for Mobile
  const filteredUsers = useMemo(() => {
    if (!users) return []

    // Filter out admin and super_admin roles for user management
    let filtered = users.filter((user) => user.role !== "admin" && user.role !== "super_admin")

    // Filter by search term
    if (userFilter.search) {
      const searchLower = userFilter.search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.userName && user.userName.toLowerCase().includes(searchLower)) ||
          (user.role && user.role.toLowerCase().includes(searchLower)),
      )
    }

    // Filter by role
    if (userFilter.role && userFilter.role !== "all") {
      filtered = filtered.filter((user) => user.role === userFilter.role)
    }

    // Filter by status
    if (userFilter.status) {
      if (userFilter.status === "active") {
        filtered = filtered.filter((user) => user.status === UserStatus.ACTIVE)
      } else if (userFilter.status === "blacklisted") {
        filtered = filtered.filter((user) => user.status === UserStatus.BLACKLISTED)
      } else if (userFilter.status === "inactive") {
        filtered = filtered.filter((user) => user.status === UserStatus.INACTIVE)
      }
    }

    return filtered
  }, [users, userFilter])

  // Filter users for verified/unverified tabs
  const displayedUsers =
    activeTab === "verified"
      ? filteredUsers.filter((user) => user.isEmailVerified)
      : activeTab === "unverified"
        ? filteredUsers.filter((user) => !user.isEmailVerified)
        : filteredUsers

  // User Cards Component for Mobile
  function UserTable({
    users,
    isLoading,
    onEdit,
    onDelete,
    onToggleStatus,
    onResetPassword,
  }: {
    users: UserProfile[]
    isLoading: boolean
    onEdit: (user: UserProfile) => void
    onDelete: (user: UserProfile) => void
    onToggleStatus: (user: UserProfile) => void
    onResetPassword: (user: UserProfile) => void
  }) {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (users.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        {/* Desktop Table - More Compact */}
        <div className="hidden lg:block w-full">
          <Card>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold w-[180px]">User</TableHead>
                        <TableHead className="font-semibold w-[160px]">Contact</TableHead>
                        <TableHead className="font-semibold w-[80px]">Role</TableHead>
                        <TableHead className="font-semibold w-[100px]">Status</TableHead>
                        <TableHead className="font-semibold w-[100px]">Verified</TableHead>
                        <TableHead className="font-semibold w-[100px]">Joined</TableHead>
                        <TableHead className="text-right font-semibold w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-muted/30">
                          <TableCell className="w-[180px]">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-primary">
                                  {user.firstName?.charAt(0) || ""}
                                  {user.lastName?.charAt(0) || ""}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">{user._id.slice(-6)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[160px]">
                            <div className="space-y-1">
                              <div className="text-xs truncate">{user.email}</div>
                              {user.phone && <div className="text-xs text-muted-foreground truncate">{user.phone}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="w-[80px]">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {user.status === UserStatus.ACTIVE ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {user.isEmailVerified ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <span className="text-xs">
                              {user.createdAt ? format(new Date(user.createdAt), "MMM d") : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right w-[80px]">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                                  {user.status === UserStatus.ACTIVE ? (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Blacklist
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onResetPassword(user)}>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tablet Table - Simplified */}
        <div className="hidden md:block lg:hidden w-full">
          <Card>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold w-[200px]">User</TableHead>
                        <TableHead className="font-semibold w-[80px]">Role</TableHead>
                        <TableHead className="font-semibold w-[100px]">Status</TableHead>
                        <TableHead className="font-semibold w-[100px]">Joined</TableHead>
                        <TableHead className="text-right font-semibold w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-muted/30">
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-primary">
                                  {user.firstName?.charAt(0) || ""}
                                  {user.lastName?.charAt(0) || ""}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[80px]">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {user.status === UserStatus.ACTIVE ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <span className="text-xs">
                              {user.createdAt ? format(new Date(user.createdAt), "MMM d") : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right w-[80px]">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                                  {user.status === UserStatus.ACTIVE ? (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Blacklist
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onResetPassword(user)}>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {user.firstName?.charAt(0) || ""}
                        {user.lastName?.charAt(0) || ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
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
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                        {user.status === UserStatus.ACTIVE ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Blacklist
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResetPassword(user)}>
                        <Lock className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.status === UserStatus.ACTIVE ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        <UserCheck className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                        <UserX className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    {user.isEmailVerified ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs truncate">
                      {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-[100vw] overflow-hidden">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor all users in your system</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {/* Stats Cards - Updated with Buyers and Agents */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.blacklisted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buyers</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.buyers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agents</CardTitle>
                <Briefcase className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.agents}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters - Updated with Role Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users by name, email, or ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="buyer">Buyers</SelectItem>
                      <SelectItem value="agent">Agents</SelectItem>
                      <SelectItem value="developer">Developers</SelectItem>
                      <SelectItem value="investor">Investors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs and Content - Fixed container */}
          <div className="w-full max-w-[100vw] overflow-hidden">
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm">
                  Active
                </TabsTrigger>
                <TabsTrigger value="blacklisted" className="text-xs sm:text-sm">
                  Blacklisted
                </TabsTrigger>
                <TabsTrigger value="verified" className="text-xs sm:text-sm">
                  Verified
                </TabsTrigger>
                <TabsTrigger value="unverified" className="text-xs sm:text-sm">
                  Unverified
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <UserTable
                  users={displayedUsers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onDelete={(user) => {
                    setSelectedUser(user)
                    setIsDeleteDialogOpen(true)
                  }}
                  onToggleStatus={handleToggleUserStatus}
                  onResetPassword={openResetPasswordDialog}
                />
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <UserTable
                  users={displayedUsers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onDelete={(user) => {
                    setSelectedUser(user)
                    setIsDeleteDialogOpen(true)
                  }}
                  onToggleStatus={handleToggleUserStatus}
                  onResetPassword={openResetPasswordDialog}
                />
              </TabsContent>

              <TabsContent value="blacklisted" className="space-y-4">
                <UserTable
                  users={displayedUsers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onDelete={(user) => {
                    setSelectedUser(user)
                    setIsDeleteDialogOpen(true)
                  }}
                  onToggleStatus={handleToggleUserStatus}
                  onResetPassword={openResetPasswordDialog}
                />
              </TabsContent>

              <TabsContent value="verified" className="space-y-4">
                <UserTable
                  users={displayedUsers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onDelete={(user) => {
                    setSelectedUser(user)
                    setIsDeleteDialogOpen(true)
                  }}
                  onToggleStatus={handleToggleUserStatus}
                  onResetPassword={openResetPasswordDialog}
                />
              </TabsContent>

              <TabsContent value="unverified" className="space-y-4">
                <UserTable
                  users={displayedUsers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onDelete={(user) => {
                    setSelectedUser(user)
                    setIsDeleteDialogOpen(true)
                  }}
                  onToggleStatus={handleToggleUserStatus}
                  onResetPassword={openResetPasswordDialog}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <p className="text-sm text-muted-foreground">User can access the platform</p>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="isEmailVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Email Verified</FormLabel>
                            <p className="text-sm text-muted-foreground">User has verified their email</p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
              </DialogHeader>
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Are you sure you want to delete this user?</p>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone. All user data will be permanently removed.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Deleting..." : "Delete User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reset Password Dialog */}
          <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset User Password</DialogTitle>
              </DialogHeader>
              {!tempPassword ? (
                <>
                  <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">
                        Reset password for {selectedUser?.firstName} {selectedUser?.lastName}?
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        This will generate a temporary password that the user will need to change upon login.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsResetPasswordDialogOpen(false)}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center space-y-4 p-6">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800">Password Reset Successfully</h3>
                      <p className="text-sm text-muted-foreground mt-1">A temporary password has been generated</p>
                    </div>
                    <div className="w-full p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium mb-2">Temporary Password:</p>
                      <div className="flex items-center justify-between bg-white p-3 rounded border font-mono text-sm">
                        <code className="break-all">{tempPassword}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(tempPassword)
                            toast({
                              title: "Copied",
                              description: "Password copied to clipboard",
                            })
                          }}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Please securely share this temporary password with the user. They will be required to change it
                      upon login.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={() => setIsResetPasswordDialogOpen(false)} className="w-full">
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
