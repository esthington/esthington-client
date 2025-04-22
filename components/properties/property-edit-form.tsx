"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedInput } from "@/components/ui/animated-input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import FadeIn from "@/components/animations/fade-in"
import { useProperty } from "@/contexts/property-context"

interface PropertyEditFormProps {
  propertyId: string
}

export default function PropertyEditForm({ propertyId }: PropertyEditFormProps) {
  const router = useRouter()
  const { getPropertyById, updateProperty, isLoading: contextLoading } = useProperty()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    location: "",
    price: "",
    plotSize: "",
    totalPlots: "",
    availablePlots: "",
    type: "Land",
    status: "Available",
    featured: false,
    amenities: [] as string[],
    plots: [] as any[],
    images: [] as string[],
    layoutImage: "",
    documents: [] as any[],
    createdAt: "",
    companyId: "",
  })

  useEffect(() => {
    if (!contextLoading) {
      const property = getPropertyById(propertyId)
      if (property) {
        setFormData({
          ...property,
          price: property.price.toString(),
          totalPlots: property.totalPlots.toString(),
          availablePlots: property.availablePlots.toString(),
        })
      } else {
        // Property not found, redirect to properties page
        router.push("/dashboard/properties")
      }
      setIsLoading(false)
    }
  }, [propertyId, router, getPropertyById, contextLoading])

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

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      amenities: checked ? [...prev.amenities, value] : prev.amenities.filter((a) => a !== value),
    }))
  }

  const handlePlotChange = (index: number, field: string, value: string) => {
    const updatedPlots = [...formData.plots]
    updatedPlots[index] = { ...updatedPlots[index], [field]: value }
    setFormData((prev) => ({ ...prev, plots: updatedPlots }))
  }

  const handleAddPlot = () => {
    setFormData((prev) => ({
      ...prev,
      plots: [
        ...prev.plots,
        {
          id: String(Date.now()),
          plotId: "",
          size: prev.plotSize, // Default to the property plot size
          price: prev.price, // Default to the property price
          status: "Available",
        },
      ],
    }))
  }

  const handleRemovePlot = (index: number) => {
    const updatedPlots = [...formData.plots]
    updatedPlots.splice(index, 1)
    setFormData((prev) => ({ ...prev, plots: updatedPlots }))
  }

  const handleAddImage = () => {
    // In a real app, this would open a file picker
    // For now, we'll just add a placeholder image
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, "/placeholder.svg?height=400&width=600"],
    }))
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images]
    updatedImages.splice(index, 1)
    setFormData((prev) => ({ ...prev, images: updatedImages }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert string values to numbers
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        totalPlots: Number(formData.totalPlots),
        availablePlots: formData.plots.filter((p) => p.status === "Available").length,
        plots: formData.plots.map((plot) => ({
          ...plot,
          price: Number(plot.price),
        })),
      }

      await updateProperty(propertyId, propertyData)
      router.push(`/dashboard/properties/${propertyId}`)
    } catch (error) {
      console.error("Error updating property:", error)
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/properties/${propertyId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Property</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update property information for {formData.title}</p>
          </div>
          <div className="flex gap-2">
            <AnimatedButton type="button" onClick={handleCancel} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </AnimatedButton>
            <AnimatedButton type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </AnimatedButton>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.1}>
            <AnimatedCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <AnimatedInput
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. IVY GOLD ESTATE ABUJA (PHASE 3)"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the property..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <AnimatedInput
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Abuja, Nigeria"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (₦)</Label>
                    <AnimatedInput
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 5000000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plotSize">Plot Size (SQM)</Label>
                    <AnimatedInput
                      id="plotSize"
                      name="plotSize"
                      value={formData.plotSize}
                      onChange={handleInputChange}
                      placeholder="e.g. 250"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalPlots">Total Plots</Label>
                    <AnimatedInput
                      id="totalPlots"
                      name="totalPlots"
                      type="number"
                      value={formData.totalPlots}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Sold Out">Sold Out</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="featured" className="flex-1">
                        Featured Property
                      </Label>
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>

          {/* Images section */}
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Property Images</h2>
                <Button type="button" variant="outline" onClick={handleAddImage}>
                  <Upload className="mr-2 h-4 w-4" /> Add Image
                </Button>
              </div>

              {formData.images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No images added yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Click "Add Image" to upload property images
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden h-40">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatedCard>
          </FadeIn>

          {/* Plots section */}
          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Plots</h2>
                <Button type="button" variant="outline" onClick={handleAddPlot}>
                  <Plus className="mr-2 h-4 w-4" /> Add Plot
                </Button>
              </div>

              <div className="space-y-4">
                {formData.plots.map((plot, index) => (
                  <div key={plot.id} className="border rounded-lg p-4 relative">
                    <div className="absolute top-3 right-3">
                      {formData.plots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlot(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`plot-id-${index}`}>Plot ID</Label>
                        <AnimatedInput
                          id={`plot-id-${index}`}
                          value={plot.plotId}
                          onChange={(e) => handlePlotChange(index, "plotId", e.target.value)}
                          placeholder="e.g. IVG3 TD-02"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`plot-size-${index}`}>Size (SQM)</Label>
                        <AnimatedInput
                          id={`plot-size-${index}`}
                          value={plot.size}
                          onChange={(e) => handlePlotChange(index, "size", e.target.value)}
                          placeholder="e.g. 250"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`plot-price-${index}`}>Price (₦)</Label>
                        <AnimatedInput
                          id={`plot-price-${index}`}
                          type="number"
                          value={plot.price}
                          onChange={(e) => handlePlotChange(index, "price", e.target.value)}
                          placeholder="e.g. 5000000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`plot-status-${index}`}>Status</Label>
                        <Select value={plot.status} onValueChange={(value) => handlePlotChange(index, "status", value)}>
                          <SelectTrigger id={`plot-status-${index}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Reserved">Reserved</SelectItem>
                            <SelectItem value="Sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </FadeIn>
        </div>

        <div className="space-y-6">
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Amenities</h2>
              <div className="space-y-3">
                {[
                  "Electricity",
                  "Road Access",
                  "Security",
                  "Water",
                  "Drainage System",
                  "Perimeter Fencing",
                  "Recreational Areas",
                  "Shopping Centers",
                  "Schools",
                  "Hospitals",
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </FadeIn>

          {/* Documents section */}
          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
              <div className="space-y-4">
                {formData.documents.length > 0 ? (
                  <div className="space-y-3">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.fileSize} • {doc.fileType}
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Upload More
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Upload property documents</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Layout plans, certificates, etc.</p>
                    <Button type="button" variant="outline" className="mt-4">
                      <Upload className="mr-2 h-4 w-4" /> Upload Files
                    </Button>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </FadeIn>
        </div>
      </div>
    </form>
  )
}
