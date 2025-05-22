"use client";

import { useState, useEffect } from "react";
import { useManagementPermissions } from "@/hooks/use-management-permissions";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { UserProfile } from "@/contexts/auth-context";

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
});

export default function UserManagementPage() {
  const { toast } = useToast();
  const {
    users,
    filteredUsers,
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
  } = useAuth();

  // const { hasPermission } = useManagementPermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [tempPassword, setTempPassword] = useState("");

  // Form for adding new users
  const addForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      role: "user",
      isActive: true,
      isEmailVerified: false,
    },
  });

  // Form for editing users
  const editForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      role: "user",
      isActive: true,
      isEmailVerified: false,
    },
  });

  // Available roles
  const availableRoles = [
    { id: "user", label: "User" },
    { id: "agent", label: "Agent" },
    { id: "developer", label: "Developer" },
    { id: "investor", label: "Investor" },
  ];

  // Fetch users on component mount if user is admin
  useEffect(() => {
    if (isAdmin) {
      getUsers();
    }
  }, [isAdmin, getUsers]);

  // Update filter when search term or active tab changes
  useEffect(() => {
    const newFilter = { ...userFilter };

    if (searchTerm) {
      newFilter.search = searchTerm;
    } else {
      delete newFilter.search;
    }

    if (activeTab === "active") {
      newFilter.status = "active";
    } else if (activeTab === "blacklisted") {
      newFilter.status = "blacklisted";
    } else if (activeTab === "verified") {
      newFilter.role = "";
      newFilter.status = "";
      // We'll handle this in the component since the API doesn't support this filter
    } else if (activeTab === "unverified") {
      newFilter.role = "";
      newFilter.status = "";
      // We'll handle this in the component since the API doesn't support this filter
    } else {
      newFilter.status = "";
    }

    setUserFilter(newFilter);
  }, [searchTerm, ]);

  // Handle adding a new user
  const handleAddUser = async (values: z.infer<typeof userFormSchema>) => {
    try {
      await updateUser("new", { ...values, role: values.role as UserProfile["role"] });
      toast({
        title: "Success",
        description: "User added successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      getUsers();
    } catch (error) {
      console.error("Failed to add user:", error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle editing a user
  const handleEditUser = async (values: z.infer<typeof userFormSchema>) => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, { ...values, role: values.role as UserProfile["role"] });
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      setIsEditDialogOpen(false);
      getUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      getUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle blacklisting/unblacklisting a user
  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      if (user.isActive) {
        await blacklistUser(user.id);
        toast({
          title: "Success",
          description: "User blacklisted successfully.",
        });
      } else {
        await unblacklistUser(user.id);
        toast({
          title: "Success",
          description: "User unblacklisted successfully.",
        });
      }
      getUsers();
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle resetting a user's password
  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const response = await resetUserPassword(selectedUser.id);
      setTempPassword(response.tempPassword);
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

  // Open edit dialog and populate form
  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      // address: user.address || "",
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    });
    setIsEditDialogOpen(true);
  };

  // Open reset password dialog
  const openResetPasswordDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setTempPassword("");
    setIsResetPasswordDialogOpen(true);
  };

  // Filter users for verified/unverified tabs
  const displayedUsers =
    activeTab === "verified"
      ? filteredUsers.filter((user) => user.isEmailVerified)
      : activeTab === "unverified"
      ? filteredUsers.filter((user) => !user.isEmailVerified)
      : filteredUsers;

  // User Table Component
  function UserTable({
    users,
    isLoading,
    onEdit,
    onDelete,
    onToggleStatus,
    onResetPassword,
  }: {
    users: UserProfile[];
    isLoading: boolean;
    onEdit: (user: UserProfile) => void;
    onDelete: (user: UserProfile) => void;
    onToggleStatus: (user: UserProfile) => void;
    onResetPassword: (user: UserProfile) => void;
  }) {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (users.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        Blacklisted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isEmailVerified ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt
                      ? format(new Date(user.createdAt), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                  
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleStatus(user)}
                        >
                          {user.isActive ? (
                            <XCircle className="h-4 w-4 text-amber-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                     
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onResetPassword(user)}
                        >
                          <Lock className="h-4 w-4 text-blue-600" />
                        </Button>
                   
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="blacklisted">Blacklisted</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="unverified">Unverified</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserTable
            users={displayedUsers}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={(user) => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={openResetPasswordDialog}
       
          />
        </TabsContent>

        <TabsContent value="active">
          <UserTable
            users={displayedUsers}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={(user) => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={openResetPasswordDialog}
       
          />
        </TabsContent>

        <TabsContent value="blacklisted">
          <UserTable
            users={displayedUsers}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={(user) => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={openResetPasswordDialog}
       
          />
        </TabsContent>

        <TabsContent value="verified">
          <UserTable
            users={displayedUsers}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={(user) => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={openResetPasswordDialog}
       
          />
        </TabsContent>

        <TabsContent value="unverified">
          <UserTable
            users={displayedUsers}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={(user) => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={openResetPasswordDialog}
       
          />
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddUser)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
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
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
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
                control={addForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, City, Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditUser)}
              className="space-y-4"
            >
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
              <div className="grid grid-cols-2 gap-4">
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
                        <p className="text-sm text-muted-foreground">
                          User can access the platform
                        </p>
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
                        <p className="text-sm text-muted-foreground">
                          User has verified their email
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>
          {!tempPassword ? (
            <>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p>
                  Are you sure you want to reset the password for{" "}
                  {selectedUser?.firstName} {selectedUser?.lastName}?
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                This will generate a temporary password that the user will need
                to change upon login.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetPasswordDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center space-y-4 p-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-lg font-medium">
                  Password Reset Successfully
                </h3>
                <div className="w-full p-4 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium mb-1">
                    Temporary Password:
                  </p>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-sm font-mono">{tempPassword}</code>
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
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Please securely share this temporary password with the user.
                  They will be required to change it upon login.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setIsResetPasswordDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
