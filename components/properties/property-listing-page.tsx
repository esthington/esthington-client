"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  MapPin,
  Building,
  ArrowUpDown,
  Grid3X3,
  List,
  Filter,
  X,
  Star,
  StarOff,
  Eye,
  Trash2,
  Home,
  Briefcase,
  Map,
  Tag,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import parse from "html-react-parser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useProperty, type Property } from "@/contexts/property-context";
import { useAuth } from "@/contexts/auth-context";

// Animation components with TypeScript support
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}

const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
}) => {
  return (
    <div
      className={`animate-in fade-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
  staggerDelay = 0.05,
}) => {
  return (
    <div
      className={className}
      style={{ "--stagger-delay": `${staggerDelay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  index = 0,
  className = "",
}) => {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 ${className}`}
      style={{
        animationDelay: `calc(var(--stagger-delay) * ${index})`,
        animationDuration: "0.5s",
      }}
    >
      {children}
    </div>
  );
};

// Loading spinner component
interface LoadingSpinnerProps {
  size?: "default" | "sm" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "default",
}) => {
  const sizeClass = {
    sm: "w-6 h-6",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  }[size];

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClass} relative`}>
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
      </div>
    </div>
  );
};

// Property card component for grid view
interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  index: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onDelete,
  onToggleFeatured,
  index,
}) => {
  const {
    _id,
    title,
    location,
    price,
    type,
    status,
    thumbnail,
    featured,
    availablePlots,
    totalPlots,
    companyName,
    companyLogo,
  } = property;
  const { user } = useAuth();

  const router = useRouter();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

  const statusColors = {
    Available:
      "bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-700 dark:text-green-400",
    "Sold Out":
      "bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-700 dark:text-red-400",
    "Coming Soon":
      "bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  const typeIcons = {
    Land: <Map className="h-4 w-4" />,
    Residential: <Home className="h-4 w-4" />,
    Commercial: <Briefcase className="h-4 w-4" />,
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <StaggerItem index={index}>
      <div className="group h-full">
        <div className="relative h-full overflow-hidden rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
          {/* Property Image */}
          <div className="relative h-52 w-full overflow-hidden">
            {thumbnail ? (
              <Image
                src={thumbnail || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                <Building className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge
                variant="outline"
                className={`${
                  statusColors[status as keyof typeof statusColors]
                } border-none backdrop-blur-sm px-3 py-1 font-medium`}
              >
                {status}
              </Badge>

              {featured && (
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-700 dark:text-amber-400 border-none backdrop-blur-sm px-3 py-1 font-medium"
                >
                  <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                </Badge>
              )}

              <Badge
                variant="outline"
                className={`flex items-center gap-2 bg-green-500 text-white border-none backdrop-blur-sm px-3 py-1 font-medium`}
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />{" "}
                {location}
              </Badge>
            </div>

            {/* Actions Menu */}
            {isAdmin ? (
              <div className="absolute top-3 right-3 opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onClick(_id)}>
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/properties/edit/${_id}`)
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onToggleFeatured(_id, !featured)}
                    >
                      {featured ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2" /> Remove from
                          Featured
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" /> Add to Featured
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Property
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              ""
            )}
          </div>

          {/* Property Content */}
          <div className="p-5">
            {/* Property Type & Plots */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-secondary/80 to-secondary/50 text-secondary-foreground border-none px-2.5 py-0.5"
              >
                {typeIcons[type as keyof typeof typeIcons]} {type}
              </Badge>
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-secondary/80 to-secondary/50 text-secondary-foreground border-none px-2.5 py-0.5"
              >
                <Tag className="h-3 w-3 mr-1" /> {availablePlots}/{totalPlots}{" "}
                Plots
              </Badge>
            </div>

            {/* Property Title */}
            <h3 className="font-semibold text-lg mt-1 line-clamp-1 text-foreground transition-colors">
              {title}
            </h3>

            {/* Property Price */}
            <div className="mt-4">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {formattedPrice}
              </span>
            </div>

            {/* Company Info */}
            {companyName && (
              <div className="flex items-center gap-2 w-full border-t border-border/50 pt-4 mt-4">
                {companyLogo ? (
                  <div className="h-7 w-7 rounded-full overflow-hidden relative border border-border/50 shadow-sm">
                    <Image
                      src={companyLogo || "/placeholder.svg"}
                      alt={companyName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {companyName}
                </span>
              </div>
            )}

            {/* View Details Button */}
            <Button
              variant="ghost"
              className="w-full mt-4 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-primary/5 group-hover:text-primary transition-all duration-300"
              onClick={() => onClick(_id)}
            >
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this property? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(_id);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaggerItem>
  );
};

// Property list item component for list view
interface PropertyListItemProps {
  property: Property;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  index: number;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({
  property,
  onClick,
  onDelete,
  onToggleFeatured,
  index,
}) => {
  const {
    _id,
    title,
    description,
    location,
    price,
    type,
    status,
    thumbnail,
    featured,
    availablePlots,
    totalPlots,
    companyName,
    companyLogo,
    createdAt,
  } = property;

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const statusColors = {
    Available:
      "bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-700 dark:text-green-400",
    "Sold Out":
      "bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-700 dark:text-red-400",
    "Coming Soon":
      "bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  const typeIcons = {
    Land: <Map className="h-4 w-4" />,
    Residential: <Home className="h-4 w-4" />,
    Commercial: <Briefcase className="h-4 w-4" />,
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <StaggerItem index={index}>
      <div className="group overflow-hidden rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
        <div className="flex flex-col sm:flex-row">
          {/* Property Image */}
          <div className="relative h-56 sm:h-auto sm:w-56 sm:min-w-[14rem]">
            {thumbnail ? (
              <Image
                src={thumbnail || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                <Building className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge
                variant="outline"
                className={`${
                  statusColors[status as keyof typeof statusColors]
                } border-none backdrop-blur-sm px-3 py-1 font-medium`}
              >
                {status}
              </Badge>

              {featured && (
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-700 dark:text-amber-400 border-none backdrop-blur-sm px-3 py-1 font-medium"
                >
                  <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`flex items-center gap-2 bg-green-500 text-white border-none backdrop-blur-sm px-3 py-1 font-medium`}
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />{" "}
                {location}
              </Badge>
            </div>
          </div>

          {/* Property Content */}
          <div className="p-5 flex-grow flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-secondary/80 to-secondary/50 text-secondary-foreground border-none px-2.5 py-0.5"
                >
                  {typeIcons[type as keyof typeof typeIcons]} {type}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-secondary/80 to-secondary/50 text-secondary-foreground border-none px-2.5 py-0.5"
                >
                  <Tag className="h-3 w-3 mr-1" /> {availablePlots}/{totalPlots}{" "}
                  Plots
                </Badge>
              </div>

              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">{formattedDate}</span>
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {/* {description} */}
                {parse(`${description}`)}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {formattedPrice}
              </span>

              {companyName && (
                <div className="flex items-center gap-2">
                  {companyLogo ? (
                    <div className="h-7 w-7 rounded-full overflow-hidden relative border border-border/50 shadow-sm">
                      <Image
                        src={companyLogo || "/placeholder.svg"}
                        alt={companyName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {companyName}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-background to-muted/50 hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300"
                onClick={() => onClick(_id)}
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-background to-muted/50 hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300"
                onClick={() => onToggleFeatured(_id, !featured)}
              >
                {featured ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" /> Unfeature
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" /> Feature
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-background to-muted/50 hover:from-destructive/10 hover:to-destructive/5 hover:text-destructive transition-all duration-300"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this property? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(_id);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaggerItem>
  );
};

// Empty state component
interface EmptyStateProps {
  onCreateProperty: () => void;
  searchQuery?: string;
  hasFilters: boolean;
  onResetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateProperty,
  searchQuery,
  hasFilters,
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 animate-pulse">
        <Building className="h-12 w-12 text-primary/50" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No properties found
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {searchQuery
          ? `We couldn't find any properties matching "${searchQuery}"`
          : hasFilters
          ? "We couldn't find any properties matching your filters"
          : "There are no properties available yet. Create your first property to get started."}
      </p>
      <div className="flex gap-3">
        {hasFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            <X className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        )}
        <Button
          onClick={onCreateProperty}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Property
        </Button>
      </div>
    </div>
  );
};

// Main property listing page component
export default function PropertyListingPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State for mobile filter sheet
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get property context values
  const {
    properties,
    filteredProperties,
    isLoading,
    searchQuery,
    locationFilter,
    typeFilter,
    sortOption,
    viewMode,
    setSearchQuery,
    setLocationFilter,
    setTypeFilter,
    setSortOption,
    setViewMode,
    deleteProperty,
    getPropertyLocations,
    getPropertyTypes,
    refreshPropertyData,
    updateProperty,
  } = useProperty();

  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // State for locations and types
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Load locations and types
  useEffect(() => {
    const loadFilterOptions = async () => {
      const locationsList = await getPropertyLocations();
      const typesList = await getPropertyTypes();

      setLocations(locationsList);
      setTypes(typesList);
    };

    loadFilterOptions();
  }, []);

  // Navigation handlers
  const handleCreateProperty = () => {
    router.push("/dashboard/properties/create");
  };

  const handlePropertyClick = (id: string) => {
    router.push(`/dashboard/properties/${id}`);
  };

  // Action handlers
  const handleDeleteProperty = async (id: string) => {
    const success = await deleteProperty(id);

    if (success) {
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted.",
      });
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    const formData = new FormData();
    formData.append("featured", featured.toString());

    const updatedProperty = await updateProperty(id, formData);

    if (updatedProperty) {
      toast({
        title: featured ? "Property featured" : "Property unfeatured",
        description: `The property has been ${
          featured ? "added to" : "removed from"
        } featured listings.`,
      });

      refreshPropertyData();
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setLocationFilter("all");
    setTypeFilter("all");
    setSortOption("newest");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" || locationFilter !== "all" || typeFilter !== "all";

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Properties
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage real estate properties
            </p>
          </div>
          {isAdmin ? (
            <Button
              onClick={handleCreateProperty}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Property
            </Button>
          ) : (
            ""
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Properties</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="overflow-hidden border-none rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-md dark:shadow-primary/5">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10 bg-background/50 backdrop-blur-sm border-muted focus-visible:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Desktop filters */}
              <div className="hidden md:flex flex-wrap gap-2">
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <Building className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Tabs
                  defaultValue={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as "grid" | "list")
                  }
                >
                  <TabsList className="h-10 bg-background/50 backdrop-blur-sm border border-muted">
                    <TabsTrigger
                      value="grid"
                      className="px-3 data-[state=active]:bg-primary/10"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="px-3 data-[state=active]:bg-primary/10"
                    >
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetFilters}
                    className="h-10 px-3 bg-background/50 backdrop-blur-sm border-muted"
                  >
                    <X className="h-4 w-4 mr-2" />
                    <span>Reset</span>
                  </Button>
                )}
              </div>

              {/* Mobile filter button */}
              <div className="md:hidden">
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-background/50 backdrop-blur-sm border-muted"
                    >
                      <Filter className="h-4 w-4 mr-2" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Filter and sort properties
                      </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">View</h3>
                        <Tabs
                          defaultValue={viewMode}
                          onValueChange={(value) =>
                            setViewMode(value as "grid" | "list")
                          }
                        >
                          <TabsList className="w-full">
                            <TabsTrigger value="grid" className="flex-1">
                              <Grid3X3 className="h-4 w-4 mr-2" /> Grid
                            </TabsTrigger>
                            <TabsTrigger value="list" className="flex-1">
                              <List className="h-4 w-4 mr-2" /> List
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Location</h3>
                        <Select
                          value={locationFilter}
                          onValueChange={setLocationFilter}
                        >
                          <SelectTrigger className="w-full">
                            <MapPin className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Property Type</h3>
                        <Select
                          value={typeFilter}
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="w-full">
                            <Building className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Property Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Sort By</h3>
                        <Select
                          value={sortOption}
                          onValueChange={setSortOption}
                        >
                          <SelectTrigger className="w-full">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="price-high">
                              Price: High to Low
                            </SelectItem>
                            <SelectItem value="price-low">
                              Price: Low to High
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={handleResetFilters}>
                          <X className="h-4 w-4 mr-2" /> Reset Filters
                        </Button>
                      )}
                      <SheetClose asChild>
                        <Button className="bg-gradient-to-r from-primary to-primary/90">
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>

                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-gradient-to-r from-secondary/80 to-secondary/50"
                  >
                    <Search className="h-3 w-3" /> {searchQuery}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove search filter</span>
                    </Button>
                  </Badge>
                )}

                {locationFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-gradient-to-r from-secondary/80 to-secondary/50"
                  >
                    <MapPin className="h-3 w-3" /> {locationFilter}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setLocationFilter("all")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove location filter</span>
                    </Button>
                  </Badge>
                )}

                {typeFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-gradient-to-r from-secondary/80 to-secondary/50"
                  >
                    <Building className="h-3 w-3" /> {typeFilter}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setTypeFilter("all")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove type filter</span>
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        {filteredProperties.length === 0 ? (
          <EmptyState
            onCreateProperty={handleCreateProperty}
            searchQuery={searchQuery}
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        ) : viewMode === "grid" ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <PropertyCard
                key={property._id}
                property={property}
                onClick={handlePropertyClick}
                onDelete={handleDeleteProperty}
                onToggleFeatured={handleToggleFeatured}
                index={index}
              />
            ))}
          </StaggerContainer>
        ) : (
          <StaggerContainer className="space-y-6">
            {filteredProperties.map((property, index) => (
              <PropertyListItem
                key={property._id}
                property={property}
                onClick={handlePropertyClick}
                onDelete={handleDeleteProperty}
                onToggleFeatured={handleToggleFeatured}
                index={index}
              />
            ))}
          </StaggerContainer>
        )}
      </FadeIn>

      {/* Results count */}
      {filteredProperties.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "property" : "properties"}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
