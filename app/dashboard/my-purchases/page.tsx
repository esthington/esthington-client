"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Map,
  Filter,
  Download,
  Eye,
  FileText,
  MapPin,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";
import {
  useMarketplace,
  type UserPurchase,
  type MarketplacePlot,
} from "@/contexts/marketplace-context";

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

export default function MyPurchasesPage() {
  const router = useRouter();
  const {
    userPurchases,
    filters,
    setFilters,
    isLoading,
    downloadDocument,
    fetchUserPurchases,
  } = useMarketplace();

  useEffect(() => {
    fetchUserPurchases();
  }, [fetchUserPurchases]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Sold Out":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Coming Soon":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleViewProperty = (id: string) => {
    router.push(`/dashboard/marketplace/${id}`);
  };

  const handleDownloadDocument = async (
    propertyId: string,
    docType: string,
    docUrl: string
  ) => {
    try {
      await downloadDocument(propertyId, docType, docUrl);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  // Calculate summary statistics
  const totalInvestment = userPurchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );
  const totalPlots = userPurchases.reduce(
    (sum, purchase) => sum + purchase.purchasedPlots.length,
    0
  );
  const totalProperties = userPurchases.length;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              My Property Purchases
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your property portfolio and plot ownership
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/marketplace")}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Map className="mr-2 h-4 w-4" /> Browse More Properties
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
                <BreadcrumbPage>My Purchases</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      {/* Purchase Summary */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Investment
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {formatCurrency(totalInvestment)}
                  </p>
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
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    {totalProperties}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Map className="h-6 w-6 text-green-600" />
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
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    {totalPlots}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card className="overflow-hidden border-none rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-md dark:shadow-primary/5">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10 bg-background/50 backdrop-blur-sm border-muted focus-visible:ring-primary/50"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters({ ...filters, type: value })
                  }
                >
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.location}
                  onValueChange={(value) =>
                    setFilters({ ...filters, location: value })
                  }
                >
                  <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm border-muted">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="PortHarcourt">Port Harcourt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
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
            ) : userPurchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 animate-pulse">
                  <Map className="h-12 w-12 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Properties Found
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  You haven't purchased any properties yet. Start exploring our
                  marketplace to find your perfect property.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/marketplace")}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Map className="mr-2 h-4 w-4" /> Explore Marketplace
                </Button>
              </div>
            ) : (
              <StaggerContainer className="space-y-6">
                {userPurchases.map((purchase: UserPurchase, index) => (
                  <StaggerItem key={purchase._id} index={index}>
                    <Card className="group overflow-hidden bg-gradient-to-b from-background to-muted/30 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-primary/5 dark:hover:shadow-primary/10">
                      <div className="flex flex-col lg:flex-row">
                        <div className="relative lg:w-64 h-48 lg:h-auto flex-shrink-0">
                          <Image
                            src={
                              purchase.property.thumbnail ||
                              "/placeholder.svg?height=200&width=300" ||
                              "/placeholder.svg"
                            }
                            alt={purchase.property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <Badge
                              variant="outline"
                              className="bg-background/80 backdrop-blur-md border-border/50 text-foreground"
                            >
                              {purchase.property.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {purchase.property.title}
                              </h3>
                              <div className="flex items-center text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{purchase.property.location}</span>
                              </div>
                            </div>
                            <Badge
                              className={getStatusColor(
                                purchase.property.status
                              )}
                            >
                              {purchase.property.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">
                                Plots Owned
                              </div>
                              <div className="text-foreground font-semibold">
                                {purchase.purchasedPlots.length} plots
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total Investment:{" "}
                                {formatCurrency(purchase.totalAmount)}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">
                                Plot Size
                              </div>
                              <div className="text-foreground font-semibold">
                                {purchase.property.plotSize} sqm each
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total Area:{" "}
                                {Number.parseInt(purchase.property.plotSize) *
                                  purchase.purchasedPlots.length}{" "}
                                sqm
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground mb-1">
                                Purchase Date
                              </div>
                              <div className="text-foreground font-semibold">
                                {purchase.purchasedPlots.length > 0 &&
                                purchase.purchasedPlots[0].soldDate
                                  ? formatDate(
                                      purchase.purchasedPlots[0].soldDate
                                    )
                                  : "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Documents Available
                              </div>
                            </div>
                          </div>

                          {/* Owned Plots Details */}
                          <div className="mb-4">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Your Plots:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {purchase.purchasedPlots.map(
                                (plot: MarketplacePlot) => (
                                  <Badge
                                    key={plot._id}
                                    variant="outline"
                                    className="bg-primary/10 border-primary/30 text-primary"
                                  >
                                    {plot.plotId} - {formatCurrency(plot.price)}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            {purchase.property.documents &&
                              purchase.property.documents.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadDocument(
                                      purchase.property._id,
                                      "deed",
                                      purchase.property.documents![0]
                                    )
                                  }
                                  className="bg-background/50 backdrop-blur-sm hover:bg-muted"
                                >
                                  <FileText className="mr-2 h-4 w-4" /> Download
                                  Deed
                                </Button>
                              )}
                            {purchase.property.planFile && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadDocument(
                                    purchase.property._id,
                                    "plan",
                                    purchase.property.planFile!
                                  )
                                }
                                className="bg-background/50 backdrop-blur-sm hover:bg-muted"
                              >
                                <Download className="mr-2 h-4 w-4" /> Download
                                Plan
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewProperty(purchase.property._id)
                              }
                              className="bg-background/50 backdrop-blur-sm hover:bg-muted hover:text-primary transition-colors"
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
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
