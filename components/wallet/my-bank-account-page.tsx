"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BanknoteIcon as Bank, Plus, Trash2, Edit2 } from "lucide-react"
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

export default function MyBankAccountPage() {
  const router = useRouter()
  const { bankAccounts, addBankAccount, removeBankAccount, setDefaultBankAccount, isLoading } = useWallet()
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [newAccount, setNewAccount] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    isDefault: false,
  })

  const handleAddAccount = () => {
    setIsAddingAccount(true)
  }

  const handleCancelAdd = () => {
    setIsAddingAccount(false)
    setNewAccount({
      bankName: "",
      accountName: "",
      accountNumber: "",
      isDefault: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await addBankAccount(newAccount)

    if (success) {
      // Reset form and close add account section
      setNewAccount({
        bankName: "",
        accountName: "",
        accountNumber: "",
        isDefault: false,
      })
      setIsAddingAccount(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    await removeBankAccount(id)
  }

  const handleSetDefault = async (id: string) => {
    await setDefaultBankAccount(id)
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bank Accounts</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your linked bank accounts</p>
            </div>
            <Button
              onClick={handleAddAccount}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isAddingAccount}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Bank Account
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
                  <BreadcrumbPage>Bank Accounts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        {isAddingAccount && (
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Bank Account</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select
                    value={newAccount.bankName}
                    onValueChange={(value) => setNewAccount({ ...newAccount, bankName: value })}
                    required
                  >
                    <SelectTrigger id="bankName">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Bank of Nigeria">First Bank of Nigeria</SelectItem>
                      <SelectItem value="Guaranty Trust Bank">Guaranty Trust Bank</SelectItem>
                      <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                      <SelectItem value="Access Bank">Access Bank</SelectItem>
                      <SelectItem value="United Bank for Africa">United Bank for Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                    placeholder="Enter account name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value.replace(/\D/g, "") })}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleCancelAdd}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" /> Adding...
                      </>
                    ) : (
                      <>Add Account</>
                    )}
                  </Button>
                </div>
              </form>
            </AnimatedCard>
          </FadeIn>
        )}

        <FadeIn delay={0.3}>
          <AnimatedCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Linked Bank Accounts</h2>
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Bank className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Bank Accounts</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't added any bank accounts yet. Add a bank account to withdraw funds from your wallet.
                </p>
                <Button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <Bank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{account.bankName}</h3>
                          {account.isDefault && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{account.accountName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{account.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      {!account.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(account.id)}
                          className="text-xs h-8"
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-xs h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>
        </FadeIn>

        <FadeIn delay={0.4}>
          <AnimatedCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Important Information</h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                When adding a bank account, please ensure that the account name matches the name on your Esthington
                account for security purposes.
              </p>
              <p>
                Withdrawals to your bank account typically take 1-2 business days to process. You will receive a
                notification once the withdrawal is complete.
              </p>
              <p>
                For security reasons, you can only withdraw to bank accounts that are registered in your name. If you
                need to withdraw to a different account, please contact our support team.
              </p>
            </div>
          </AnimatedCard>
        </FadeIn>
      </div>
    </>
  )
}
