"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash, Eye, Search, Plus, Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import FadeIn from "@/components/animations/fade-in"
import { useMarketplace } from "@/contexts/marketplace-context"
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions"
import { toast } from "sonner"

export default function ManageMarketplaceListingsPage() {
  const router = useRouter()
  const { listings, deleteListing, featureListing, isLoading, isSubmitting } = useMarketplace()

  // For demo purposes, we'll use agent role
  const { hasPermission } = useMarketplacePermissions("agent")

  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)

  // Filter listings by search query and only show current user's listings
  // In a real app, you would filter by the current user's ID
  const filteredListings = listings.filter(
    (listing) =>
      (listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
      listing.seller.id === "current-user-id", // This would be the current user's ID
  )

  const handleViewListing = (id: string) => {
    router.push(`/dashboard/marketplace/view/${id}`)
  }

  const handleEditListing = (id: string) => {
    router.push(`/dashboard/marketplace/edit/${id}`)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedListingId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedListingId) return

    try {
      await deleteListing(selectedListingId)
      toast.success("Listing deleted successfully")
    } catch (error) {
      toast.error("Failed to delete listing")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedListingId(null)
    }
  }

  const handleFeatureToggle = async (id: string, featured: boolean) => {
    try {
      await featureListing(id, !featured)
      toast.success(`Listing ${!featured ? "featured" : "unfeatured"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${!featured ? "feature" : "unfeature"} listing`)
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/marketplace">Marketplace</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manage Listings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Marketplace Listings</h1>
            <p className="text-muted-foreground mt-1">View, edit, and manage your property listings</p>
          </div>

          {hasPermission("addListing") && (
            <Button
              onClick={() => router.push("/dashboard/marketplace/add")}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AnimatedCard className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[120px]">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All Listings</DropdownMenuItem>
                    <DropdownMenuItem>Available</DropdownMenuItem>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                    <DropdownMenuItem>Sold</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[120px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                    <DropdownMenuItem>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.2}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredListings.length === 0 ? (
          <AnimatedCard className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No listings found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery
                  ? "We couldn't find any listings matching your search criteria."
                  : "You haven't created any listings yet. Add your first listing to get started."}
              </p>
              {hasPermission("addListing") && (
                <Button
                  onClick={() => router.push("/dashboard/marketplace/add")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Listing
                </Button>
              )}
            </div>
          </AnimatedCard>
        ) : (
          <AnimatedCard>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {listing.featured && (
                              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                                Featured
                              </Badge>
                            )}
                          </div>
                          {listing.title}
                        </div>
                      </TableCell>
                      <TableCell>{listing.location}</TableCell>
                      <TableCell>{formatCurrency(listing.price)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            listing.status === "available"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : listing.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(listing.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewListing(listing.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission("editListing") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditListing(listing.id)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission("deleteListing") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(listing.id)}
                              title="Delete"
                              className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AnimatedCard>
        )}
      </FadeIn>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
