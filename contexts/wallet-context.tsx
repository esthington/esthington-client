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

      // Get recent recipients
      // const recipientsResponse = await apiConfig.get(
      //   "/wallet/recent-recipients",
      //   {
      //     withCredentials: true,
      //   }
      // );

      // if (recipientsResponse.status === 200) {
      //   setRecentRecipients(recipientsResponse.data.recipients);
      // }
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

  // Get transaction by ID - Updated to use the correct endpoint
  const getTransactionById = async (
    transactionId: string
  ): Promise<Transaction | null> => {
    try {

      console.log("Transaction ID:", transactionId);
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

  // Fund wallet directly (for testing or direct deposits)
  const fundWallet = async (
    amount: number,
    paymentMethod: string,
    cardDetails?: any
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For bank transfers, create a direct deposit record
      if (paymentMethod === "bank_transfer") {
        // Generate a reference if not provided
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
      }
      // For Paystack payments that were already verified
      else if (paymentMethod === "card" && cardDetails?.reference) {
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
        "/wallet/withdraw",
        {
          amount,
          bankAccountId,
          note,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
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

        // Update bank accounts list
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

        // Update bank accounts list
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
