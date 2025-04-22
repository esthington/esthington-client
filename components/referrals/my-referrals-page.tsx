"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, User, Calendar, DollarSign, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AnimatedCard } from "@/components/ui/animated-card"
import { PageTransition } from "@/components/animations/page-transition"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerChildren } from "@/components/animations/stagger-children"
import { StaggerItem } from "@/components/animations/stagger-item"
import { formatCurrency } from "@/lib/utils"

// Mock data for referrals
const referrals = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    date: "2023-03-15",
    status: "Active",
    investments: 3,
    totalInvested: 15000,
    commission: 750,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    date: "2023-04-22",
    status: "Active",
    investments: 2,
    totalInvested: 8500,
    commission: 425,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    date: "2023-05-10",
    status: "Pending",
    investments: 0,
    totalInvested: 0,
    commission: 0,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@example.com",
    date: "2023-06-05",
    status: "Active",
    investments: 1,
    totalInvested: 5000,
    commission: 250,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.w@example.com",
    date: "2023-07-18",
    status: "Inactive",
    investments: 1,
    totalInvested: 3000,
    commission: 150,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
  },
]

export default function MyReferralsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedReferral, setExpandedReferral] = useState<number | null>(null)

  const filteredReferrals = referrals.filter(
    (referral) =>
      referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleReferralDetails = (id: number) => {
    if (expandedReferral === id) {
      setExpandedReferral(null)
    } else {
      setExpandedReferral(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/my-referrals">My Referrals</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FadeIn>
          <h1 className="text-3xl font-bold mb-2 text-white">My Referrals</h1>
          <p className="text-gray-400 mb-8">Manage and track all your referred users and their investments.</p>
        </FadeIn>

        <StaggerChildren>
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <AnimatedCard className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-lg border-blue-800/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">Total Referrals</h3>
                  <p className="text-3xl font-bold text-white">24</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-blue-500/30 text-blue-300 border-blue-500/50">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +5 this month
                    </Badge>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-green-600/20 to-green-900/20 backdrop-blur-lg border-green-800/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-green-300">Active Investors</h3>
                  <p className="text-3xl font-bold text-white">18</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-green-500/30 text-green-300 border-green-500/50">75% conversion rate</Badge>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-lg border-purple-800/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-purple-300">Total Commissions</h3>
                  <p className="text-3xl font-bold text-white">{formatCurrency(2450)}</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/50">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {formatCurrency(350)} this month
                    </Badge>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard className="mb-8 bg-[#1F1F23]/60 backdrop-blur-lg border-[#2A2A30]">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-white">Referral List</h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search referrals..."
                        className="pl-10 bg-[#0F0F12]/80 border-[#2A2A30] text-gray-300 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="border-[#2A2A30] text-gray-300">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((referral) => (
                      <motion.div
                        key={referral.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AnimatedCard
                          className="overflow-hidden bg-[#0F0F12]/80 border-[#2A2A30] hover:border-[#3A3A40]"
                          hoverEffect="subtle"
                        >
                          <div className="p-4 cursor-pointer" onClick={() => toggleReferralDetails(referral.id)}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#1F1F23]">
                                  <img
                                    src={referral.avatar || "/placeholder.svg"}
                                    alt={referral.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium text-white">{referral.name}</h3>
                                  <p className="text-sm text-gray-400">{referral.email}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <Badge className={`${getStatusColor(referral.status)}`}>{referral.status}</Badge>

                                <div className="flex items-center text-sm text-gray-400">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {new Date(referral.date).toLocaleDateString()}
                                </div>

                                <div className="flex items-center text-sm text-gray-400">
                                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                                  {formatCurrency(referral.commission)}
                                </div>

                                {expandedReferral === referral.id ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400 ml-auto" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400 ml-auto" />
                                )}
                              </div>
                            </div>
                          </div>

                          {expandedReferral === referral.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-4 pb-4 pt-2 border-t border-[#2A2A30]"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#1F1F23]/50 rounded-lg p-4">
                                  <h4 className="text-sm font-medium text-gray-400 mb-1">Investments</h4>
                                  <p className="text-xl font-semibold text-white">{referral.investments}</p>
                                </div>

                                <div className="bg-[#1F1F23]/50 rounded-lg p-4">
                                  <h4 className="text-sm font-medium text-gray-400 mb-1">Total Invested</h4>
                                  <p className="text-xl font-semibold text-white">
                                    {formatCurrency(referral.totalInvested)}
                                  </p>
                                </div>

                                <div className="bg-[#1F1F23]/50 rounded-lg p-4">
                                  <h4 className="text-sm font-medium text-gray-400 mb-1">Your Commission</h4>
                                  <p className="text-xl font-semibold text-white">
                                    {formatCurrency(referral.commission)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                                >
                                  View Details
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatedCard>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                      <h3 className="text-lg font-medium text-white mb-1">No referrals found</h3>
                      <p className="text-gray-400">
                        Try adjusting your search or share your referral link to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </PageTransition>
  )
}
