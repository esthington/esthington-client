"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, MapPin, Percent, ArrowRight, TrendingUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useInvestments } from "@/contexts/investments-context"
import Image from "next/image"

export default function MyInvestmentsPage() {
  const router = useRouter()
  const { userInvestments, fetchUserInvestments, isLoading } = useInvestments()

  useEffect(() => {
    fetchUserInvestments()
  }, [fetchUserInvestments])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Investments</h1>
            <p className="text-gray-400 mt-1">Track and manage your real estate investments</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/investments")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Explore New Investments
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
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Investments</TabsTrigger>
            <TabsTrigger value="returns">Returns & Payouts</TabsTrigger>
            <TabsTrigger value="history">Investment History</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : userInvestments.length === 0 ? (
              <Card className="bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-[#1F1F23] p-4 mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No investments yet</h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    You haven't made any investments yet. Explore our marketplace to find investment opportunities.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/investments")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Browse Investments
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userInvestments.map((investment) => (
                  <StaggerItem key={investment.id}>
                    <Card className="bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23] hover:border-blue-500/50 transition-all duration-300">
                      <div className="relative">
                        <div className="relative h-40 w-full">
                          <Image
                            src={investment.images[0] || "/placeholder.svg"}
                            alt={investment.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          {investment.featured && (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                              <Star className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          )}
                          {investment.trending && (
                            <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                              <TrendingUp className="h-3 w-3 mr-1" /> Trending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{investment.title}</CardTitle>
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{investment.location}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-400">Your Investment</div>
                            <div className="text-white font-semibold">
                              {formatCurrency(investment.userInvestment?.amount || 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Return Rate</div>
                            <div className="text-white font-semibold flex items-center">
                              <Percent className="h-3 w-3 mr-1" />
                              {investment.returnRate}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Next Payout</div>
                            <div className="text-white font-semibold flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {investment.userInvestment?.nextPayout || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Expected Returns</div>
                            <div className="text-white font-semibold">
                              {formatCurrency(investment.userInvestment?.returns || 0)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => router.push(`/dashboard/my-investments/${investment.id}`)}
                        >
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            )}
          </TabsContent>

          <TabsContent value="returns">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
              <CardHeader>
                <CardTitle>Returns & Payouts</CardTitle>
                <CardDescription>Track your investment returns and upcoming payouts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : userInvestments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">You don't have any active investments to generate returns.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1F1F23]">
                          <th className="text-left py-3 px-4">Investment</th>
                          <th className="text-right py-3 px-4">Amount Invested</th>
                          <th className="text-right py-3 px-4">Return Rate</th>
                          <th className="text-right py-3 px-4">Expected Returns</th>
                          <th className="text-right py-3 px-4">Next Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userInvestments.map((investment) => (
                          <tr key={investment.id} className="border-b border-[#1F1F23]">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                                  <Image
                                    src={investment.images[0] || "/placeholder.svg"}
                                    alt={investment.title}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{investment.title}</div>
                                  <div className="text-xs text-gray-400">{investment.location}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">
                              {formatCurrency(investment.userInvestment?.amount || 0)}
                            </td>
                            <td className="text-right py-3 px-4">{investment.returnRate}%</td>
                            <td className="text-right py-3 px-4">
                              {formatCurrency(investment.userInvestment?.returns || 0)}
                            </td>
                            <td className="text-right py-3 px-4">{investment.userInvestment?.nextPayout || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
              <CardHeader>
                <CardTitle>Investment History</CardTitle>
                <CardDescription>View your complete investment history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : userInvestments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">You don't have any investment history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userInvestments.map((investment) => (
                      <div key={investment.id} className="flex items-start border-b border-[#1F1F23] pb-6">
                        <div className="h-12 w-12 rounded-md overflow-hidden mr-4">
                          <Image
                            src={investment.images[0] || "/placeholder.svg"}
                            alt={investment.title}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <div className="font-medium text-lg">{investment.title}</div>
                            <div className="text-sm text-gray-400">
                              Invested on: {investment.userInvestment?.date || "N/A"}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              <span>{investment.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Percent className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              <span>{investment.returnRate}% ROI</span>
                            </div>
                            <div>
                              <span className="text-gray-400 mr-2">Amount:</span>
                              <span className="font-medium">
                                {formatCurrency(investment.userInvestment?.amount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
