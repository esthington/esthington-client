"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  MoreHorizontal,
  Ban,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Key,
  Copy,
  Search,
  Users,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import type { UserProfile } from "@/contexts/auth-context";
import { UserStatus } from "@/contexts/auth-context";

// Form schema for adding admins
const adminFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  userName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "super_admin"]),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

export default function AdminManagementPage() {
  const { toast } = useToast();
  const {
    admins,
    adminFilter,
    setAdminFilter,
    getAdmins,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    suspendAdmin,
    activateAdmin,
    resetUserPassword,
    adminsLoading: isLoading,
    isSubmitting,
    isSuperAdmin,
  } = useAuth();

  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile | null>(null);
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // Add missing callback functions to prevent runtime errors
  const onBeforeLoad = useCallback(() => {
    // No-op function to prevent runtime errors
  }, []);

  const onStatusChange = useCallback(() => {
    // No-op function to prevent runtime errors
  }, []);

  const onLoad = useCallback(() => {
    // No-op function to prevent runtime errors
  }, []);

  // Form for adding new admins
  const addForm = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      phone: "",
      role: "admin",
    },
  });

  // Memoized filtered admins to prevent unnecessary re-renders
  const filteredAdmins = useMemo(() => {
    if (!admins || admins.length === 0) return [];

    // First filter to only include admin and super_admin roles
    let filtered = admins.filter(
      (admin) => admin.role === "admin" || admin.role === "super_admin"
    );

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.firstName.toLowerCase().includes(searchLower) ||
          admin.lastName.toLowerCase().includes(searchLower) ||
          admin.email.toLowerCase().includes(searchLower) ||
          (admin.userName && admin.userName.toLowerCase().includes(searchLower))
      );
    }

    // Filter by tab
    if (activeTab === "super_admin") {
      filtered = filtered.filter((admin) => admin.role === "super_admin");
    } else if (activeTab === "admin") {
      filtered = filtered.filter((admin) => admin.role === "admin");
    } else if (activeTab === "suspended") {
      filtered = filtered.filter(
        (admin) =>
          admin.status === UserStatus.INACTIVE || admin.isActive === false
      );
    }

    return filtered;
  }, [admins, searchTerm, activeTab]);

  // Stats for dashboard cards
  const stats = useMemo(() => {
    if (!admins) return { total: 0, active: 0, suspended: 0, superAdmins: 0 };

    // Filter to only admin and super_admin roles
    const adminUsers = admins.filter(
      (admin) => admin.role === "admin" || admin.role === "super_admin"
    );

    return {
      total: adminUsers.length,
      active: adminUsers.filter(
        (admin) => admin.status === UserStatus.ACTIVE || admin.isActive === true
      ).length,
      suspended: adminUsers.filter(
        (admin) =>
          admin.status === UserStatus.INACTIVE || admin.isActive === false
      ).length,
      superAdmins: adminUsers.filter((admin) => admin.role === "super_admin")
        .length,
    };
  }, [admins]);

  // Fetch admins on component mount - only once
  useEffect(() => {
    if (isSuperAdmin) {
      getAdmins().catch(console.error);
    }
  }, [isSuperAdmin]);

  // Update admin filter when search or tab changes
  const updateFilter = useCallback(() => {
    const newFilter = { ...adminFilter };

    if (searchTerm) {
      newFilter.search = searchTerm;
    } else {
      delete newFilter.search;
    }

    if (activeTab === "super_admin") {
      newFilter.role = "super_admin";
      delete newFilter.status;
    } else if (activeTab === "admin") {
      newFilter.role = "admin";
      delete newFilter.status;
    } else if (activeTab === "suspended") {
      newFilter.status = "inactive";
      delete newFilter.role;
    } else {
      delete newFilter.role;
      delete newFilter.status;
    }

    // Only update if filter actually changed
    if (JSON.stringify(newFilter) !== JSON.stringify(adminFilter)) {
      setAdminFilter(newFilter);
    }
  }, [searchTerm, activeTab, adminFilter, setAdminFilter]);

  useEffect(() => {
    updateFilter();
  }, [searchTerm, activeTab, updateFilter]); // Don't include updateFilter to avoid loops

  const handleViewAdmin = useCallback((admin: UserProfile) => {
    try {
      setSelectedAdmin(admin);
      setShowAdminDetails(true);
    } catch (error) {
      console.error("Error viewing admin:", error);
    }
  }, []);

  const handleSuspendAdmin = useCallback((admin: UserProfile) => {
    try {
      setSelectedAdmin(admin);
      setShowSuspendDialog(true);
    } catch (error) {
      console.error("Error suspending admin:", error);
    }
  }, []);

  const handleDeleteAdmin = useCallback((admin: UserProfile) => {
    try {
      setSelectedAdmin(admin);
      setShowDeleteDialog(true);
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  }, []);

  const handleResetPassword = useCallback((admin: UserProfile) => {
    try {
      setSelectedAdmin(admin);
      setTempPassword("");
      setShowResetPasswordDialog(true);
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  }, []);

  const confirmSuspend = async () => {
    if (!selectedAdmin) return;

    try {
      const isCurrentlyActive =
        selectedAdmin.status === UserStatus.ACTIVE ||
        selectedAdmin.isActive === true;

      if (!isCurrentlyActive) {
        await activateAdmin(selectedAdmin._id);
        toast({
          title: "Success",
          description: `${selectedAdmin.firstName} ${selectedAdmin.lastName} has been activated`,
        });
      } else {
        await suspendAdmin(selectedAdmin._id);
        toast({
          title: "Success",
          description: `${selectedAdmin.firstName} ${selectedAdmin.lastName} has been suspended`,
        });
      }
      setShowSuspendDialog(false);
      getAdmins();
    } catch (error) {
      console.error("Failed to update admin status:", error);
      toast({
        title: "Error",
        description: "Failed to update admin status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;

    try {
      await deleteAdmin(selectedAdmin._id);
      toast({
        title: "Success",
        description: `${selectedAdmin.firstName} ${selectedAdmin.lastName} has been deleted`,
      });
      setShowDeleteDialog(false);
      getAdmins();
    } catch (error) {
      console.error("Failed to delete admin:", error);
      toast({
        title: "Error",
        description: "Failed to delete admin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await resetUserPassword(selectedAdmin._id);
      if (response?.tempPassword) {
        setTempPassword(response.tempPassword);
      }
      toast({
        title: "Success",
        description: "Password reset successfully.",
      });
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = async (values: AdminFormData) => {
    try {
      const adminData = {
        firstName: values.firstName,
        lastName: values.lastName,
        userName:
          values.userName ||
          `${values.firstName.toLowerCase()}.${values.lastName.toLowerCase()}`,
        email: values.email,
        phone: values.phone,
        role: values.role,
        permissions: ["users_view", "properties_view"],
      };

      await addAdmin(adminData);
      toast({
        title: "Success",
        description: "Admin added successfully",
      });
      setShowAddAdminDialog(false);
      addForm.reset();
      await getAdmins();
    } catch (error) {
      console.error("Failed to add admin:", error);
      toast({
        title: "Error",
        description: "Failed to add admin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Shield className="mr-1 h-3 w-3" />
            Super Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus, isActive?: boolean) => {
    // Check both status and isActive fields
    const isUserActive = status === UserStatus.ACTIVE || isActive === true;

    if (isUserActive) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <UserCheck className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <UserX className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      );
    }
  };

  // Admin Cards Component for Mobile
  function AdminCards({ admins }: { admins: UserProfile[] }) {
    return (
      <div className="grid gap-4 md:hidden">
        {admins.map((admin) => (
          <Card key={admin._id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {admin.firstName.charAt(0)}
                    {admin.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {admin.firstName} {admin.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleViewAdmin(admin)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                    <Key className="mr-2 h-4 w-4" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSuspendAdmin(admin)}>
                    <Ban className="mr-2 h-4 w-4" />
                    {admin.status === UserStatus.INACTIVE ||
                    admin.isActive === false
                      ? "Activate"
                      : "Suspend"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteAdmin(admin)}
                    className="text-red-600"
                    disabled={admin.role === "super_admin"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2">
                {getRoleBadge(admin.role)}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(admin.status, admin.isActive)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {admin.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs">
                  {admin.lastLogin
                    ? new Date(admin.lastLogin).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Admin Table Component for Desktop
  function AdminTable() {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading admins...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (filteredAdmins.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                No admins found
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
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Admin</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="font-semibold">Last Login</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin._id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {admin.firstName.charAt(0)}
                              {admin.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {admin._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{admin.email}</span>
                          </div>
                          {admin.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{admin.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        {getStatusBadge(admin.status, admin.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {admin.createdAt
                              ? new Date(admin.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {admin.lastLogin
                              ? new Date(admin.lastLogin).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
                              onClick={() => handleViewAdmin(admin)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(admin)}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSuspendAdmin(admin)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {admin.status === UserStatus.INACTIVE ||
                              admin.isActive === false
                                ? "Activate Admin"
                                : "Suspend Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteAdmin(admin)}
                              className="text-red-600"
                              disabled={admin.role === "super_admin"}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Admin
                            </DropdownMenuItem>
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
        <AdminCards admins={filteredAdmins} />
      </>
    );
  }

  // Check if user has permission to view this page
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to view this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add loading check before any admin operations
  if (!admins || isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="flex justify-center items-center h-40">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage administrator accounts and permissions
            </p>
          </div>
          <Button
            onClick={() => setShowAddAdminDialog(true)}
            className="w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Admins
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.suspended}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Super Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.superAdmins}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search admins by name, email, or username..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="super_admin" className="text-xs sm:text-sm">
              Super Admins
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-xs sm:text-sm">
              Admins
            </TabsTrigger>
            <TabsTrigger value="suspended" className="text-xs sm:text-sm">
              Suspended
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <AdminTable />
          </TabsContent>

          <TabsContent value="super_admin" className="space-y-4">
            <AdminTable />
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <AdminTable />
          </TabsContent>

          <TabsContent value="suspended" className="space-y-4">
            <AdminTable />
          </TabsContent>
        </Tabs>

        {/* All the dialogs remain the same but with improved styling */}
        {/* Admin Details Dialog */}
        {selectedAdmin && (
          <Dialog open={showAdminDetails} onOpenChange={setShowAdminDetails}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Admin Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the administrator
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-medium text-primary">
                      {selectedAdmin.firstName.charAt(0)}
                      {selectedAdmin.lastName.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedAdmin.firstName} {selectedAdmin.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAdmin.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedAdmin.role)}
                      {getStatusBadge(
                        selectedAdmin.status,
                        selectedAdmin.isActive
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Join Date
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(
                            selectedAdmin.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Last Active
                        </span>
                        <span className="text-sm font-medium">
                          {selectedAdmin.lastLogin
                            ? new Date(
                                selectedAdmin.lastLogin
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Username
                        </span>
                        <span className="text-sm font-medium">
                          {selectedAdmin.userName}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Email
                          </span>
                          <span className="text-sm font-medium">
                            {selectedAdmin.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Phone
                          </span>
                          <span className="text-sm font-medium">
                            {selectedAdmin.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleResetPassword(selectedAdmin)}
                  className="w-full sm:w-auto"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>

                <Button
                  variant={
                    selectedAdmin.status === UserStatus.INACTIVE ||
                    selectedAdmin.isActive === false
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => handleSuspendAdmin(selectedAdmin)}
                  className="w-full sm:w-auto"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {selectedAdmin.status === UserStatus.INACTIVE ||
                  selectedAdmin.isActive === false
                    ? "Activate Admin"
                    : "Suspend Admin"}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => handleDeleteAdmin(selectedAdmin)}
                  className="w-full sm:w-auto"
                  disabled={selectedAdmin.role === "super_admin"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Admin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Suspend Dialog */}
        {selectedAdmin && (
          <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedAdmin.status === UserStatus.INACTIVE ||
                  selectedAdmin.isActive === false
                    ? "Activate Admin"
                    : "Suspend Admin"}
                </DialogTitle>
                <DialogDescription>
                  {selectedAdmin.status === UserStatus.INACTIVE ||
                  selectedAdmin.isActive === false
                    ? "Are you sure you want to activate this admin? They will regain access to the admin panel."
                    : "Are you sure you want to suspend this admin? They will lose access to the admin panel."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">
                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    {selectedAdmin.email}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSuspendDialog(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant={
                    selectedAdmin.status === UserStatus.INACTIVE
                      ? "default"
                      : "secondary"
                  }
                  onClick={confirmSuspend}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting
                    ? "Processing..."
                    : selectedAdmin.status === UserStatus.INACTIVE ||
                      selectedAdmin.isActive === false
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
                  Are you sure you want to delete this admin? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {selectedAdmin.email}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={
                    selectedAdmin.role === "super_admin" || isSubmitting
                  }
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Deleting..." : "Delete Admin"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Reset Password Dialog */}
        {selectedAdmin && (
          <Dialog
            open={showResetPasswordDialog}
            onOpenChange={setShowResetPasswordDialog}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset Admin Password</DialogTitle>
              </DialogHeader>
              {!tempPassword ? (
                <>
                  <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">
                        Reset password for {selectedAdmin.firstName}{" "}
                        {selectedAdmin.lastName}?
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        This will generate a temporary password that the admin
                        will need to change upon login.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetPasswordDialog(false)}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={confirmResetPassword}
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
                      <h3 className="text-lg font-semibold text-green-800">
                        Password Reset Successfully
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        A temporary password has been generated
                      </p>
                    </div>
                    <div className="w-full p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium mb-2">
                        Temporary Password:
                      </p>
                      <div className="flex items-center justify-between bg-white p-3 rounded border font-mono text-sm">
                        <code className="break-all">{tempPassword}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(tempPassword);
                            toast({
                              title: "Copied",
                              description: "Password copied to clipboard",
                            });
                          }}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Please securely share this temporary password with the
                      admin. They will be required to change it upon login.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => setShowResetPasswordDialog(false)}
                      className="w-full"
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Add Admin Dialog */}
        <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator account
              </DialogDescription>
            </DialogHeader>

            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(handleAddAdmin)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addForm.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username (optional)" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        If left blank, username will be generated from first and
                        last name
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter phone number (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddAdminDialog(false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Adding..." : "Add Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
