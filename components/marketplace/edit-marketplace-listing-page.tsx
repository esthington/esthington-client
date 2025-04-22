"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Button } from "@/components/ui/button"
import { AnimatedInput } from "@/components/ui/animated-input"
import { Textarea } from "@/components/ui/textarea"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useMarketplace } from "@/contexts/marketplace-context"
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions"
import { toast } from "sonner"

export function EditMarketplaceListingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getListing, updateListing, isLoading, isSubmitting } = useMarketplace()

  // For demo purposes, we'll use agent role
  const { hasPermission } = useMarketplacePermissions("agent")

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    location: "",
    price: 0,
    size: "",
    type: "",
    status: "available" as "available" | "pending" | "sold",
    description: "",
    images: [] as string[],
    sellerName: "",
    sellerPhone: "",
    sellerEmail: "",
    features: [] as string[],
  })

  useEffect(() => {
    // Get listing details
    const listing = getListing(params.id)

    if (listing) {
      setFormData({
        id: listing.id,
        title: listing.title,
        location: listing.location,
        price: listing.price,
        size: listing.size,
        type: listing.type,
        status: listing.status,
        description: listing.description,
        images: listing.images,
        sellerName: listing.seller.name,
        sellerPhone: listing.seller.phone,
        sellerEmail: listing.seller.email,
        features: listing.features,
      })
    } else {
      toast.error("Listing not found")
      router.push("/dashboard/marketplace/manage")
    }
  }, [params.id, getListing, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleAddImage = () => {
    // In a real app, you would implement image upload
    // For now, we'll just add a placeholder
    const newImage = `/placeholder.svg?height=400&width=600&text=Image ${formData.images.length + 1}`
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasPermission("editListing")) {
      toast.error("Permission denied", {
        description: "You don't have permission to edit listings.",
      })
      return
    }

    try {
      // Update the listing
      await updateListing(formData.id, {
        title: formData.title,
        location: formData.location,
        price: formData.price,
        size: formData.size,
        type: formData.type,
        status: formData.status,
        description: formData.description,
        images: formData.images,
        features: formData.features,
        seller: {
          id: "current-user-id", // This would be the current user's ID
          name: formData.sellerName,
          email: formData.sellerEmail,
          phone: formData.sellerPhone,
          avatar: "/placeholder.svg?height=40&width=40", // This would come from the user profile
        },
      })

      toast.success("Listing updated successfully")

      // Redirect to manage listings page
      setTimeout(() => {
        router.push("/dashboard/marketplace/manage")
      }, 1500)
    } catch (error) {
      toast.error("Failed to update listing", {
        description: "Please try again later.",
      })
    }
  }

  if (isLoading) {
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
              <BreadcrumbPage>Edit Listing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FadeIn>
          <div className="mb-4 flex items-center">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Edit Listing</h1>
          </div>
        </FadeIn>

        <StaggerChildren>
          <AnimatedCard className="mb-6">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <StaggerItem>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground">
                      Title
                    </label>
                    <AnimatedInput
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-foreground">
                      Location
                    </label>
                    <AnimatedInput
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-foreground">
                      Price (₦)
                    </label>
                    <AnimatedInput
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price.toString()}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1000"
                      className="mt-1"
                    />
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-foreground">
                      Size
                    </label>
                    <AnimatedInput
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="e.g., 500 sqm"
                    />
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-foreground">
                      Type
                    </label>
                    <AnimatedInput
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="e.g., Residential, Commercial"
                    />
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-foreground">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange as any}
                      required
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </StaggerItem>
              </div>

              <StaggerItem>
                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-foreground">Images</label>
                  <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative h-24 w-full overflow-hidden rounded-md border border-border">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Listing image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 shadow-sm hover:bg-background"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-border hover:border-primary/50"
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground">Seller Information</h3>
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label htmlFor="sellerName" className="block text-sm font-medium text-foreground">
                        Name
                      </label>
                      <AnimatedInput
                        id="sellerName"
                        name="sellerName"
                        value={formData.sellerName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="sellerPhone" className="block text-sm font-medium text-foreground">
                        Phone
                      </label>
                      <AnimatedInput
                        id="sellerPhone"
                        name="sellerPhone"
                        value={formData.sellerPhone}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="sellerEmail" className="block text-sm font-medium text-foreground">
                        Email
                      </label>
                      <AnimatedInput
                        id="sellerEmail"
                        name="sellerEmail"
                        type="email"
                        value={formData.sellerEmail}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-8 flex space-x-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/marketplace/manage")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </StaggerItem>
            </form>
          </AnimatedCard>
        </StaggerChildren>
      </div>
    </PageTransition>
  )
}
