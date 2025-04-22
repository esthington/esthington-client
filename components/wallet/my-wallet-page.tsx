"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
  CreditCard,
  BanknoteIcon as Bank,
  BarChart2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import FadeIn from "@/components/animations/fade-in"
import TransactionList from "@/components/kokonutui/transaction-list"
import { useWallet } from "@/contexts/wallet-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function MyWalletPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { balance, pendingTransactions, isLoading, refreshWalletData } = useWallet()

  // Calculate pending amount
  const pendingAmount = pendingTransactions.reduce((total, tx) => total + tx.amount, 0)

  // Savings goal is fixed for now
  const savingsGoal = 500000 // ₦500,000
  const savingsProgress = (balance / savingsGoal) * 100

  const handleFundWallet = () => {
    router.push("/dashboard/fund-wallet")
  }

  const handleWithdraw = () => {
    router.push("/dashboard/withdraw-money")
  }

  const handleTransfer = () => {
    router.push("/dashboard/transfer-money")
  }

  const handleViewTransactions = () => {
    router.push("/dashboard/my-transactions")
  }

  const handleAddBankAccount = () => {
    router.push("/dashboard/my-bank-account")
  }

  const handleRefresh = async () => {
    await refreshWalletData()
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your funds and transactions</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
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
                <BreadcrumbPage>My Wallet</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="p-6 md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance</h2>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₦{balance.toLocaleString()}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span className="text-green-600 dark:text-green-400">+₦5,000</span> this month
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleFundWallet} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Fund Wallet
                </Button>
                <Button onClick={handleWithdraw} variant="outline">
                  <ArrowDownLeft className="mr-2 h-4 w-4" /> Withdraw
                </Button>
                <Button onClick={handleTransfer} variant="outline">
                  <ArrowUpRight className="mr-2 h-4 w-4" /> Transfer
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Pending Transactions</h3>
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  ₦{pendingAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {pendingTransactions.length} transactions pending
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bank className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Bank Accounts</h3>
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">1</div>
                <Button onClick={handleAddBankAccount} variant="link" className="text-xs p-0 h-auto mt-1">
                  Manage Bank Accounts
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
                <Button onClick={handleViewTransactions} variant="link" className="text-xs p-0 h-auto">
                  View All <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <TransactionList limit={3} />
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Savings Goal</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Investment Fund</h3>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    {savingsProgress.toFixed(0)}% Complete
                  </span>
                </div>
                <Progress value={savingsProgress} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-blue-700 dark:text-blue-400">
                  <span>₦{balance.toLocaleString()}</span>
                  <span>₦{savingsGoal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start" onClick={handleFundWallet}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add Money
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" onClick={handleViewTransactions}>
                    <History className="mr-2 h-3.5 w-3.5" /> History
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Spending Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Investments</span>
                      <span className="text-xs font-medium">65%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Withdrawals</span>
                      <span className="text-xs font-medium">25%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 dark:bg-red-500 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Transfers</span>
                      <span className="text-xs font-medium">10%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 dark:bg-green-500 rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <AnimatedCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Overview</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Deposits</h3>
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">₦250,000</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 30 days</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Withdrawals</h3>
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">₦125,000</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 30 days</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Net Growth</h3>
                    </div>
                    <div className="text-xl font-semibold text-green-600 dark:text-green-400">+₦125,000</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 30 days</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Wallet Security</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your wallet is protected with industry-standard encryption and security measures. We recommend
                    enabling two-factor authentication for additional security.
                  </p>
                  <Button variant="outline" size="sm">
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </TabsContent>
          <TabsContent value="transactions" className="mt-6">
            <AnimatedCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
              <TransactionList limit={5} />
              <div className="mt-4 text-center">
                <Button onClick={handleViewTransactions} variant="outline">
                  View All Transactions
                </Button>
              </div>
            </AnimatedCard>
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnimatedCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Analytics</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
                <p className="text-gray-500 dark:text-gray-400">Analytics chart will be displayed here</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Average Deposit</h3>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">₦25,000</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Average Withdrawal</h3>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">₦15,000</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Monthly Growth</h3>
                  <div className="text-xl font-semibold text-green-600 dark:text-green-400">+15%</div>
                </div>
              </div>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
