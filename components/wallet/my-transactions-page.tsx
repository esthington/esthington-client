"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownLeft, Download, Filter, Search, Calendar, CreditCard, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import FadeIn from "@/components/animations/fade-in"
import { useWallet } from "@/contexts/wallet-context"
import type { Transaction } from "@/contexts/wallet-context"

export default function MyTransactionsPage() {
  const router = useRouter()
  const { transactions, balance, isLoading } = useWallet()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter transactions based on search query and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by search query
      if (
        searchQuery &&
        !transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.reference.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filter by date
      if (dateFilter !== "all") {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const lastWeek = new Date(today)
        lastWeek.setDate(lastWeek.getDate() - 7)
        const lastMonth = new Date(today)
        lastMonth.setMonth(lastMonth.getMonth() - 1)

        const txDate = new Date(transaction.date)

        if (dateFilter === "today") {
          if (txDate.toDateString() !== today.toDateString()) {
            return false
          }
        } else if (dateFilter === "yesterday") {
          if (txDate.toDateString() !== yesterday.toDateString()) {
            return false
          }
        } else if (dateFilter === "this_week") {
          if (txDate < lastWeek) {
            return false
          }
        } else if (dateFilter === "this_month") {
          if (txDate < lastMonth) {
            return false
          }
        }
      }

      // Filter by type
      if (typeFilter !== "all" && transaction.type !== typeFilter) {
        return false
      }

      // Filter by status
      if (statusFilter !== "all" && transaction.status !== statusFilter) {
        return false
      }

      // Filter by tab
      if (activeTab === "deposits" && transaction.type !== "deposit") {
        return false
      } else if (activeTab === "withdrawals" && transaction.type !== "withdrawal") {
        return false
      } else if (
        activeTab === "transfers" &&
        transaction.type !== "transfer_in" &&
        transaction.type !== "transfer_out"
      ) {
        return false
      } else if (activeTab === "investments" && transaction.type !== "investment") {
        return false
      }

      return true
    })
  }, [transactions, searchQuery, dateFilter, typeFilter, statusFilter, activeTab])

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "transfer_in":
        return <ArrowDownLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "transfer_out":
        return <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case "investment":
        return <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Calculate transaction totals
  const totalDeposits = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "deposit" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [transactions])

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [transactions])

  const totalInvestments = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "investment" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [transactions])

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your transaction history</p>
          </div>
          <Button variant="outline" onClick={() => console.log("Export transactions")}>
            <Download className="mr-2 h-4 w-4" /> Export
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
                <BreadcrumbLink href="/dashboard/my-wallet">Wallet</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="transfer_in">Received</SelectItem>
                  <SelectItem value="transfer_out">Sent</SelectItem>
                  <SelectItem value="investment">Investments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transactions Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We couldn't find any transactions matching your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setDateFilter("all")
                      setTypeFilter("all")
                      setStatusFilter("all")
                      setActiveTab("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{transaction.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{transaction.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₦{transaction.amount.toLocaleString()}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full inline-block ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Deposits:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ₦{totalDeposits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Withdrawals:</span>
                <span className="font-medium text-red-600 dark:text-red-400">₦{totalWithdrawals.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Investments:</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  ₦{totalInvestments.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-gray-900 dark:text-white font-medium">Current Balance:</span>
                <span className="text-gray-900 dark:text-white font-bold">₦{balance.toLocaleString()}</span>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 text-center"
                onClick={() => router.push("/dashboard/fund-wallet")}
              >
                <ArrowDownLeft className="h-6 w-6 mb-2 text-green-600 dark:text-green-400" />
                <span>Fund Wallet</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 text-center"
                onClick={() => router.push("/dashboard/withdraw-money")}
              >
                <ArrowUpRight className="h-6 w-6 mb-2 text-red-600 dark:text-red-400" />
                <span>Withdraw</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 text-center"
                onClick={() => router.push("/dashboard/transfer-money")}
              >
                <ArrowUpRight className="h-6 w-6 mb-2 text-blue-600 dark:text-blue-400" />
                <span>Transfer</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 text-center"
                onClick={() => router.push("/dashboard/my-wallet")}
              >
                <Wallet className="h-6 w-6 mb-2 text-gray-600 dark:text-gray-400" />
                <span>My Wallet</span>
              </Button>
            </div>
          </AnimatedCard>
        </div>
      </FadeIn>
    </div>
  )
}
