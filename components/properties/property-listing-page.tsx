"use client"
import { useRouter } from "next/navigation"
import { Plus, Search, MapPin, Building, ArrowUpDown, Grid3X3, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import FadeIn from "@/components/animations/fade-in"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"
import PropertyCard from "./property-card"
import PropertyListItem from "./property-list-item"
import { useProperty } from "@/contexts/property-context"
import { usePropertyPermissions } from "@/hooks/use-property-permissions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function PropertyListingPage() {
  const router = useRouter()
  const { permissions } = usePropertyPermissions()

  const {
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
  } = useProperty()

  const handleCreateProperty = () => {
    router.push("/dashboard/properties/create")
  }

  const handlePropertyClick = (id: string) => {
    router.push(`/dashboard/properties/${id}`)
  }

  const handleDeleteProperty = async (id: string) => {
    await deleteProperty(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and manage real estate properties</p>
          </div>
          {permissions.canCreate && (
            <AnimatedButton onClick={handleCreateProperty} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add New Property
            </AnimatedButton>
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

        <AnimatedCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Building className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>

              <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                <TabsList className="h-10">
                  <TabsTrigger value="grid" className="px-3">
                    <Grid3X3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.2}>
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <StaggerItem key={property.id}>
                <PropertyCard
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                  onDelete={permissions.canDelete ? () => handleDeleteProperty(property.id) : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <StaggerChildren className="space-y-4">
            {filteredProperties.map((property) => (
              <StaggerItem key={property.id}>
                <PropertyListItem
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                  onDelete={permissions.canDelete ? () => handleDeleteProperty(property.id) : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </FadeIn>
    </div>
  )
}
