"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, MapPin, User, Phone, Mail } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import PageTransition from "@/components/animations/page-transition"
import FadeIn from "@/components/animations/fade-in"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"
import { useMarketplace } from "@/contexts/marketplace-context"
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function ViewMarketplaceListingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getListing, isLoading } = useMarketplace()

  // For demo purposes, we'll use agent role
  const { hasPermission } = useMarketplacePermissions("agent")

  const [listing, setListing] = useState<any | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Get listing details
    const foundListing = getListing(params.id)

    if (foundListing) {
      setListing(foundListing)
    } else {
      toast.error("Listing not found")
      router.push("/dashboard/marketplace")
    }
  }, [params.id, getListing, router])

  const handlePrevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))
    }
  }

  if (isLoading || !listing) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-4">
        <Breadcrumb className="mb-4">
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
              <BreadcrumbLink href="/dashboard/marketplace/manage">Manage</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>View Listing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FadeIn>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
            </div>
            {hasPermission("editListing") && (
              <Button
                variant="outline"
                className="border-primary/50 hover:bg-primary/20"
                onClick={() => router.push(`/dashboard/marketplace/edit/${listing.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </FadeIn>

        <StaggerChildren>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StaggerItem>
              <AnimatedCard className="col-span-2 overflow-hidden">
                <div className="relative aspect-video w-full">
                  {listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[currentImageIndex] || "/placeholder.svg"}
                        alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                          >
                            <ArrowLeft className="h-5 w-5 rotate-180" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1">
                            {listing.images.map((_: string, index: number) => (
                              <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 w-2 rounded-full ${
                                index === currentImageIndex ? "bg-white" : "bg-white/50"
                              }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <p className="text-muted-foreground">No images available</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {listing.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        listing.status === "available"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : listing.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-6 flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{listing.location}</span>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                      <p className="text-lg font-semibold text-primary">{formatCurrency(listing.price)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                      <p className="text-lg font-semibold text-foreground">{listing.size}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Listed On</h3>
                      <p className="text-lg font-semibold text-foreground">{new Date(listing.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold text-foreground">Description</h2>
                    <p className="text-muted-foreground">{listing.description}</p>
                  </div>
                </div>
              </AnimatedCard>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-6">
                <AnimatedCard>
                  <div className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Seller Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium text-foreground">{listing.seller.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium text-foreground">{listing.seller.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground">{listing.seller.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <div className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Actions</h2>
                    <div className="space-y-3">
                      {hasPermission("editListing") && (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => router.push(`/dashboard/marketplace/edit/${listing.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Listing
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full border-primary/50 hover:bg-primary/20"
                        onClick={() => router.push("/dashboard/marketplace/manage")}
                      >
                        Back to Manage Listings
                      </Button>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </StaggerItem>
          </div>
        </StaggerChildren>
      </div>
    </PageTransition>
  )
}
