"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BanknoteIcon as Bank, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
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
import { useWallet } from "@/contexts/wallet-context"

export default function WithdrawMoneyPage() {
  const router = useRouter()
  const { balance, bankAccounts, withdrawMoney, isLoading } = useWallet()
  const [amount, setAmount] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    // Set default account if available
    const defaultAccount = bankAccounts.find((account) => account.isDefault)
    if (defaultAccount) {
      setSelectedAccountId(defaultAccount.id)
    } else if (bankAccounts.length > 0) {
      setSelectedAccountId(bankAccounts[0].id)
    }
  }, [bankAccounts])

  const handleQuickAmount = (value: string) => {
    setAmount(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountValue = Number.parseInt(amount, 10)
    if (isNaN(amountValue) || amountValue <= 0) {
      return
    }

    const success = await withdrawMoney(amountValue, selectedAccountId, note)

    if (success) {
      // Redirect to wallet page after a delay
      setTimeout(() => {
        router.push("/dashboard/my-wallet")
      }, 2000)
    }
  }

  const handleAddBankAccount = () => {
    router.push("/dashboard/my-bank-account")
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Money</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Withdraw funds to your bank account</p>
            </div>
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
                  <BreadcrumbPage>Withdraw Money</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <AnimatedCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                      required
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("5000")}
                        className={amount === "5000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦5,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("10000")}
                        className={amount === "10000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦10,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("20000")}
                        className={amount === "20000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦20,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("50000")}
                        className={amount === "50000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦50,000
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="bankAccount">Bank Account</Label>
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleAddBankAccount}
                        className="text-xs p-0 h-auto"
                      >
                        Add New Account
                      </Button>
                    </div>

                    {bankAccounts.length === 0 ? (
                      <div className="border rounded-lg p-4 text-center">
                        <Bank className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          You don't have any bank accounts linked to your wallet.
                        </p>
                        <Button
                          type="button"
                          onClick={handleAddBankAccount}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add Bank Account
                        </Button>
                      </div>
                    ) : (
                      <Select value={selectedAccountId} onValueChange={setSelectedAccountId} required>
                        <SelectTrigger id="bankAccount">
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName} - {account.accountNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      placeholder="Add a note for this withdrawal"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading || bankAccounts.length === 0 || !amount}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" /> Processing...
                      </>
                    ) : (
                      <>Withdraw Funds</>
                    )}
                  </Button>
                </form>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Withdrawal Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Available Balance:</span>
                    <span className="font-medium">₦{balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Withdrawal Amount:</span>
                    <span className="font-medium">₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction Fee:</span>
                    <span className="font-medium">₦0</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-900 dark:text-white font-medium">Total to Receive:</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      ₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Withdrawal Information</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Withdrawals typically take 1-2 business days to process and appear in your bank account.</p>
                    <p>The minimum withdrawal amount is ₦1,000 and the maximum is ₦1,000,000 per transaction.</p>
                    <p>
                      For security reasons, you can only withdraw to bank accounts that are registered in your name.
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/my-wallet")}>
                  <Wallet className="mr-2 h-4 w-4" /> Back to My Wallet
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  )
}
