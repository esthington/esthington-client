"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Wallet, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import Image from "next/image"
import { useWallet } from "@/contexts/wallet-context"
import type { WalletUser } from "@/contexts/wallet-context"

export default function TransferMoneyPage() {
  const router = useRouter()
  const { balance, recentRecipients, searchUsers, transferMoney, isLoading } = useWallet()
  const [amount, setAmount] = useState("")
  const [recipientUsername, setRecipientUsername] = useState("")
  const [note, setNote] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<WalletUser | null>(null)
  const [searchResults, setSearchResults] = useState<WalletUser[]>([])

  const handleQuickAmount = (value: string) => {
    setAmount(value)
  }

  const handleSearchRecipient = async () => {
    if (!recipientUsername.trim()) return

    setIsSearching(true)
    setSearchResults([])
    setSelectedRecipient(null)

    try {
      const results = await searchUsers(recipientUsername)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching for recipient:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectRecipient = (recipient: WalletUser) => {
    setSelectedRecipient(recipient)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountValue = Number.parseInt(amount, 10)
    if (isNaN(amountValue) || amountValue <= 0) {
      return
    }

    if (!selectedRecipient) {
      return
    }

    const success = await transferMoney(amountValue, selectedRecipient.id, note)

    if (success) {
      // Redirect to wallet page after a delay
      setTimeout(() => {
        router.push("/dashboard/my-wallet")
      }, 2000)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Money</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Send money to other users</p>
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
                  <BreadcrumbPage>Transfer Money</BreadcrumbPage>
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
                    <Label>Recipient</Label>
                    {selectedRecipient ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Image
                            src={selectedRecipient.avatar || "/placeholder.svg"}
                            alt={selectedRecipient.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedRecipient.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">@{selectedRecipient.username}</p>
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRecipient(null)}>
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <Input
                              placeholder="Enter username"
                              className="pl-10"
                              value={recipientUsername}
                              onChange={(e) => setRecipientUsername(e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleSearchRecipient}
                            disabled={isSearching || !recipientUsername.trim()}
                          >
                            {isSearching ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
                          </Button>
                        </div>

                        {searchResults.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            {searchResults.map((recipient) => (
                              <div
                                key={recipient.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSelectRecipient(recipient)}
                              >
                                <Image
                                  src={recipient.avatar || "/placeholder.svg"}
                                  alt={recipient.name}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {recipient.name}
                                  </h3>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">@{recipient.username}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {recipientUsername && searchResults.length === 0 && !isSearching && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
                            No users found with that username. Please try another username.
                          </div>
                        )}

                        {recentRecipients.length > 0 && !searchResults.length && !isSearching && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Recent Recipients
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {recentRecipients.map((recipient) => (
                                <Button
                                  key={recipient.id}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                  onClick={() => handleSelectRecipient(recipient)}
                                >
                                  <Image
                                    src={recipient.avatar || "/placeholder.svg"}
                                    alt={recipient.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                  <span>{recipient.name}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

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
                        onClick={() => handleQuickAmount("1000")}
                        className={amount === "1000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦1,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("2000")}
                        className={amount === "2000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦2,000
                      </Button>
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      placeholder="Add a note for this transfer"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading || !selectedRecipient || !amount}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" /> Processing...
                      </>
                    ) : (
                      <>Send Money</>
                    )}
                  </Button>
                </form>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transfer Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Available Balance:</span>
                    <span className="font-medium">₦{balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transfer Amount:</span>
                    <span className="font-medium">₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction Fee:</span>
                    <span className="font-medium">₦0</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-900 dark:text-white font-medium">Total:</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      ₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Transfer Information</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Transfers between users are instant and free of charge.</p>
                    <p>The minimum transfer amount is ₦100 and the maximum is ₦500,000 per transaction.</p>
                    <p>For security reasons, you may be required to verify your identity for large transfers.</p>
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
