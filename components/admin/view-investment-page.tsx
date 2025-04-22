"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Building,
  Percent,
  Clock,
  Users,
  FileText,
  ImageIcon,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import FadeIn from "@/components/animations/fade-in"
import PageTransition from "@/components/animations/page-transition"
import Image from "next/image"
import { useInvestments } from "@/contexts/investments-context"

interface ViewInvestmentPageProps {
  id: string
}

export function ViewInvestmentPage({ id }: ViewInvestmentPageProps) {
  const router = useRouter()
  const {
    selectedInvestment,
    getInvestmentById,
    deleteInvestment,
    toggleFeatured,
    toggleTrending,
    changeInvestmentStatus,
    isLoading,
  } = useInvestments()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<"active" | "pending" | "closed">("active")
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    getInvestmentById(id)
  }, [id, getInvestmentById])

  const handleEditInvestment = () => {
    router.push(`/dashboard/admin/investments/edit/${id}`)
  }

  const handleDeleteInvestment = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setShowDeleteDialog(false)
    const success = await deleteInvestment(id)

    if (success) {
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/admin/investments")
      }, 1500)
    }
  }

  const handleChangeStatus = (status: "active" | "pending" | "closed") => {
    setNewStatus(status)
    setShowStatusDialog(true)
  }

  const confirmStatusChange = async () => {
    await changeInvestmentStatus(id, newStatus)
    setShowStatusDialog(false)
  }

  const handleToggleFeatured = async () => {
    if (selectedInvestment) {
      await toggleFeatured(selectedInvestment.id)
    }
  }

  const handleToggleTrending = async () => {
    if (selectedInvestment) {
      await toggleTrending(selectedInvestment.id)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
      case "closed":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Closed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!selectedInvestment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Investment Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The investment you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/dashboard/admin/investments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Investments
        </Button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/admin/investments">Investments</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>View Investment</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Investment Details</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleToggleFeatured}>
              <Star
                className={`mr-2 h-4 w-4 ${selectedInvestment.featured ? "text-yellow-400 fill-yellow-400" : ""}`}
              />
              {selectedInvestment.featured ? "Remove Featured" : "Mark as Featured"}
            </Button>
            <Button variant="outline" onClick={handleToggleTrending}>
              <TrendingUp className={`mr-2 h-4 w-4 ${selectedInvestment.trending ? "text-purple-500" : ""}`} />
              {selectedInvestment.trending ? "Remove Trending" : "Mark as Trending"}
            </Button>
            <Button variant="outline" onClick={handleEditInvestment}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteInvestment}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FadeIn>
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedInvestment.title}</CardTitle>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedInvestment.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedInvestment.status)}
                      {selectedInvestment.featured && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500" /> Featured
                        </Badge>
                      )}
                      {selectedInvestment.trending && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-200">
                          <TrendingUp className="h-3 w-3 mr-1" /> Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 relative">
                    <div className="aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {selectedInvestment.images && selectedInvestment.images.length > 0 ? (
                        <Image
                          src={selectedInvestment.images[activeImageIndex] || "/placeholder.svg"}
                          alt={selectedInvestment.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {selectedInvestment.images && selectedInvestment.images.length > 1 && (
                      <div className="flex mt-2 gap-2 overflow-x-auto pb-2">
                        {selectedInvestment.images.map((image: string, index: number) => (
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-md overflow-hidden h-16 w-24 flex-shrink-0 transition-all ${
                              activeImageIndex === index
                                ? "ring-2 ring-blue-500 opacity-100"
                                : "opacity-70 hover:opacity-100"
                            }`}
                            onClick={() => setActiveImageIndex(index)}
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${selectedInvestment.title} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedInvestment.description}</p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="text-xs">Type</span>
                      </div>
                      <div className="font-medium">{selectedInvestment.type}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Percent className="h-4 w-4 mr-1" />
                        <span className="text-xs">Return Rate</span>
                      </div>
                      <div className="font-medium">{selectedInvestment.returnRate}%</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs">Period</span>
                      </div>
                      <div className="font-medium">{selectedInvestment.investmentPeriod}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-xs">Investors</span>
                      </div>
                      <div className="font-medium">{selectedInvestment.totalInvestors}</div>
                    </div>
                  </div>

                  {selectedInvestment.amenities && selectedInvestment.amenities.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedInvestment.amenities.map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInvestment.documents && selectedInvestment.documents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Documents</h3>
                      <div className="space-y-2">
                        {selectedInvestment.documents.map((doc: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md"
                          >
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md mr-3">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size} MB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle>Investors</CardTitle>
                  <CardDescription>People who have invested in this property</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedInvestment.investors && selectedInvestment.investors.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Investor</th>
                            <th className="text-right py-3 px-4">Amount</th>
                            <th className="text-right py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvestment.investors.map((investor: any) => (
                            <tr key={investor.id} className="border-b">
                              <td className="py-3 px-4">{investor.name}</td>
                              <td className="text-right py-3 px-4">{formatCurrency(investor.amount)}</td>
                              <td className="text-right py-3 px-4">{investor.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No investors yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div className="space-y-6">
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Property Value</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedInvestment.price)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Funding Progress</div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{selectedInvestment.funded}% Funded</span>
                      <span className="text-sm">
                        {formatCurrency((selectedInvestment.price * selectedInvestment.funded) / 100)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${selectedInvestment.funded}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Min Investment</div>
                        <div className="font-medium">{formatCurrency(selectedInvestment.minInvestment)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Total Investors</div>
                        <div className="font-medium">{selectedInvestment.totalInvestors}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Return Rate</div>
                        <div className="font-medium">{selectedInvestment.returnRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Investment Period</div>
                        <div className="font-medium">{selectedInvestment.investmentPeriod}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedInvestment.status)}
                      <span className="capitalize font-medium">{selectedInvestment.status}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-1">Created On</div>
                    <div className="font-medium">{selectedInvestment.createdAt}</div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedInvestment.status !== "active" && (
                    <Button className="w-full justify-start" onClick={() => handleChangeStatus("active")}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Activate Investment
                    </Button>
                  )}
                  {selectedInvestment.status !== "pending" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleChangeStatus("pending")}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                      Set to Pending
                    </Button>
                  )}
                  {selectedInvestment.status !== "closed" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleChangeStatus("closed")}
                    >
                      <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                      Close Investment
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Investment
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteInvestment}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Investment
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Investment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this investment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={selectedInvestment.images?.[0] || "/placeholder.svg"}
                  alt={selectedInvestment.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedInvestment.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedInvestment.location}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Investment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Investment Status</DialogTitle>
              <DialogDescription>
                {newStatus === "active"
                  ? "Are you sure you want to activate this investment? It will be visible to all users."
                  : newStatus === "pending"
                    ? "Are you sure you want to set this investment to pending? It will be hidden from users."
                    : "Are you sure you want to close this investment? No new investments will be accepted."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={selectedInvestment.images?.[0] || "/placeholder.svg"}
                  alt={selectedInvestment.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium">{selectedInvestment.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">Current status:</span>
                  {getStatusBadge(selectedInvestment.status)}
                </div>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm font-medium mb-2">New status:</p>
              {getStatusBadge(newStatus)}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={newStatus === "active" ? "default" : newStatus === "pending" ? "secondary" : "outline"}
                onClick={confirmStatusChange}
              >
                Confirm Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
