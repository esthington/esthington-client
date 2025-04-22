"use client"

import { useRouter } from "next/navigation"
import { Search, Map, Filter, Download, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { usePurchases } from "@/contexts/purchases-context"
import { formatCurrency } from "@/lib/utils"

export default function MyPurchasesPage() {
  const router = useRouter()
  const { filteredPurchases, filters, setFilters, isLoading, downloadDocument } = usePurchases()

  const handleViewPurchase = (id: string) => {
    // In a real app, this would navigate to the purchase details page
    console.log(`View purchase ${id}`)
  }

  const handleDownloadDocument = (id: string) => {
    downloadDocument(id)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Land Purchases</h1>
            <p className="text-gray-400 mt-1">Manage your land property portfolio</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/marketplace")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            <Map className="mr-2 h-4 w-4" /> Browse More Lands
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
                <BreadcrumbPage>My Purchases</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search purchases..."
                className="pl-10 bg-[#1F1F23]/50 border-[#2B2B30]"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filters.status} onValueChange={(value) => setFilters({ status: value })}>
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => setFilters({ type: value })}>
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <Map className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Land Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="bg-[#1F1F23]/50 border-[#2B2B30]">
                <Download className="mr-2 h-4 w-4" /> Export All
              </Button>
            </div>
          </div>

          <Tabs
            value={filters.status === "all" ? "all" : filters.status}
            onValueChange={(value) => setFilters({ status: value })}
          >
            <TabsList className="grid w-full grid-cols-4 bg-[#1F1F23]/50 border-[#2B2B30]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#2B2B30]">
                All
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-[#2B2B30]">
                Completed
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-[#2B2B30]">
                Pending
              </TabsTrigger>
              <TabsTrigger value="processing" className="data-[state=active]:bg-[#2B2B30]">
                Processing
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filters.status === "all" ? "all" : filters.status} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Map className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Purchases Found</h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    {filters.searchQuery || filters.status !== "all" || filters.type !== "all"
                      ? "We couldn't find any purchases matching your search criteria. Try adjusting your filters."
                      : "You haven't made any land purchases yet. Start exploring our marketplace to find your perfect land."}
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/marketplace")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    Explore Marketplace
                  </Button>
                </div>
              ) : (
                <StaggerChildren className="space-y-6">
                  {filteredPurchases.map((purchase) => (
                    <StaggerItem key={purchase.id}>
                      <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-48 h-48 sm:h-auto flex-shrink-0">
                            <Image
                              src={purchase.landImage || "/placeholder.svg"}
                              alt={purchase.landTitle}
                              fill
                              className="object-cover transition-transform duration-500 hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <Badge
                                variant="outline"
                                className="bg-black/50 backdrop-blur-md border-white/20 text-white"
                              >
                                {purchase.landType}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{purchase.landTitle}</h3>
                                <p className="text-sm text-gray-400">{purchase.landLocation}</p>
                              </div>
                              <Badge className={getStatusColor(purchase.status)}>
                                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <div className="text-xs text-gray-400">Purchase Amount</div>
                                <div className="text-white font-medium">{formatCurrency(purchase.purchaseAmount)}</div>
                                <div className="text-xs text-gray-500">{formatDate(purchase.purchaseDate)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Land Size</div>
                                <div className="text-white font-medium">{purchase.size}</div>
                                <div className="text-xs text-gray-500">
                                  {purchase.status === "completed" ? "Title Deed Available" : "Processing Documents"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Document Status</div>
                                <div className="text-white font-medium">
                                  {purchase.status === "completed" ? "Ready for Download" : "Pending"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {purchase.status === "completed" ? "Verified ✓" : "In Progress..."}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              {purchase.status === "completed" && purchase.documentUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(purchase.id)}
                                  className="bg-[#1F1F23]/50 border-[#2B2B30] hover:bg-[#2B2B30]"
                                >
                                  <FileText className="mr-2 h-4 w-4" /> Download Deed
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPurchase(purchase.id)}
                                className="bg-[#1F1F23]/50 border-[#2B2B30] hover:bg-[#2B2B30]"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              )}
            </TabsContent>
          </Tabs>
        </AnimatedCard>
      </FadeIn>
    </div>
  )
}
