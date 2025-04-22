"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types
export interface Transaction {
  id: string
  title: string
  amount: number
  type: "deposit" | "withdrawal" | "transfer_in" | "transfer_out" | "investment"
  date: string
  status: "completed" | "pending" | "failed"
  reference: string
  recipientId?: string
  recipientName?: string
  senderId?: string
  senderName?: string
  description?: string
}

export interface BankAccount {
  id: string
  userId: string
  bankName: string
  accountName: string
  accountNumber: string
  isDefault: boolean
  dateAdded: string
}

export interface WalletUser {
  id: string
  name: string
  username: string
  avatar: string
}

interface WalletContextType {
  // Wallet state
  balance: number
  transactions: Transaction[]
  bankAccounts: BankAccount[]
  pendingTransactions: Transaction[]
  recentRecipients: WalletUser[]
  isLoading: boolean

  // Wallet actions
  fundWallet: (amount: number, paymentMethod: string, cardDetails?: any) => Promise<boolean>
  withdrawMoney: (amount: number, bankAccountId: string, note?: string) => Promise<boolean>
  transferMoney: (amount: number, recipientId: string, note?: string) => Promise<boolean>
  addBankAccount: (bankAccount: Omit<BankAccount, "id" | "userId" | "dateAdded">) => Promise<boolean>
  removeBankAccount: (bankAccountId: string) => Promise<boolean>
  setDefaultBankAccount: (bankAccountId: string) => Promise<boolean>
  searchUsers: (query: string) => Promise<WalletUser[]>
  getTransactionById: (transactionId: string) => Transaction | undefined
  getTransactionsByType: (type: Transaction["type"]) => Transaction[]
  getTransactionsByStatus: (status: Transaction["status"]) => Transaction[]
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[]
  refreshWalletData: () => Promise<void>
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  balance: 0,
  transactions: [],
  bankAccounts: [],
  pendingTransactions: [],
  recentRecipients: [],
  isLoading: false,

  fundWallet: async () => false,
  withdrawMoney: async () => false,
  transferMoney: async () => false,
  addBankAccount: async () => false,
  removeBankAccount: async () => false,
  setDefaultBankAccount: async () => false,
  searchUsers: async () => [],
  getTransactionById: () => undefined,
  getTransactionsByType: () => [],
  getTransactionsByStatus: () => [],
  getTransactionsByDateRange: () => [],
  refreshWalletData: async () => {},
})

// Sample data for testing
const mockTransactions: Transaction[] = [
  {
    id: "1",
    title: "Wallet Funding",
    amount: 50000,
    type: "deposit",
    date: "2023-05-20T10:30:00",
    status: "completed",
    reference: "EST-DEP-12345",
  },
  {
    id: "2",
    title: "Investment in Royal Gardens Estate",
    amount: 25000,
    type: "investment",
    date: "2023-05-19T14:45:00",
    status: "completed",
    reference: "EST-INV-67890",
  },
  {
    id: "3",
    title: "Withdrawal to Bank Account",
    amount: 15000,
    type: "withdrawal",
    date: "2023-05-15T09:20:00",
    status: "completed",
    reference: "EST-WTH-54321",
  },
  {
    id: "4",
    title: "Money Received from Jane Doe",
    amount: 5000,
    type: "transfer_in",
    date: "2023-05-12T16:30:00",
    status: "completed",
    reference: "EST-TRF-98765",
    senderId: "user123",
    senderName: "Jane Doe",
  },
  {
    id: "5",
    title: "Money Sent to John Smith",
    amount: 3000,
    type: "transfer_out",
    date: "2023-05-10T11:15:00",
    status: "completed",
    reference: "EST-TRF-24680",
    recipientId: "user456",
    recipientName: "John Smith",
  },
  {
    id: "6",
    title: "Wallet Funding",
    amount: 20000,
    type: "deposit",
    date: "2023-05-05T08:45:00",
    status: "completed",
    reference: "EST-DEP-13579",
  },
  {
    id: "7",
    title: "Withdrawal to Bank Account",
    amount: 10000,
    type: "withdrawal",
    date: "2023-05-01T13:20:00",
    status: "pending",
    reference: "EST-WTH-97531",
  },
]

