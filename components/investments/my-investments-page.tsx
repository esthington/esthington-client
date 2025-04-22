"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wallet, ArrowDownLeft, Plus, Percent, Building, Filter, Search, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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

interface Investment {
  id: string
  propertyId: string
  propertyTitle: string
  propertyLocation: string
  propertyType: string
  propertyImage: string
  investmentAmount: number
  investmentDate: string
  returnRate: number
  investmentPeriod: string
  status: "active" | "pending" | "completed"
  returnsEarned: number
  nextPayoutDate: string
}

export default function MyInvestmentsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [investments, setInvestments] = useState<Investment[]>([])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setInvestments([
        {
          id: "1",
          propertyId: "1",
          propertyTitle: "Luxury Apartment Complex",
          propertyLocation: "Lagos, Nigeria",
          propertyType: "Residential",
          propertyImage:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D",
          investmentAmount: 250000,
          investmentDate: "2023-05-15",
          returnRate: 12,
          investmentPeriod: "36 months",
          status: "active",
          returnsEarned: 25000,
          nextPayoutDate: "2023-06-15",
        },
        {
          id: "2",
          propertyId: "3",
          propertyTitle: "Residential Housing Estate",
          propertyLocation: "Port Harcourt, Nigeria",
          propertyType: "Residential",
          propertyImage:
            "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG91c2luZyUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D",
          investmentAmount: 100000,
          investmentDate: "2023-04-10",
          returnRate: 10,
          investmentPeriod: "24 months",
          status: "active",
          returnsEarned: 8333,
          nextPayoutDate: "2023-06-10",
        },
        {
          id: "3",
          propertyId: "5",
          propertyTitle: "Waterfront Luxury Villas",
          propertyLocation: "Lagos, Nigeria",
          propertyType: "Residential",
          propertyImage:
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D",
          investmentAmount: 500000,
          investmentDate: "2023-06-01",
          returnRate: 14,
          investmentPeriod: "48 months",
          status: "pending",
          returnsEarned: 0,
          nextPayoutDate: "2023-07-01",
        },
      ])
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Filter investments based on search query and filters
  const filteredInvestments = investments.filter((investment) => {
    // Filter by search query
    if (
      searchQuery &&
      !investment.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !investment.propertyLocation.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by status
    if (statusFilter !== "all" && investment.status !== statusFilter) {
      return false
    }

    // Filter by property type
    if (typeFilter !== "all" && investment.propertyType !== typeFilter) {
      return false
    }

    // Filter by tab
    if (activeTab === "active" && investment.status !== "active") {
      return false
    } else if (activeTab === "pending" && investment.status !== "pending") {
      return false
    } else if (activeTab === "completed" && investment.status !== "completed") {
      return false
    }

    return true
  })

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTotalInvestment = (): number => {
    return investments.reduce((total, investment) => total + investment.investmentAmount, 0)
  }

  const getTotalReturns = (): number => {
    return investments.reduce((total, investment) => total + investment.returnsEarned, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const handleViewInvestment = (id: string) => {
    // In a real app, this would navigate to the investment details page
    console.log(`View investment ${id}`)
  }

  const handleInvestMore = () => {
    router.push("/dashboard/marketplace")
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Investments</h1>
            <p className="text-gray-400 mt-1">Manage your real estate investment portfolio</p>
          </div>
          <Button
            onClick={handleInvestMore}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Invest More
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
                <BreadcrumbPage>My Investments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20 backdrop-blur-xl">
                <Wallet className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm text-gray-400">Total Invested</h2>
                <div className="text-2xl font-bold text-white">{formatCurrency(getTotalInvestment())}</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6 bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-xl border-[#1F1F23] hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20 backdrop-blur-xl">
                <ArrowDownLeft className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-sm text-gray-400">Total Returns</h2>
                <div className="text-2xl font-bold text-white">{formatCurrency(getTotalReturns())}</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-[#1F1F23] hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/20 backdrop-blur-xl">
                <Percent className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm text-gray-400">Average ROI</h2>
                <div className="text-2xl font-bold text-white">12% p.a.</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search investments..."
                className="pl-10 bg-[#1F1F23]/50 border-[#2B2B30]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-[#1F1F23]/50 border-[#2B2B30]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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

              <Button variant="outline" className="bg-[#1F1F23]/50 border-[#2B2B30]">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-[#1F1F23]/50 border-[#2B2B30]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#2B2B30]">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-[#2B2B30]">
                Active
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-[#2B2B30]">
                Pending
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-[#2B2B30]">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredInvestments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Investments Found</h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                      ? "We couldn't find any investments matching your search criteria. Try adjusting your filters."
                      : "You haven't made any investments yet. Start investing to grow your real estate portfolio."}
                  </p>
                  <Button
                    onClick={handleInvestMore}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    Explore Investment Opportunities
                  </Button>
                </div>
              ) : (
                <StaggerChildren className="space-y-6">
                  {filteredInvestments.map((investment) => (
                    <StaggerItem key={investment.id}>
                      <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-48 h-48 sm:h-auto flex-shrink-0">
                            <Image
                              src={investment.propertyImage || "/placeholder.svg"}
                              alt={investment.propertyTitle}
                              fill
                              className="object-cover transition-transform duration-500 hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <Badge
                                variant="outline"
                                className="bg-black/50 backdrop-blur-md border-white/20 text-white"
                              >
                                {investment.propertyType}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{investment.propertyTitle}</h3>
                                <p className="text-sm text-gray-400">{investment.propertyLocation}</p>
                              </div>
                              <Badge className={getStatusColor(investment.status)}>
                                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <div className="text-xs text-gray-400">Investment Amount</div>
                                <div className="text-white font-medium">
                                  {formatCurrency(investment.investmentAmount)}
                                </div>
                                <div className="text-xs text-gray-500">{formatDate(investment.investmentDate)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Returns Earned</div>
                                <div className="text-green-400 font-medium">
                                  {formatCurrency(investment.returnsEarned)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Next payout: {formatDate(investment.nextPayoutDate)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Return Rate</div>
                                <div className="text-white font-medium flex items-center">
                                  <Percent className="h-3.5 w-3.5 mr-1 text-blue-400" />
                                  {investment.returnRate}% p.a.
                                </div>
                                <div className="text-xs text-gray-500">{investment.investmentPeriod}</div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="space-y-1 flex-1 max-w-xs">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Investment Progress</span>
                                  <span className="text-white">25%</span>
                                </div>
                                <Progress value={25} className="h-1.5 bg-gray-800" />
                                <div className="text-xs text-gray-500">9 months of 36 months completed</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewInvestment(investment.id)}
                                className="ml-4 bg-[#1F1F23]/50 border-[#2B2B30] hover:bg-[#2B2B30]"
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

      <FadeIn delay={0.4}>
        <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
          <h2 className="text-lg font-semibold text-white mb-4">Investment Performance</h2>
          <div className="h-64 flex items-center justify-center bg-[#1F1F23]/50 rounded-lg mb-4">
            <p className="text-gray-400">Investment performance chart will be displayed here</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1F1F23]/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-white mb-1">Total ROI</h3>
              <div className="text-xl font-semibold text-green-400">+10.5%</div>
              <p className="text-xs text-gray-400">Since first investment</p>
            </div>
            <div className="bg-[#1F1F23]/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-white mb-1">Monthly Income</h3>
              <div className="text-xl font-semibold text-white">{formatCurrency(8333)}</div>
              <p className="text-xs text-gray-400">Average monthly returns</p>
            </div>
            <div className="bg-[#1F1F23]/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-white mb-1">Portfolio Growth</h3>
              <div className="text-xl font-semibold text-blue-400">+15.2%</div>
              <p className="text-xs text-gray-400">Year-to-date growth</p>
            </div>
          </div>
        </AnimatedCard>
      </FadeIn>
    </div>
  )
}
