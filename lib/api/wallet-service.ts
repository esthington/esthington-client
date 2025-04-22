import { apiConfig } from "./api-config"
import type { BankAccount } from "@/contexts/wallet-context"

export interface WalletResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export const WalletService = {
  // Get wallet balance
  getBalance: async (): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.get("/wallet/balance")
      return {
        success: true,
        message: "Balance retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve balance",
        error: error.message,
      }
    }
  },

  // Get transactions
  getTransactions: async (): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.get("/wallet/transactions")
      return {
        success: true,
        message: "Transactions retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve transactions",
        error: error.message,
      }
    }
  },

  // Fund wallet
  fundWallet: async (amount: number, paymentMethod: string, cardDetails?: any): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.post("/wallet/fund", {
        amount,
        paymentMethod,
        cardDetails,
      })
      return {
        success: true,
        message: "Wallet funded successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fund wallet",
        error: error.message,
      }
    }
  },

  // Withdraw money
  withdrawMoney: async (amount: number, bankAccountId: string, note?: string): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.post("/wallet/withdraw", {
        amount,
        bankAccountId,
        note,
      })
      return {
        success: true,
        message: "Withdrawal request submitted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to process withdrawal",
        error: error.message,
      }
    }
  },

  // Transfer money
  transferMoney: async (amount: number, recipientId: string, note?: string): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.post("/wallet/transfer", {
        amount,
        recipientId,
        note,
      })
      return {
        success: true,
        message: "Transfer completed successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to process transfer",
        error: error.message,
      }
    }
  },

  // Get bank accounts
  getBankAccounts: async (): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.get("/wallet/bank-accounts")
      return {
        success: true,
        message: "Bank accounts retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve bank accounts",
        error: error.message,
      }
    }
  },

  // Add bank account
  addBankAccount: async (bankAccount: Omit<BankAccount, "id" | "userId" | "dateAdded">): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.post("/wallet/bank-accounts", bankAccount)
      return {
        success: true,
        message: "Bank account added successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add bank account",
        error: error.message,
      }
    }
  },

  // Remove bank account
  removeBankAccount: async (bankAccountId: string): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.delete(`/wallet/bank-accounts/${bankAccountId}`)
      return {
        success: true,
        message: "Bank account removed successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove bank account",
        error: error.message,
      }
    }
  },

  // Set default bank account
  setDefaultBankAccount: async (bankAccountId: string): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.put(`/wallet/bank-accounts/${bankAccountId}/default`)
      return {
        success: true,
        message: "Default bank account updated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update default bank account",
        error: error.message,
      }
    }
  },

  // Search users for transfer
  searchUsers: async (query: string): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.get(`/users/search?q=${query}`)
      return {
        success: true,
        message: "Users retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search users",
        error: error.message,
      }
    }
  },

  // Get transaction by ID
  getTransactionById: async (transactionId: string): Promise<WalletResponse> => {
    try {
      const response = await apiConfig.get(`/wallet/transactions/${transactionId}`)
      return {
        success: true,
        message: "Transaction retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve transaction",
        error: error.message,
      }
    }
  },
}
