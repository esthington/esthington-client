"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Upload, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AnimatePresence } from "framer-motion"
import { esthingtonCompanies } from "@/lib/company-data"
import Image from "next/image"
import { useMarketplace } from "@/contexts/marketplace-context"
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions"
import { toast } from "sonner"

export default function AddMarketplaceListingPage() {
  const router = useRouter()
  const { addListing, isSubmitting } = useMarketplace()

  // For demo purposes, we'll use agent role
  const { hasPermission } = useMarketplacePermissions("agent")

  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    propertyType: "",
    investmentType: "fractional",
    minInvestment: "",
    expectedReturn: "",
    duration: "",
    maxInvestors: "",
    featured: false,
    companyId: "",
    images: [] as File[],
    features: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...filesArray] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasPermission("addListing")) {
      toast.error("Permission denied", {
        description: "You don't have permission to add listings.",
      })
      return
    }

    try {
      // Convert form data to listing format
      const imageUrls = formData.images.map(
        (_, index) => `/placeholder.svg?height=400&width=600&text=Image ${index + 1}`,
      )

      // In a real app, you would upload the images and get URLs

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price) || 0,
        location: formData.location,
        type: formData.propertyType,
        size: "1000 sqm", // This would come from the form
        status: "pending" as const,
        featured: formData.featured,
        trending: false,
        features: ["Dry Land", "C of O", "Gated Community", "24/7 Security"], // This would come from the form
        images: imageUrls.length > 0 ? imageUrls : ["/placeholder.svg?height=400&width=600"],
        seller: {
          id: "current-user-id", // This would come from auth
          name: "John Doe", // This would come from auth
          email: "john.doe@example.com", // This would come from auth
          phone: "+234 123 456 7890", // This would come from auth
          avatar: "/placeholder.svg?height=40&width=40", // This would come from auth
        },
        investmentDetails: {
          minInvestment: Number.parseFloat(formData.minInvestment) || 0,
          expectedReturn: Number.parseFloat(formData.expectedReturn) || 0,
          duration: Number.parseInt(formData.duration) || 0,
          maxInvestors: Number.parseInt(formData.maxInvestors) || 0,
          investmentType: formData.investmentType as "fractional" | "rental" | "development" | "flip",
          currentInvestors: 0,
          totalInvested: 0,
        },
        companyId: formData.companyId,
      }

      // Add the listing
      await addListing(listingData)

      // Show success message
      setShowSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/dashboard/marketplace/manage")
      }, 2000)
    } catch (error) {
      toast.error("Failed to add listing", {
        description: "Please try again later.",
      })
    }
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
            <BreadcrumbLink>Add Listing</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Add Marketplace Listing</h1>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Property Details</TabsTrigger>
            <TabsTrigger value="investment">Investment Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>Enter the basic details about the property</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Property Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Luxury Apartment in Downtown"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g. Lagos, Nigeria"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyId">Company</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) => handleSelectChange("companyId", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {esthingtonCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div className="flex items-center">
                              <div className="w-5 h-5 mr-2 relative">
                                <Image
                                  src={company.logo || "/placeholder.svg"}
                                  alt={company.name}
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              </div>
                              {company.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the property in detail..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(value) => handleSelectChange("propertyType", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Total Property Value (₦)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="e.g. 50000000"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investment">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Details</CardTitle>
                  <CardDescription>Configure how investors can participate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="investmentType">Investment Type</Label>
                    <Select
                      value={formData.investmentType}
                      onValueChange={(value) => handleSelectChange("investmentType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fractional">Fractional Ownership</SelectItem>
                        <SelectItem value="rental">Rental Income</SelectItem>
                        <SelectItem value="development">Development Project</SelectItem>
                        <SelectItem value="flip">Property Flip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minInvestment">Minimum Investment (₦)</Label>
                      <Input
                        id="minInvestment"
                        name="minInvestment"
                        type="number"
                        placeholder="e.g. 100000"
                        value={formData.minInvestment}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedReturn">Expected Return (%)</Label>
                      <Input
                        id="expectedReturn"
                        name="expectedReturn"
                        type="number"
                        placeholder="e.g. 12"
                        value={formData.expectedReturn}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Investment Duration (months)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        placeholder="e.g. 24"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxInvestors">Maximum Investors</Label>
                      <Input
                        id="maxInvestors"
                        name="maxInvestors"
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.maxInvestors}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                    <Label htmlFor="featured">Feature this listing (highlighted in marketplace)</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Property Media</CardTitle>
                  <CardDescription>Upload images of the property</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">Drag and drop files here</h3>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("images")?.click()}>
                      Select Files
                    </Button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 text-foreground">
                        Selected Images ({formData.images.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden bg-muted">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={`Property image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => router.push("/dashboard/marketplace")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/80">
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Submitting...
                  </>
                ) : (
                  "Add Listing"
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500/90 text-white p-4 rounded-md shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <p>Listing added successfully! Redirecting...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
