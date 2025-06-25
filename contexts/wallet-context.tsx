"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiConfig } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Types
export interface Transaction {
  _id: string;
  type:
    | "deposit"
    | "withdrawal"
    | "transfer"
    | "payment"
    | "refund"
    | "referral"
    | "investment"
    | "property_purchase";
  amount: number;
  check: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  reference: string;
  description: string;
  date: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  recipient?: string;
  sender?: string;
  property?: string;
  investment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  _id: string;
  user: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletUser {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  avatar?: string;
}

// Investment Due Types to match controller
export interface InvestmentDue {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  investment: {
    _id: string;
    title: string;
    propertyId: string;
    type?: string;
    duration?: number;
  };
  amount: number;
  nextPayoutDate: string;
  status: "pending" | "paid" | "failed";
  expectedReturn: number;
  actualReturn: number;
  isOverdue: boolean;
  progressPercentage: number;
  payoutId: string;
  payouts: Array<{
    _id: string;
    date: string;
    amount: number;
    status: "pending" | "paid" | "failed";
    transactionId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface InvestmentDueStats {
  total: number;
  pending: number;
  paid: number;
  failed: number;
  overdue: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  activeInvestors: number;
}

interface WalletContextType {
  // Wallet state
  wallet: Wallet | null;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  pendingTransactions: Transaction[];
  recentRecipients: WalletUser[];
  isLoading: boolean;

  // Wallet actions
  fundWallet: (
    amount: number,
    paymentMethod: string,
    cardDetails?: any
  ) => Promise<boolean>;
  initializeWalletFunding: (
    amount: number
  ) => Promise<{ authorization_url: string; reference: string } | null>;
  verifyWalletFunding: (reference: string) => Promise<boolean>;
  withdrawMoney: (
    amount: number,
    bankAccountId: string,
    note?: string
  ) => Promise<boolean>;
  transferMoney: (
    amount: number,
    recipientId: string,
    note?: string
  ) => Promise<boolean>;
  addBankAccount: (
    bankAccount: Omit<
      BankAccount,
      "_id" | "user" | "createdAt" | "updatedAt" | "isDefault"
    >
  ) => Promise<boolean>;
  removeBankAccount: (bankAccountId: string) => Promise<boolean>;
  setDefaultBankAccount: (bankAccountId: string) => Promise<boolean>;
  updateBankAccount: (
    bankAccountId: string,
    bankAccountData: Omit<
      BankAccount,
      "_id" | "user" | "createdAt" | "updatedAt"
    >
  ) => Promise<boolean>;
  searchUsers: (query: string) => Promise<WalletUser[]>;
  getTransactionById: (transactionId: string) => Promise<Transaction | null>;
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<TransactionResponse>;
  refreshWalletData: () => Promise<void>;

  // Admin actions
  getAllTransactionsAdmin: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => Promise<TransactionResponse>;
  getTransactionStatsAdmin: () => Promise<any>;
  approveTransactionAdmin: (
    transactionId: string,
    notes?: string
  ) => Promise<boolean>;
  rejectTransactionAdmin: (
    transactionId: string,
    reason: string
  ) => Promise<boolean>;

  // Investment due functions
  getInvestmentDues: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<{
    dues: InvestmentDue[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;
  getInvestmentDueStats: () => Promise<InvestmentDueStats | null>;
  approveInvestmentDue: (payoutId: string, notes?: string) => Promise<boolean>;
  rejectInvestmentDue: (payoutId: string, reason: string) => Promise<boolean>;
  approveWithdrawal: (
    transactionId: string,
    notes?: string
  ) => Promise<boolean>;
  rejectWithdrawal: (transactionId: string, reason: string) => Promise<boolean>;
  getPendingWithdrawals: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
  }) => Promise<{
    withdrawals: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  wallet: null,
  transactions: [],
  bankAccounts: [],
  pendingTransactions: [],
  recentRecipients: [],
  isLoading: false,
  fundWallet: async () => false,
  initializeWalletFunding: async () => null,
  verifyWalletFunding: async () => false,
  withdrawMoney: async () => false,
  transferMoney: async () => false,
  addBankAccount: async () => false,
  removeBankAccount: async () => false,
  setDefaultBankAccount: async () => false,
  searchUsers: async () => [],
  getTransactionById: async () => null,
  updateBankAccount: async () => Promise.resolve(false),
  getTransactions: async () => ({
    transactions: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  }),
  refreshWalletData: async () => {},
  getAllTransactionsAdmin: async () => ({
    transactions: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  }),
  getTransactionStatsAdmin: async () => null,
  approveTransactionAdmin: async () => false,
  rejectTransactionAdmin: async () => false,
  getInvestmentDues: async () => ({
    dues: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  }),
  getInvestmentDueStats: async () => null,
  approveInvestmentDue: async () => false,
  rejectInvestmentDue: async () => false,
  approveWithdrawal: async () => false,
  rejectWithdrawal: async () => false,
  getPendingWithdrawals: async () => ({
    withdrawals: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  }),
});

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [recentRecipients, setRecentRecipients] = useState<WalletUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Calculate pending transactions
  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending"
  );

