"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Wallet, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

export default function FundWalletPage() {
  const router = useRouter()
  const { fundWallet, isLoading } = useWallet()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")

  const handleQuickAmount = (value: string) => {
    setAmount(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountValue = Number.parseInt(amount, 10)
    if (isNaN(amountValue) || amountValue <= 0) {
      return
    }

    const cardDetails =
      paymentMethod === "card"
        ? {
            cardNumber,
            cardName,
            cardExpiry,
            cardCvv,
          }
        : undefined

    const success = await fundWallet(amountValue, paymentMethod, cardDetails)

    if (success) {
      // Redirect to wallet page after a delay
      setTimeout(() => {
        router.push("/dashboard/my-wallet")
      }, 2000)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return v
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fund Wallet</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Add funds to your wallet</p>
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
                  <BreadcrumbPage>Fund Wallet</BreadcrumbPage>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("100000")}
                        className={amount === "100000" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        ₦100,000
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center cursor-pointer">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex items-center cursor-pointer">
                          <Wallet className="h-4 w-4 mr-2" />
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Expiry Date</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            type="password"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          Bank Transfer Instructions
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                          Transfer the amount to the account details below. Your wallet will be credited once the
                          payment is confirmed.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Bank Name:</span>
                            <span className="text-sm font-medium">First Bank of Nigeria</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Account Name:</span>
                            <span className="text-sm font-medium">Esthington Properties Ltd</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Account Number:</span>
                            <span className="text-sm font-medium">0123456789</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Reference:</span>
                            <span className="text-sm font-medium">EST-12345</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" /> Processing...
                      </>
                    ) : (
                      <>Fund Wallet</>
                    )}
                  </Button>
                </form>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
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
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Secure Payment</h3>
                  <div className="flex items-center gap-2">
                    <Image src="/placeholder.svg?height=24&width=40" alt="Visa" width={40} height={24} />
                    <Image src="/placeholder.svg?height=24&width=40" alt="Mastercard" width={40} height={24} />
                    <Image src="/placeholder.svg?height=24&width=40" alt="Verve" width={40} height={24} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    All transactions are secure and encrypted. By funding your wallet, you agree to our Terms of Service
                    and Privacy Policy.
                  </p>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/my-wallet")}>
                  <ArrowRight className="mr-2 h-4 w-4" /> Go to My Wallet
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  )
}
