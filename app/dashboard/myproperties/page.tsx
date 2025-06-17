"use client";

import type React from "react";

import { useEffect, useState, useMemo } from "react";
import { useUserProperties } from "@/contexts/property-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Import Search component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Download,
  FileText,
  Home,
  Map,
  MapPin,
  Package,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";

// Animation components
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <div
      className={`animate-in fade-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: "0.5s",
      }}
    >
      {children}
    </div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
}

const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={className}>{children}</div>;
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
        animationDelay: `${index * 0.1}s`,
        animationDuration: "0.5s",
      }}
    >
      {children}
    </div>
  );
};

export default function MyPropertiesPage() {
  const {
    userProperties,
    isLoading,
    error,
    filters,
    setFilters,
    fetchUserProperties,
    downloadPropertyDocument,
  } = useUserProperties();
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Function to load properties with proper error handling
  const loadProperties = async () => {
    setIsProcessing(true);

    try {
      console.log("Fetching user properties... 1");
      const success = await fetchUserProperties();

      if (!success) {
        setLocalError("Failed to load properties. Please try again.");
      }
    } catch (error: any) {
      console.error("Error loading properties:", error);
      setLocalError(
        error.message || "An error occurred while loading properties"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Get unique locations and types for filters
  const locations = useMemo(() => {
    const uniqueLocations = new Set(
      userProperties.map((property) => property.location)
    );
    return ["all", ...Array.from(uniqueLocations)];
  }, [userProperties]);

  const propertyTypes = useMemo(() => {
    const uniqueTypes = new Set(
      userProperties.map((property) => property.type)
    );
    return ["all", ...Array.from(uniqueTypes)];
  }, [userProperties]);

  // Apply filters to properties
  const filteredProperties = useMemo(() => {
    let result = [...userProperties];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (filters.location !== "all") {
      result = result.filter(
        (property) => property.location === filters.location
      );
    }

    // Apply type filter
    if (filters.type !== "all") {
      result = result.filter((property) => property.type === filters.type);
    }

    // Apply tab filter
    if (activeTab === "land") {
      result = result.filter((property) => property.type === "Land");
    } else if (activeTab === "residential") {
      result = result.filter((property) => property.type === "Residential");
    } else if (activeTab === "commercial") {
      result = result.filter((property) => property.type === "Commercial");
    }

    return result;
  }, [userProperties, filters, activeTab]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalInvestment = userProperties.reduce(
      (sum, property) => sum + property.totalInvestment,
      0
    );
    const totalPlots = userProperties.reduce(
      (sum, property) => sum + property.plotsOwned,
      0
    );
    const uniqueLocations = new Set(
      userProperties.map((property) => property.location)
    ).size;

    return {
      totalInvestment,
      totalPlots,
      uniqueLocations,
      propertyCount: userProperties.length,
    };
  }, [userProperties]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsProcessing(true);
    setLocalError(null);

    try {
      const success = await fetchUserProperties();

      if (success) {
        toast.success("Properties refreshed successfully");
      } else {
        setLocalError("Failed to refresh properties. Please try again.");
      }
    } catch (error: any) {
      console.error("Error refreshing properties:", error);
      setLocalError(
        error.message || "An error occurred while refreshing properties"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle document download with error handling
  const handleDownloadDocument = async (
    propertyId: string,
    documentType: "deed" | "plan" | "document"
  ) => {
    try {
      await downloadPropertyDocument(propertyId, documentType);
    } catch (error: any) {
      toast.error("Failed to download document", {
        description: error.message || "Please try again later",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Land":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Residential":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Commercial":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              My Properties
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and view your property investments
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isProcessing}
            className="bg-gradient-to-r from-background to-muted/50 hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isProcessing ? "animate-spin" : ""}`}
            />
            {isProcessing ? "Refreshing..." : "Refresh"}
          </Button>
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
                <BreadcrumbPage>My Properties</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      {/* Error Alert */}
      {(error || localError) && (
        <FadeIn delay={0.2}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || localError}</AlertDescription>
          </Alert>
        </FadeIn>
      )}

      {/* Summary Cards */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Investment
                  </p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {isLoading || isProcessing ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      formatCurrency(summary.totalInvestment)
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Properties Owned
                  </p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    {isLoading || isProcessing ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      summary.propertyCount
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Plots
                  </p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    {isLoading || isProcessing ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      summary.totalPlots
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Unique Locations
                  </p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    {isLoading || isProcessing ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      summary.uniqueLocations
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Map className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card className="overflow-hidden border-none rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-md dark:shadow-primary/5">
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10 bg-background/50 backdrop-blur-sm border-muted focus-visible:ring-primary/50"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ searchQuery: e.target.value })}
                  disabled={isLoading || isProcessing}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filters.location}
                  onValueChange={(value) => setFilters({ location: value })}
                  disabled={isLoading || isProcessing}
                >
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location === "all" ? "All Locations" : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ type: value })}
                  disabled={isLoading || isProcessing}
                >
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <Home className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid grid-cols-4 bg-muted/50">
                <TabsTrigger value="all" disabled={isLoading || isProcessing}>
                  All
                </TabsTrigger>
                <TabsTrigger value="land" disabled={isLoading || isProcessing}>
                  Land
                </TabsTrigger>
                <TabsTrigger
                  value="residential"
                  disabled={isLoading || isProcessing}
                >
                  Residential
                </TabsTrigger>
                <TabsTrigger
                  value="commercial"
                  disabled={isLoading || isProcessing}
                >
                  Commercial
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Content */}
            {isLoading || isProcessing ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      <Skeleton className="lg:w-64 h-48 lg:h-auto" />
                      <div className="p-6 flex-1 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="grid grid-cols-3 gap-4">
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 animate-pulse">
                  <Home className="h-12 w-12 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No properties found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {userProperties.length > 0
                    ? "Try adjusting your filters to see more results."
                    : "You don't own any properties yet."}
                </p>
              </div>
            ) : (
              <StaggerContainer className="space-y-6">
                {filteredProperties.map((property, index) => (
                  <StaggerItem key={property._id} index={index}>
                    <Card className="group overflow-hidden bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
                      <div className="flex flex-col lg:flex-row">
                        <div className="relative lg:w-64 h-48 lg:h-auto flex-shrink-0">
                          {property.thumbnail ? (
                            <Image
                              src={property.thumbnail || "/placeholder.svg"}
                              alt={property.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                              <Home className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <Badge className={getTypeColor(property.type)}>
                              {property.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {property.title}
                              </h3>
                              <div className="flex items-center text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{property.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">
                                Investment
                              </div>
                              <div className="text-foreground font-semibold">
                                {formatCurrency(property.totalInvestment)}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">
                                Plots Owned
                              </div>
                              <div className="text-foreground font-semibold">
                                {property.plotsOwned}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">
                                Plot Size
                              </div>
                              <div className="text-foreground font-semibold">
                                {property.plotSize || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadDocument(property._id, "deed")
                              }
                              className="bg-background/50 backdrop-blur-sm hover:bg-muted"
                            >
                              <FileText className="mr-2 h-4 w-4" /> Deed
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadDocument(property._id, "plan")
                              }
                              className="bg-background/50 backdrop-blur-sm hover:bg-muted"
                            >
                              <Map className="mr-2 h-4 w-4" /> Plan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadDocument(property._id, "document")
                              }
                              className="bg-background/50 backdrop-blur-sm hover:bg-muted hover:text-primary transition-colors"
                            >
                              <Download className="mr-2 h-4 w-4" /> All
                              Documents
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
