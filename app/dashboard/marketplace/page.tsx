"use client"
import { useRouter } from "next/navigation"
import { Search, MapPin, ArrowUpDown, Grid3X3, List, Star, Map } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/ui/animated-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import FadeIn from "@/components/animations/fade-in"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"
import Image from "next/image"
import { useMarketplace } from "@/contexts/marketplace-context"
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions"
import { toast } from "sonner"

export default function MarketplacePage() {
  const router = useRouter()
  const { filteredListings, filters, setFilters, buyProperty, isLoading } = useMarketplace()

  // For demo purposes, we'll use buyer role
  const { hasPermission } = useMarketplacePermissions("buyer")

  const handleBuyNow = async (id: string) => {
    try {
      // In a real app, you would get the current user ID
      await buyProperty(id, "current-user-id")
      toast.success("Processing your request", {
        description: "You will be redirected to complete your purchase.",
      })

      // Navigate to purchase page after a delay
      setTimeout(() => {
        router.push(`/dashboard/buy-now?landId=${id}`)
      }, 2000)
    } catch (error) {
      toast.error("Failed to process your request", {
        description: "Please try again later.",
      })
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Land Marketplace</h1>
            <p className="text-muted-foreground mt-1">Browse and purchase premium land properties</p>
          </div>

          {hasPermission("addListing") && (
            <Button
              onClick={() => router.push("/dashboard/marketplace/add")}
              className="bg-primary hover:bg-primary/90"
            >
              Add Listing
            </Button>
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
                <BreadcrumbPage>Marketplace</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="p-6 bg-card backdrop-blur-xl border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lands..."
                className="pl-10 bg-background/50 border-input"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filters.location} onValueChange={(value) => setFilters({ location: value })}>
                <SelectTrigger className="w-[140px] bg-background/50 border-input">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => setFilters({ type: value })}>
                <SelectTrigger className="w-[140px] bg-background/50 border-input">
                  <Map className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Land Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ sortBy: value })}>
                <SelectTrigger className="w-[140px] bg-background/50 border-input">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Tabs
                defaultValue={filters.viewMode}
                onValueChange={(value) => setFilters({ viewMode: value as "grid" | "list" })}
              >
                <TabsList className="h-10 bg-background/50 border-input">
                  <TabsTrigger value="grid" className="px-3 data-[state=active]:bg-muted">
                    <Grid3X3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3 data-[state=active]:bg-muted">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Price Range:</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
                </span>
              </div>
              <div className="w-full sm:w-1/2">
                <Slider
                  value={filters.priceRange}
                  min={5000000}
                  max={300000000}
                  step={5000000}
                  onValueChange={(value) => setFilters({ priceRange: value as [number, number] })}
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
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No lands found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any lands matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        ) : filters.viewMode === "grid" ? (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((land) => (
              <StaggerItem key={land.id}>
                <AnimatedCard className="overflow-hidden bg-card backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300">
                  <div className="relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={land.images[0] || "/placeholder.svg"}
                        alt={land.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {land.featured && (
                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      )}
                      {land.trending && (
                        <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                          <Map className="h-3 w-3 mr-1" /> Hot Property
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/20 text-white">
                          {land.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white"
                        >
                          {land.size}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{land.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{land.location}</span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex flex-wrap gap-1">
                        {land.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-muted text-muted-foreground">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Price</div>
                        <div className="text-foreground font-semibold">{formatCurrency(land.price)}</div>
                      </div>
                      <Button
                        onClick={() => handleBuyNow(land.id)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        disabled={!hasPermission("buyProperty")}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <StaggerChildren className="space-y-4">
            {filteredListings.map((land) => (
              <StaggerItem key={land.id}>
                <AnimatedCard className="overflow-hidden bg-card backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-64 h-48 sm:h-auto flex-shrink-0">
                      <Image
                        src={land.images[0] || "/placeholder.svg"}
                        alt={land.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {land.featured && (
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {land.trending && (
                          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                            <Map className="h-3 w-3 mr-1" /> Hot Property
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{land.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span>{land.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/20 text-white">
                            {land.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white"
                          >
                            {land.size}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {land.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="bg-muted text-muted-foreground">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Price</div>
                              <div className="text-foreground font-medium">{formatCurrency(land.price)}</div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleBuyNow(land.id)}
                            className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                            disabled={!hasPermission("buyProperty")}
                          >
                            Buy Now
                          </Button>
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
  )
}
