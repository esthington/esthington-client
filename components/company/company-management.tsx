"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CompanyProvider, useCompany } from "@/contexts/company-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form state type
interface CompanyFormState {
  name: string;
  description: string;
  logo: File | null;
  logoPreview: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

// Main page component
export default function CompanyManagementPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);

    // Check user role
    if (user?.role !== "admin" && user?.role !== "super_admin") {
      router.push("/dashboard");
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding =
      localStorage.getItem("onboardingCompleted") === "true";
    if (!hasCompletedOnboarding) {
      router.push("/dashboard/");
    }

    // Simulate loading time for animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [router, user]);

  if (!isClient) {
    return null; // Return null during server-side rendering
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse">
            Loading company management...
          </p>
        </div>
      </div>
    );
  }

  // If not admin, don't render the page
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return null;
  }

  return (
    <CompanyProvider>
      <CompanyManagementContent />
    </CompanyProvider>
  );
}

// Main content component
function CompanyManagementContent() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Get companies from context
  const {
    companies,
    isLoading,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanyData,
  } = useCompany();

  // Filter companies based on search query and active status
  const filteredCompanies = companies
    .filter(
      (company) =>
        (activeTab === "all" ||
          (activeTab === "active" && company.active) ||
          (activeTab === "inactive" && !company.active)) &&
        (company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  // Create company dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Edit company dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<any | null>(null);

  // Delete company dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<any | null>(null);

  // Handle edit button click
  const handleEditClick = (company: any) => {
    setCompanyToEdit(company);
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (company: any) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    try {
      const success = await deleteCompany(companyToDelete._id);
      if (success) {
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshCompanyData();
  };

  // Stats
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((company) => company.active).length;
  const inactiveCompanies = companies.filter(
    (company) => !company.active
  ).length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Company Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, view, update, and delete company information
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to your platform. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <CompanyForm
                mode="create"
                onSuccess={() => {
                  setCreateDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-100 dark:border-teal-900">
            <CardHeader className="pb-2">
              <CardDescription>Total Companies</CardDescription>
              <CardTitle className="text-3xl">{totalCompanies}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <Building2 className="inline-block mr-1 h-4 w-4" /> All
                registered companies
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-100 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardDescription>Active Companies</CardDescription>
              <CardTitle className="text-3xl">{activeCompanies}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <Check className="inline-block mr-1 h-4 w-4" /> Currently active
                companies
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-100 dark:border-gray-900">
            <CardHeader className="pb-2">
              <CardDescription>Inactive Companies</CardDescription>
              <CardTitle className="text-3xl">{inactiveCompanies}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <AlertCircle className="inline-block mr-1 h-4 w-4" /> Currently
                inactive companies
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid grid-cols-3 w-full md:w-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Select
                  value={sortOrder}
                  onValueChange={(value) =>
                    setSortOrder(value as "asc" | "desc")
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Name (A-Z)</SelectItem>
                    <SelectItem value="desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(viewMode === "table" && "bg-muted")}
                    onClick={() => setViewMode("table")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-table-2"
                    >
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(viewMode === "grid" && "bg-muted")}
                    onClick={() => setViewMode("grid")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-layout-grid"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-muted-foreground animate-pulse">
                    Loading companies...
                  </p>
                </div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No companies found</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                  {searchQuery
                    ? `No companies match "${searchQuery}"`
                    : "No companies available. Create your first company to get started."}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Company
                  </Button>
                )}
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredCompanies.map((company) => (
                        <motion.tr
                          key={company._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={
                                    company.logo ||
                                    "/placeholder.svg?height=40&width=40&query=company"
                                  }
                                  alt={company.name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-600 text-white">
                                  {company.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {company.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {company.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{company.email}</span>
                              </div>
                              {company.phone && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{company.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={company.active ? "default" : "outline"}
                              className={cn(
                                company.active
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                              )}
                            >
                              {company.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(company)}
                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteClick(company)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">
                                      More options
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditClick(company)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(company)}
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredCompanies.map((company) => (
                    <motion.div
                      key={company._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow group">
                        <CardHeader className="pb-2 relative">
                          <div className="absolute right-4 top-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(company)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(company)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border">
                              <AvatarImage
                                src={
                                  company.logo ||
                                  "/placeholder.svg?height=48&width=48&query=company"
                                }
                                alt={company.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-600 text-white text-lg">
                                {company.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {company.name}
                              </CardTitle>
                              <Badge
                                variant={company.active ? "default" : "outline"}
                                className={cn(
                                  "mt-1",
                                  company.active
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                                )}
                              >
                                {company.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {company.description}
                          </p>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{company.email}</span>
                            </div>

                            {company.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{company.phone}</span>
                              </div>
                            )}

                            {company.website && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <span className="truncate">
                                  {company.website}
                                </span>
                              </div>
                            )}

                            {company.address && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">
                                  {company.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-4">
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                              onClick={() => handleEditClick(company)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteClick(company)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Company Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {companyToEdit && (
            <CompanyForm
              mode="edit"
              company={companyToEdit}
              onSuccess={() => {
                setEditDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
            {companyToDelete && (
              <>
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src={
                      companyToDelete.logo ||
                      "/placeholder.svg?height=40&width=40&query=company"
                    }
                    alt={companyToDelete.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-600 text-white">
                    {companyToDelete.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{companyToDelete.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {companyToDelete.email}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Company form component for create and edit
function CompanyForm({
  mode = "create",
  company = null,
  onSuccess,
}: {
  mode: "create" | "edit";
  company?: any | null;
  onSuccess: () => void;
}) {
  const { createCompany, updateCompany } = useCompany();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<CompanyFormState>({
    name: company?.name || "",
    description: company?.description || "",
    logo: null,
    logoPreview: company?.logo || "",
    website: company?.website || "",
    email: company?.email || "",
    phone: company?.phone || "",
    address: company?.address || "",
    active: company?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormState((prev) => ({ ...prev, active: checked }));
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        logo: "Invalid file type. Please upload a JPG, PNG, GIF, or SVG image.",
      }));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "File is too large. Maximum size is 2MB.",
      }));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setFormState((prev) => ({
      ...prev,
      logo: file,
      logoPreview: previewUrl,
    }));

    // Clear error
    if (errors.logo) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.logo;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formState.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formState.email)) {
      newErrors.email = "Invalid email format";
    }

    if (mode === "create" && !formState.logo && !formState.logoPreview) {
      newErrors.logo = "Company logo is required";
    }

    if (
      formState.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        formState.website
      )
    ) {
      newErrors.website = "Invalid website URL";
    }

    if (
      formState.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formState.phone
      )
    ) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("description", formState.description);
      formData.append("email", formState.email);
      formData.append("active", formState.active.toString());

      if (formState.website) formData.append("website", formState.website);
      if (formState.phone) formData.append("phone", formState.phone);
      if (formState.address) formData.append("address", formState.address);

      if (formState.logo) {
        formData.append("logo", formState.logo);
      }

      let result = null;

      if (mode === "create") {
        result = await createCompany(formData);
      } else if (company?._id) {
        result = await updateCompany(company._id, formData);
      }

      if (result) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name" className="required">
            Company Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter company name"
            value={formState.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description" className="required">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter company description"
            value={formState.description}
            onChange={handleChange}
            className={cn(
              "min-h-[100px]",
              errors.description ? "border-red-500" : ""
            )}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="logo" className="required">
            Company Logo
          </Label>
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                className={cn(
                  "h-24 w-24 rounded-md border flex items-center justify-center overflow-hidden bg-muted",
                  formState.logoPreview ? "p-0" : "p-2"
                )}
              >
                {formState.logoPreview ? (
                  <img
                    src={
                      formState.logoPreview ||
                      "/placeholder.svg?height=96&width=96&query=company"
                    }
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-center text-muted-foreground">
                    No logo uploaded
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className={cn(
                  "cursor-pointer",
                  errors.logo ? "border-red-500" : ""
                )}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a JPG, PNG, GIF, or SVG image (max 2MB)
              </p>
              {errors.logo && (
                <p className="text-sm text-red-500 mt-1">{errors.logo}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email" className="required">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="company@example.com"
              value={formState.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formState.phone}
              onChange={handleChange}
              className={errors.phone ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://example.com"
            value={formState.website}
            onChange={handleChange}
            className={errors.website ? "border-red-500" : ""}
            disabled={isSubmitting}
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Enter company address"
            value={formState.address}
            onChange={handleChange}
            className="min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formState.active}
            onCheckedChange={handleSwitchChange}
            disabled={isSubmitting}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : (
            <>{mode === "create" ? "Create Company" : "Save Changes"}</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
