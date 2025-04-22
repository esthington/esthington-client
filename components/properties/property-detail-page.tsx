"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Building, Bed, Bath, CheckCircle, XCircle, FileText, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import FadeIn from "@/components/animations/fade-in"
import { formatCurrency } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlotSelection from "./plot-selection"
import DocumentViewer from "@/components/documents/document-viewer"
import { generateDocuments } from "@/lib/document-generator"
import { getCompanyById } from "@/lib/company-data"
import type { Plot } from "@/lib/property-types"
import { useProperty } from "@/contexts/property-context"
import { usePropertyPermissions } from "@/hooks/use-property-permissions"

interface PropertyDetailPageProps {
  propertyId: string
}

export default function PropertyDetailPage({ propertyId }: PropertyDetailPageProps) {
  const router = useRouter()
  const { getPropertyById, isLoading } = useProperty()
  const { permissions } = usePropertyPermissions()

  const [property, setProperty] = useState<any>(null)
  const [selectedPlots, setSelectedPlots] = useState<Plot[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [showDocuments, setShowDocuments] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      const foundProperty = getPropertyById(propertyId)
      if (foundProperty) {
        setProperty(foundProperty)
      } else {
        // Property not found, redirect to properties page
        router.push("/dashboard/properties")
      }
    }

    if (!isLoading) {
      fetchProperty()
    }
  }, [propertyId, router, getPropertyById, isLoading])

  const handleChatWithAdmin = () => {
    router.push("/dashboard/chat-with-admin")
  }

  const handlePlotSelectionChange = (plots: Plot[]) => {
    setSelectedPlots(plots)
  }

  const handlePurchase = async () => {
    if (selectedPlots.length === 0 || !property) return

    // Generate documents
    try {
      const docs = await generateDocuments({
        property,
        buyer: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+234 123 456 7890",
          address: "123 Main St, Lagos, Nigeria",
        },
        selectedPlots: selectedPlots.map((p) => p.id),
        paymentDetails: {
          amount: selectedPlots.reduce((sum, plot) => sum + Number(plot.price), 0),
          method: "Wallet",
          reference: `REF-${Math.floor(Math.random() * 1000000)}`,
          date: new Date().toISOString(),
        },
      })

      setDocuments(docs)
      setShowDocuments(true)
    } catch (error) {
      console.error("Error generating documents:", error)
    }
  }

  const company = property ? getCompanyById(property.companyId) : null

  if (isLoading || !property) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
            <p className="text-muted-foreground mt-1">Explore details of this property</p>
          </div>
          <Button
            onClick={handleChatWithAdmin}
            className="bg-success hover:bg-success/90 text-success-foreground flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Chat with Admin
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
                <BreadcrumbLink href="/dashboard/properties">Properties</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{property.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Property Details</TabsTrigger>
          {permissions.canBuy && <TabsTrigger value="plots">Select Plots</TabsTrigger>}
          {showDocuments && <TabsTrigger value="documents">Documents</TabsTrigger>}
        </TabsList>

        <TabsContent value="details">
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Image
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {property.images.slice(1).map((image, index) => (
                      <div key={index} className="relative w-24 h-16 rounded-md overflow-hidden">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${property.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {company && (
                      <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                        <div className="w-4 h-4 mr-2 relative">
                          <Image
                            src={company.logo || "/placeholder.svg"}
                            alt={company.name}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        {company.name}
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-foreground mb-4">Property Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="h-4 w-4 mr-2" />
                      <span>{property.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Bed className="h-4 w-4 mr-2" />
                      <span>{property.totalPlots} Plots</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Bath className="h-4 w-4 mr-2" />
                      <span>{property.availablePlots} Available</span>
                    </div>
                    <div className="text-lg font-bold text-primary">{formatCurrency(property.price)}</div>
                    <div className="text-sm text-muted-foreground">Plot Size: {property.plotSize} SQM</div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{property.description}</p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Amenities</h3>
                    <ul className="list-none space-y-1">
                      {property.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 mr-2 text-success" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Property Documents</h2>
              {property.documents.length > 0 ? (
                <ul className="space-y-3">
                  {property.documents.map((doc) => (
                    <li key={doc.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.fileSize} • {doc.fileType}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No documents available for this property.</p>
                </div>
              )}
            </AnimatedCard>
          </FadeIn>
        </TabsContent>

        {permissions.canBuy && (
          <TabsContent value="plots">
            <FadeIn delay={0.2}>
              <PlotSelection plots={property.plots} onPlotSelectionChange={handlePlotSelectionChange} />

              {selectedPlots.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handlePurchase}>
                    Purchase Selected Plots
                  </Button>
                </div>
              )}
            </FadeIn>
          </TabsContent>
        )}

        {showDocuments && (
          <TabsContent value="documents">
            <FadeIn delay={0.2}>
              <DocumentViewer documents={documents} />
            </FadeIn>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