  // Initialize wallet data
  useEffect(() => {
    refreshWalletData();
  }, []);

  // Refresh wallet data
  const refreshWalletData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Get wallet data
      const walletResponse = await apiConfig.get("/wallet", {
        withCredentials: true,
      });

      if (walletResponse.status === 200) {
        setWallet(walletResponse.data.wallet);
      }

      // Get transactions (just the first page for initial load)
      const transactionResponse = await getTransactions({ limit: 10, page: 1 });
      setTransactions(transactionResponse.transactions);

      // Get bank accounts
      const bankAccountsResponse = await apiConfig.get("/bank-accounts", {
        withCredentials: true,
      });

      if (bankAccountsResponse.status === 200) {
        setBankAccounts(bankAccountsResponse.data.bankAccounts);
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to load wallet data",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get transactions - Updated to return pagination data
  const getTransactions = async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionResponse> => {
    try {
      const response = await apiConfig.get("/transactions/user", {
        params,
        withCredentials: true,
      });

      if (response.status === 200) {
        return {
          transactions: response.data.data || [],
          totalCount: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1,
        };
      }
      return { transactions: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to load transactions",
          variant: "destructive",
        });
      }
      return { transactions: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
  };

  // Get transaction by ID
  const getTransactionById = async (
    transactionId: string
  ): Promise<Transaction | null> => {
    try {
      const response = await apiConfig.get(`/transactions/${transactionId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching transaction:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message ||
            "Failed to fetch transaction details",
          variant: "destructive",
        });
      }
      return null;
    }
  };

  // Update bank account
  const updateBankAccount = async (
    bankAccountId: string,
    bankAccountData: Omit<
      BankAccount,
      "_id" | "user" | "createdAt" | "updatedAt"
    >
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.put(
        `/bank-accounts/${bankAccountId}`,
        bankAccountData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Bank account updated successfully",
        });

        // If setting as default, update all accounts in state
        if (bankAccountData.isDefault) {
          setBankAccounts((prev) =>
            prev.map((account) => ({
              ...account,
              isDefault: account._id === bankAccountId,
            }))
          );
        } else {
          // Just update the specific account
          setBankAccounts((prev) =>
            prev.map((account) =>
              account._id === bankAccountId
                ? { ...account, ...bankAccountData }
                : account
            )
          );
        }

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error updating bank account:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to update bank account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize wallet funding
  const initializeWalletFunding = async (
    amount: number
  ): Promise<{ authorization_url: string; reference: string } | null> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.post(
        "/wallet/fund/initialize",
        { amount },
        { withCredentials: true }
      );

      if (response.status === 200) {
        return {
          authorization_url: response.data.data.authorization_url,
          reference: response.data.data.reference,
        };
      }
      return null;
    } catch (error: any) {
      console.error("Error initializing wallet funding:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to initialize payment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify wallet funding
  const verifyWalletFunding = async (reference: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await apiConfig.get(`/wallet/fund/verify/${reference}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        if (response.data.success) {
          // Update wallet data after successful verification
          await refreshWalletData();
          toast({
            title: "Success",
            description:
              response.data.message || "Payment verified successfully",
          });
          return true;
        } else {
          toast({
            title: "Payment Failed",
            description: response.data.message || "Payment verification failed",
            variant: "destructive",
          });
          return false;
        }
      }
      return false;
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to verify payment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fund wallet directly
  const fundWallet = async (
    amount: number,
    paymentMethod: string,
    cardDetails?: any
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (paymentMethod === "bank_transfer") {
        const reference =
          cardDetails?.reference ||
          `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const response = await apiConfig.post(
          "/wallet/fund",
          {
            amount,
            reference,
            paymentMethod: "bank_transfer",
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Wallet funding request submitted successfully",
          });
          await refreshWalletData();
          return true;
        }
      } else if (paymentMethod === "card" && cardDetails?.reference) {
        const response = await apiConfig.post(
          "/wallet/fund",
          {
            amount,
            reference: cardDetails.reference,
            paymentMethod: "card",
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Wallet funded successfully",
          });
          await refreshWalletData();
          return true;
        }
      }

      return false;
    } catch (error: any) {
      console.error("Error funding wallet:", error);
      if (error.response) {
        toast({
          title: "Error",
          description: error.response.data?.message || "Failed to fund wallet",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw money
  const withdrawMoney = async (
    amount: number,
    bankAccountId: string,
    note?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.post(
        "/process-withdrawal/",
        {
          amount,
          bankAccountId,
          note,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Withdrawal request submitted successfully",
        });
        await refreshWalletData();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error withdrawing money:", error);
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message || "Failed to process withdrawal";

        if (statusCode === 400 && errorMessage.includes("Insufficient")) {
          toast({
            title: "Insufficient Balance",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer money
  const transferMoney = async (
    amount: number,
    recipientId: string,
    note?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.post(
        "/wallet/transfer",
        {
          amount,
          recipientId,
          note,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Transfer completed successfully",
        });
        await refreshWalletData();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error transferring money:", error);
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message || "Failed to process transfer";

        if (statusCode === 400 && errorMessage.includes("Insufficient")) {
          toast({
            title: "Insufficient Balance",
            description: errorMessage,
            variant: "destructive",
          });
        } else if (statusCode === 404) {
          toast({
            title: "User Not Found",
            description: "Recipient not found",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add bank account
  const addBankAccount = async (
    bankAccount: Omit<
      BankAccount,
      "_id" | "user" | "createdAt" | "updatedAt" | "isDefault"
    >
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.post("/bank-accounts", bankAccount, {
        withCredentials: true,
      });

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Bank account added successfully",
        });

        // Update bank accounts list
        const bankAccountsResponse = await apiConfig.get("/bank-accounts", {
          withCredentials: true,
        });

        if (bankAccountsResponse.status === 200) {
          setBankAccounts(bankAccountsResponse.data.bankAccounts);
        }

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error adding bank account:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to add bank account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove bank account
  const removeBankAccount = async (bankAccountId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.delete(
        `/bank-accounts/${bankAccountId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Bank account removed successfully",
        });

        setBankAccounts((prev) =>
          prev.filter((account) => account._id !== bankAccountId)
        );
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error removing bank account:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to remove bank account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set default bank account
  const setDefaultBankAccount = async (
    bankAccountId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.put(
        `/bank-accounts/${bankAccountId}/default`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Default bank account updated successfully",
        });

        const updatedAccounts = bankAccounts.map((account) => ({
          ...account,
          isDefault: account._id === bankAccountId,
        }));

        setBankAccounts(updatedAccounts);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error setting default bank account:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message ||
            "Failed to update default bank account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query: string): Promise<WalletUser[]> => {
    if (!query.trim()) return [];

    try {
      const response = await apiConfig.get("/wallet/users/search", {
        params: { query },
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.users;
      }
      return [];
    } catch (error: any) {
      console.error("Error searching users:", error);
      if (error.response) {
        toast({
          title: "Error",
          description: error.response.data?.message || "Failed to search users",
          variant: "destructive",
        });
      }
      return [];
    }
  };

  // Get all transactions for admin
  const getAllTransactionsAdmin = async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<TransactionResponse> => {
    try {
      const response = await apiConfig.get("/transactions", {
        params,
        withCredentials: true,
      });

      if (response.status === 200) {
        return {
          transactions: response.data.data || [],
          totalCount: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1,
        };
      }
      return { transactions: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    } catch (error: any) {
      console.error("Error fetching admin transactions:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to load transactions",
          variant: "destructive",
        });
      }
      return { transactions: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
  };

  // Get transaction stats for admin
  const getTransactionStatsAdmin = async (): Promise<any> => {
    try {
      const response = await apiConfig.get("/process-withdrawal/stats", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching transaction stats:", error);
      return null;
    }
  };

  // Approve transaction (admin only)
  const approveTransactionAdmin = async (
    transactionId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/transactions/${transactionId}/approve`,
        { notes },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Transaction approved successfully.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error approving transaction:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to approve transaction",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Reject transaction (admin only)
  const rejectTransactionAdmin = async (
    transactionId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/transactions/${transactionId}/reject`,
        { reason },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Transaction rejected successfully.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error rejecting transaction:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to reject transaction",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Get investment dues - Updated to match controller
  const getInvestmentDues = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiConfig.get("/investment-dues", {
        params: {
          ...params,
          sortBy: params?.sortBy || "nextPayoutDate",
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        return {
          dues: response.data.data || [],
          totalCount: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1,
        };
      }
      return { dues: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    } catch (error: any) {
      console.error("Error fetching investment dues:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to load investment dues",
          variant: "destructive",
        });
      }
      return { dues: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
  };

  // Get investment due stats
  const getInvestmentDueStats =
    async (): Promise<InvestmentDueStats | null> => {
      try {
        const response = await apiConfig.get("/investment-dues/stats", {
          withCredentials: true,
        });

        if (response.status === 200) {
          return response.data.data;
        }
        return null;
      } catch (error: any) {
        console.error("Error fetching investment due stats:", error);
        return null;
      }
    };

  // Approve investment due - Updated to use payoutId
  const approveInvestmentDue = async (
    payoutId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/investment-dues/${payoutId}/approve`,
        { notes },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Investment due approved successfully.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error approving investment due:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to approve investment due",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Reject investment due - Updated to use payoutId
  const rejectInvestmentDue = async (
    payoutId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/investment-dues/${payoutId}/reject`,
        { reason },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Investment due rejected successfully.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error rejecting investment due:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to reject investment due",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Approve withdrawal
  const approveWithdrawal = async (
    transactionId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/process-withdrawal/${transactionId}/approve`,
        { note: notes },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Withdrawal approved successfully.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error approving withdrawal:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to approve withdrawal",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Reject withdrawal
  const rejectWithdrawal = async (
    transactionId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/process-withdrawal/${transactionId}/reject`,
        { note: reason },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Withdrawal rejected successfully.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error rejecting withdrawal:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message || "Failed to reject withdrawal",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Get pending withdrawals for admin
  const getPendingWithdrawals = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
  }) => {
    try {
      const response = await apiConfig.get("/process-withdrawal/admin", {
        params: {
          ...params,
          sortBy: params?.sortBy || "createdAt",
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        return {
          withdrawals: response.data.data || [],
          totalCount: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1,
        };
      }
      return { withdrawals: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    } catch (error: any) {
      console.error("Error fetching pending withdrawals:", error);
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data?.message ||
            "Failed to load pending withdrawals",
          variant: "destructive",
        });
      }
      return { withdrawals: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
  };

  const contextValue: WalletContextType = {
    wallet,
    transactions,
    bankAccounts,
    pendingTransactions,
    recentRecipients,
    isLoading,
    fundWallet,
    initializeWalletFunding,
    verifyWalletFunding,
    withdrawMoney,
    transferMoney,
    addBankAccount,
    removeBankAccount,
    updateBankAccount,
    setDefaultBankAccount,
    searchUsers,
    getTransactionById,
    getTransactions,
    refreshWalletData,
    getAllTransactionsAdmin,
    getTransactionStatsAdmin,
    approveTransactionAdmin,
    rejectTransactionAdmin,
    getInvestmentDues,
    getInvestmentDueStats,
    approveInvestmentDue,
    rejectInvestmentDue,
    approveWithdrawal,
    rejectWithdrawal,
    getPendingWithdrawals,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