const mockBankAccounts: BankAccount[] = [
  {
    id: "1",
    userId: "current-user",
    bankName: "First Bank of Nigeria",
    accountName: "John Doe",
    accountNumber: "0123456789",
    isDefault: true,
    dateAdded: "2023-04-15T10:30:00",
  },
]

const mockUsers: WalletUser[] = [
  {
    id: "user123",
    name: "Jane Doe",
    username: "janedoe",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user456",
    name: "John Smith",
    username: "johnsmith",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user789",
    name: "Alice Johnson",
    username: "alicej",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(125000) // ₦125,000 initial balance
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts)
  const [recentRecipients, setRecentRecipients] = useState<WalletUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Calculate pending transactions
  const pendingTransactions = transactions.filter((t) => t.status === "pending")

  // Initialize wallet data
  useEffect(() => {
    // In a real app, this would fetch data from an API
    const fetchWalletData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Set recent recipients based on transfer history
        const recipients: WalletUser[] = []
        transactions.forEach((transaction) => {
          if (transaction.type === "transfer_out" && transaction.recipientId) {
            const recipient = mockUsers.find((user) => user.id === transaction.recipientId)
            if (recipient && !recipients.some((r) => r.id === recipient.id)) {
              recipients.push(recipient)
            }
          }
        })
        setRecentRecipients(recipients.slice(0, 5))
      } catch (error) {
        console.error("Error fetching wallet data:", error)
        errorToast("Failed to load wallet data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  // Fund wallet
  const fundWallet = async (amount: number, paymentMethod: string, cardDetails?: any): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new transaction
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        title: "Wallet Funding",
        amount: amount,
        type: "deposit",
        date: new Date().toISOString(),
        status: "completed",
        reference: `EST-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        description: `Funded via ${paymentMethod}`,
      }

      // Update state
      setBalance((prevBalance) => prevBalance + amount)
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions])

      successToast("Your wallet has been funded successfully!")
      return true
    } catch (error) {
      console.error("Error funding wallet:", error)
      errorToast("Failed to process payment. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw money
  const withdrawMoney = async (amount: number, bankAccountId: string, note?: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Validate amount
      if (amount > balance) {
        errorToast("Insufficient funds in your wallet.")
        return false
      }

      // Find bank account
      const bankAccount = bankAccounts.find((account) => account.id === bankAccountId)
      if (!bankAccount) {
        errorToast("Bank account not found.")
        return false
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new transaction
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        title: "Withdrawal to Bank Account",
        amount: amount,
        type: "withdrawal",
        date: new Date().toISOString(),
        status: "pending", // Withdrawals are initially pending
        reference: `EST-WTH-${Math.floor(100000 + Math.random() * 900000)}`,
        description: note || `Withdrawal to ${bankAccount.bankName} (${bankAccount.accountNumber})`,
      }

      // Update state
      setBalance((prevBalance) => prevBalance - amount)
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions])

      successToast("Withdrawal request submitted successfully!")
      return true
    } catch (error) {
      console.error("Error withdrawing money:", error)
      errorToast("Failed to process withdrawal. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Transfer money
  const transferMoney = async (amount: number, recipientId: string, note?: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Validate amount
      if (amount > balance) {
        errorToast("Insufficient funds in your wallet.")
        return false
      }

      // Find recipient
      const recipient = mockUsers.find((user) => user.id === recipientId)
      if (!recipient) {
        errorToast("Recipient not found.")
        return false
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new transaction
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        title: `Money Sent to ${recipient.name}`,
        amount: amount,
        type: "transfer_out",
        date: new Date().toISOString(),
        status: "completed",
        reference: `EST-TRF-${Math.floor(100000 + Math.random() * 900000)}`,
        recipientId: recipient.id,
        recipientName: recipient.name,
        description: note || `Transfer to ${recipient.name}`,
      }

      // Update state
      setBalance((prevBalance) => prevBalance - amount)
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions])

      // Add recipient to recent recipients if not already there
      if (!recentRecipients.some((r) => r.id === recipient.id)) {
        setRecentRecipients((prevRecipients) => [recipient, ...prevRecipients.slice(0, 4)])
      }

      successToast(`Transfer to ${recipient.name} was successful!`)
      return true
    } catch (error) {
      console.error("Error transferring money:", error)
      errorToast("Failed to process transfer. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Add bank account
  const addBankAccount = async (bankAccount: Omit<BankAccount, "id" | "userId" | "dateAdded">): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new bank account
      const newBankAccount: BankAccount = {
        ...bankAccount,
        id: `bank-${Date.now()}`,
        userId: "current-user",
        dateAdded: new Date().toISOString(),
      }

      // If this is the first account or isDefault is true, make it the default
      if (bankAccounts.length === 0 || bankAccount.isDefault) {
        // Set all other accounts to non-default
        const updatedAccounts = bankAccounts.map((account) => ({
          ...account,
          isDefault: false,
        }))

        // Add the new account
        setBankAccounts([...updatedAccounts, newBankAccount])
      } else {
        // Add the new account without changing defaults
        setBankAccounts([...bankAccounts, newBankAccount])
      }

      successToast("Bank account added successfully!")
      return true
    } catch (error) {
      console.error("Error adding bank account:", error)
      errorToast("Failed to add bank account. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Remove bank account
  const removeBankAccount = async (bankAccountId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Find the account
      const accountToRemove = bankAccounts.find((account) => account.id === bankAccountId)
      if (!accountToRemove) {
        errorToast("Bank account not found.")
        return false
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove the account
      const updatedAccounts = bankAccounts.filter((account) => account.id !== bankAccountId)

      // If the removed account was the default, set a new default if there are any accounts left
      if (accountToRemove.isDefault && updatedAccounts.length > 0) {
        updatedAccounts[0].isDefault = true
      }

      setBankAccounts(updatedAccounts)

      successToast("Bank account removed successfully!")
      return true
    } catch (error) {
      console.error("Error removing bank account:", error)
      errorToast("Failed to remove bank account. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Set default bank account
  const setDefaultBankAccount = async (bankAccountId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Find the account
      const accountToSetDefault = bankAccounts.find((account) => account.id === bankAccountId)
      if (!accountToSetDefault) {
        errorToast("Bank account not found.")
        return false
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update all accounts
      const updatedAccounts = bankAccounts.map((account) => ({
        ...account,
        isDefault: account.id === bankAccountId,
      }))

      setBankAccounts(updatedAccounts)

      successToast("Default bank account updated successfully!")
      return true
    } catch (error) {
      console.error("Error setting default bank account:", error)
      errorToast("Failed to update default bank account. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Search users
  const searchUsers = async (query: string): Promise<WalletUser[]> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Filter users based on query
      if (!query.trim()) return []

      const filteredUsers = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()),
      )

      return filteredUsers
    } catch (error) {
      console.error("Error searching users:", error)
      errorToast("Failed to search users. Please try again.")
      return []
    }
  }

  // Get transaction by ID
  const getTransactionById = (transactionId: string): Transaction | undefined => {
    return transactions.find((transaction) => transaction.id === transactionId)
  }

  // Get transactions by type
  const getTransactionsByType = (type: Transaction["type"]): Transaction[] => {
    return transactions.filter((transaction) => transaction.type === type)
  }

  // Get transactions by status
  const getTransactionsByStatus = (status: Transaction["status"]): Transaction[] => {
    return transactions.filter((transaction) => transaction.status === status)
  }

  // Get transactions by date range
  const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date).getTime()
      return transactionDate >= start && transactionDate <= end
    })
  }

  // Refresh wallet data
  const refreshWalletData = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would fetch fresh data from the API
      // For now, we'll just simulate a refresh by doing nothing

      successToast("Wallet data refreshed successfully!")
    } catch (error) {
      console.error("Error refreshing wallet data:", error)
      errorToast("Failed to refresh wallet data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: WalletContextType = {
    balance,
    transactions,
    bankAccounts,
    pendingTransactions,
    recentRecipients,
    isLoading,

    fundWallet,
    withdrawMoney,
    transferMoney,
    addBankAccount,
    removeBankAccount,
    setDefaultBankAccount,
    searchUsers,
    getTransactionById,
    getTransactionsByType,
    getTransactionsByStatus,
    getTransactionsByDateRange,
    refreshWalletData,
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
