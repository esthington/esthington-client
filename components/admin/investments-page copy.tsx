"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Building,
  ArrowUpDown,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Percent,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/ui/animated-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import Image from "next/image";
import { useInvestment } from "@/contexts/investments-context";
import { useAuth } from "@/contexts/auth-context";

export default function InvestmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    filteredInvestments,
    isLoading,
    filters,
    // sortOption,
    setFilters,
    // setSortOption,
    fetchInvestments,
  } = useInvestment();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Update search query and filter investments
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // We'll handle search in the UI for now, but in a real app this would be part of the context filters
  };

  // Filter by search query locally (this could be moved to the context in a real app)
  const searchFilteredInvestments = filteredInvestments.filter((property) => {
    if (
      searchQuery &&
      !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.propertyId?.location
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleInvestNow = (id: string) => {
    router.push(`/dashboard/invest-now?propertyId=${id}`);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/investments/${id}`);
  };

  const handleEditInvestment = (id: string) => {
    router.push(`/dashboard/investments/edit/${id}`);
  };

  const handleDeleteInvestment = (id: string) => {
    // Implement delete confirmation dialog here
    if (window.confirm("Are you sure you want to delete this investment?")) {
      // Call delete function from context
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Estate Investments
            </h1>
            <p className="text-gray-400 mt-1">
              Discover and invest in premium real estate opportunities
            </p>
          </div>
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
                <BreadcrumbPage>All Investments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search investments..."
                className="pl-10 bg-[#1F1F23]/50 border-[#2B2B30]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ location: value })}
              >
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ type: value })}
              >
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <Building className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters({ sortBy: value })}
              >
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="returnRate-high">
                    Return Rate (High)
                  </SelectItem>
                  <SelectItem value="returnRate-low">
                    Return Rate (Low)
                  </SelectItem>
                  <SelectItem value="target-high">Price (High)</SelectItem>
                  <SelectItem value="target-low">Price (Low)</SelectItem>
                  <SelectItem value="funded-high">Funding (High)</SelectItem>
                  <SelectItem value="funded-low">Funding (Low)</SelectItem>
                </SelectContent>
              </Select>

              <Tabs
                defaultValue={viewMode}
                onValueChange={(value) => setViewMode(value as "grid" | "list")}
              >
                <TabsList className="h-10 bg-[#1F1F23]/50 border-[#2B2B30]">
                  <TabsTrigger
                    value="grid"
                    className="px-3 data-[state=active]:bg-[#2B2B30]"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="px-3 data-[state=active]:bg-[#2B2B30]"
                  >
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Return Rate:</span>
                <span className="text-sm font-medium text-white">
                  {filters.returnRateRange[0]}% - {filters.returnRateRange[1]}%
                </span>
              </div>
              <div className="w-full sm:w-1/2">
                <Slider
                  value={filters.returnRateRange}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={(value) =>
                    setFilters({ returnRateRange: value as [number, number] })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : searchFilteredInvestments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No properties found
            </h3>
            <p className="text-gray-400 max-w-md">
              We couldn't find any properties matching your search criteria. Try
              adjusting your filters or search query.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchFilteredInvestments.map((property) => (
              <StaggerItem key={property._id}>
                <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                  <div className="relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={
                          typeof property.propertyId === "object" &&
                          property.propertyId?.thumbnail
                            ? property.propertyId.thumbnail
                            : "/placeholder.svg?height=400&width=600&query=property"
                        }
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {property.featured && (
                        <Badge
                          variant="default"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      )}
                      {property.trending && (
                        <Badge
                          variant="default"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" /> Trending
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className="bg-black/50 backdrop-blur-md border-white/20 text-white"
                        >
                          {typeof property.propertyId === "object"
                            ? property.propertyId?.type
                            : "Real Estate"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white"
                        >
                          <Percent className="h-3 w-3 mr-1" />{" "}
                          {property.returnRate}% ROI
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {typeof property.propertyId === "object"
                          ? property.propertyId?.location
                          : "Nigeria"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">
                            Funding Progress
                          </span>
                          <span className="text-white font-medium">
                            {property.percentageFunded}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${property.percentageFunded}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>
                          Target: {formatCurrency(property.targetAmount)}
                        </span>
                        <span>{property.totalInvestors} investors</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">
                          Minimum Investment
                        </div>
                        <div className="text-white font-semibold">
                          {formatCurrency(property.minimumInvestment)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(property._id)}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {isAdmin ? (
                          <>
                            <Button
                              onClick={() => handleEditInvestment(property._id)}
                              variant="outline"
                              size="sm"
                              className="border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeleteInvestment(property._id)
                              }
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleInvestNow(property._id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                          >
                            Invest Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <StaggerChildren className="space-y-4">
            {searchFilteredInvestments.map((property) => (
              <StaggerItem key={property._id}>
                <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-64 h-48 sm:h-auto flex-shrink-0">
                      <Image
                        src={
                          typeof property.propertyId === "object" &&
                          property.propertyId?.thumbnail
                            ? property.propertyId.thumbnail
                            : "/placeholder.svg?height=400&width=600&query=property"
                        }
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {property.featured && (
                          <Badge
                            variant="default"
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {property.trending && (
                          <Badge
                            variant="default"
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" /> Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span>
                              {typeof property.propertyId === "object"
                                ? property.propertyId?.location
                                : "Nigeria"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className="bg-black/50 backdrop-blur-md border-white/20 text-white"
                          >
                            {typeof property.propertyId === "object"
                              ? property.propertyId?.type
                              : "Real Estate"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white"
                          >
                            <Percent className="h-3 w-3 mr-1" />{" "}
                            {property.returnRate}% ROI
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">
                                Funding Progress
                              </span>
                              <span className="text-white font-medium">
                                {property.percentageFunded}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{
                                  width: `${property.percentageFunded}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>
                              Target: {formatCurrency(property.targetAmount)}
                            </span>
                            <span>{property.totalInvestors} investors</span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-xs text-gray-400">
                                Min Investment
                              </div>
                              <div className="text-white font-medium">
                                {formatCurrency(property.minimumInvestment)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">
                                Period
                              </div>
                              <div className="text-white font-medium">
                                {property.investmentPeriod} months
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => handleViewDetails(property._id)}
                              variant="outline"
                              size="sm"
                              className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View Details
                            </Button>

                            {isAdmin ? (
                              <>
                                <Button
                                  onClick={() =>
                                    handleEditInvestment(property._id)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleDeleteInvestment(property._id)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => handleInvestNow(property._id)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                              >
                                Invest Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </FadeIn>
    </div>
  );
}
