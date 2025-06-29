"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Building, ArrowUpDown, Grid3X3, List, Star, TrendingUp, Percent } from "lucide-react"
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

interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  returnRate: number
  investmentPeriod: string
  minInvestment: number
  totalInvestors: number
  funded: number
  target: number
  image: string
  featured: boolean
  trending: boolean
}

export default function MarketplacePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [returnRateFilter, setReturnRateFilter] = useState<[number, number]>([5, 20])
  const [sortOption, setSortOption] = useState<string>("trending")
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setProperties([
        {
          id: "1",
          title: "Luxury Apartment Complex",
          location: "Lagos, Nigeria",
          price: 250000000,
          type: "Residential",
          returnRate: 12,
          investmentPeriod: "36 months",
          minInvestment: 100000,
          totalInvestors: 45,
          funded: 75,
          target: 250000000,
          image:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D",
          featured: true,
          trending: true,
        },
        {
          id: "2",
          title: "Commercial Office Building",
          location: "Abuja, Nigeria",
          price: 450000000,
          type: "Commercial",
          returnRate: 15,
          investmentPeriod: "48 months",
          minInvestment: 250000,
          totalInvestors: 28,
          funded: 60,
          target: 450000000,
          image:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29tbWVyY2lhbCUyMGJ1aWxkaW5nfGVufDB8fDB8fHww",
          featured: false,
          trending: true,
        },
        {
          id: "3",
          title: "Residential Housing Estate",
          location: "Port Harcourt, Nigeria",
          price: 350000000,
          type: "Residential",
          returnRate: 10,
          investmentPeriod: "24 months",
          minInvestment: 50000,
          totalInvestors: 120,
          funded: 90,
          target: 350000000,
          image:
            "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG91c2luZyUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D",
          featured: true,
          trending: false,
        },
        {
          id: "4",
          title: "Shopping Mall Development",
          location: "Lagos, Nigeria",
          price: 650000000,
          type: "Commercial",
          returnRate: 18,
          investmentPeriod: "60 months",
          minInvestment: 500000,
          totalInvestors: 15,
          funded: 40,
          target: 650000000,
          image:
            "https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNob3BwaW5nJTIwbWFsbHxlbnwwfHwwfHx8MA%3D%3D",
          featured: false,
          trending: true,
        },
        {
          id: "5",
          title: "Waterfront Luxury Villas",
          location: "Lagos, Nigeria",
          price: 850000000,
          type: "Residential",
          returnRate: 14,
          investmentPeriod: "48 months",
          minInvestment: 200000,
          totalInvestors: 32,
          funded: 55,
          target: 850000000,
          image:
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D",
          featured: true,
          trending: true,
        },
        {
          id: "6",
          title: "Industrial Warehouse Complex",
          location: "Abuja, Nigeria",
          price: 320000000,
          type: "Industrial",
          returnRate: 16,
          investmentPeriod: "36 months",
          minInvestment: 150000,
          totalInvestors: 25,
          funded: 80,
          target: 320000000,
          image:
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2FyZWhvdXNlfGVufDB8fDB8fHww",
          featured: false,
          trending: false,
        },
      ])
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Filter properties based on search query and filters
  const filteredProperties = properties.filter((property) => {
    // Filter by search query
    if (
      searchQuery &&
      !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by location
    if (locationFilter !== "all" && !property.location.includes(locationFilter)) {
      return false
    }

    // Filter by type
    if (typeFilter !== "all" && property.type !== typeFilter) {
      return false
    }

    // Filter by return rate
    if (property.returnRate < returnRateFilter[0] || property.returnRate > returnRateFilter[1]) {
      return false
    }

    return true
  })

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortOption) {
      case "trending":
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
      case "featured":
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      case "return-high":
        return b.returnRate - a.returnRate
      case "return-low":
        return a.returnRate - b.returnRate
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "funded-high":
        return b.funded - a.funded
      case "funded-low":
        return a.funded - b.funded
      default:
        return 0
    }
  })

  const handleInvestNow = (id: string) => {
    router.push(`/dashboard/invest-now?propertyId=${id}`)
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
            <h1 className="text-2xl font-bold text-white">Investment Marketplace</h1>
            <p className="text-gray-400 mt-1">Discover and invest in premium real estate opportunities</p>
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
                <BreadcrumbPage>Marketplace</BreadcrumbPage>
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
                placeholder="Search properties..."
                className="pl-10 bg-[#1F1F23]/50 border-[#2B2B30]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
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

              <Select value={typeFilter} onValueChange={setTypeFilter}>
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

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="return-high">Return: High to Low</SelectItem>
                  <SelectItem value="return-low">Return: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="funded-high">Funding: High to Low</SelectItem>
                  <SelectItem value="funded-low">Funding: Low to High</SelectItem>
                </SelectContent>
              </Select>

              <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                <TabsList className="h-10 bg-[#1F1F23]/50 border-[#2B2B30]">
                  <TabsTrigger value="grid" className="px-3 data-[state=active]:bg-[#2B2B30]">
                    <Grid3X3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3 data-[state=active]:bg-[#2B2B30]">
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
                  {returnRateFilter[0]}% - {returnRateFilter[1]}%
                </span>
              </div>
              <div className="w-full sm:w-1/2">
                <Slider
                  value={returnRateFilter}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={(value) => setReturnRateFilter([value[0], value[1]])}
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
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No properties found</h3>
            <p className="text-gray-400 max-w-md">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((property) => (
              <StaggerItem key={property.id}>
                <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                  <div className="relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {property.featured && (
                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      )}
                      {property.trending && (
                        <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                          <TrendingUp className="h-3 w-3 mr-1" /> Trending
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/20 text-white">
                          {property.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white"
                        >
                          <Percent className="h-3 w-3 mr-1" /> {property.returnRate}% ROI
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Funding Progress</span>
                          <span className="text-white font-medium">{property.funded}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${property.funded}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Target: {formatCurrency(property.target)}</span>
                        <span>{property.totalInvestors} investors</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Minimum Investment</div>
                        <div className="text-white font-semibold">{formatCurrency(property.minInvestment)}</div>
                      </div>
                      <Button
                        onClick={() => handleInvestNow(property.id)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        Invest Now
                      </Button>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <StaggerChildren className="space-y-4">
            {sortedProperties.map((property) => (
              <StaggerItem key={property.id}>
                <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-64 h-48 sm:h-auto flex-shrink-0">
                      <Image
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {property.featured && (
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {property.trending && (
                          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                            <TrendingUp className="h-3 w-3 mr-1" /> Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{property.title}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span>{property.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/20 text-white">
                            {property.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white"
                          >
                            <Percent className="h-3 w-3 mr-1" /> {property.returnRate}% ROI
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Funding Progress</span>
                              <span className="text-white font-medium">{property.funded}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${property.funded}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Target: {formatCurrency(property.target)}</span>
                            <span>{property.totalInvestors} investors</span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-xs text-gray-400">Min Investment</div>
                              <div className="text-white font-medium">{formatCurrency(property.minInvestment)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Period</div>
                              <div className="text-white font-medium">{property.investmentPeriod}</div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleInvestNow(property.id)}
                            className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                          >
                            Invest Now
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
