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
  searchUsers: (query: string) => Promise<WalletUser[]>;
  getTransactionById: (transactionId: string) => Promise<Transaction | null>;
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
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
  getTransactions: async () => {},
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

      // Get transactions
      await getTransactions({ limit: 10, page: 1 });

      // Get bank accounts
      const bankAccountsResponse = await apiConfig.get(
        "/wallet/bank-accounts",
        {
          withCredentials: true,
        }
      );

      if (bankAccountsResponse.status === 200) {
        setBankAccounts(bankAccountsResponse.data.bankAccounts);
      }

      // Get recent recipients
      const recipientsResponse = await apiConfig.get(
        "/wallet/recent-recipients",
        {
          withCredentials: true,
        }
      );

      if (recipientsResponse.status === 200) {
        setRecentRecipients(recipientsResponse.data.recipients);
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

  // Get transactions
  const getTransactions = async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<void> => {
    try {
      const response = await apiConfig.get("/wallet/transactions", {
        params,
        withCredentials: true,
      });

      if (response.status === 200) {
        setTransactions(response.data.transactions);
      }
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
    console.log(
      "Client attempting to verify payment with reference:",
      reference
    );
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
          // Don't show error toast if verification fails - the webhook might handle it
          console.log(
            "Payment verification returned false, webhook may handle it"
          );
          return false;
        }
      }
      return false;
    } catch (error: any) {
      console.error("Client-side payment verification error:", error);
      // Don't show error toast - the webhook will handle it
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
      // For bank transfers, create a direct deposit record with pending status
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
            status: cardDetails?.status || "pending", // Ensure bank transfers are pending by default
            requiresApproval: true, // Flag to indicate admin approval is needed
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          toast({
            title: "Success",
            description:
              "Wallet funding request submitted successfully. Admin approval required.",
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
      const response = await apiConfig.post(
        "/wallet/bank-accounts",
        bankAccount,
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Bank account added successfully",
        });

        // Update bank accounts list
        const bankAccountsResponse = await apiConfig.get(
          "/wallet/bank-accounts",
          {
            withCredentials: true,
          }
        );

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
        `/wallet/bank-accounts/${bankAccountId}`,
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
      const response = await apiConfig.patch(
        `/wallet/bank-accounts/${bankAccountId}/default`,
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
      const response = await apiConfig.get("/users/search", {
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

  // Get transaction by ID
  const getTransactionById = async (
    transactionId: string
  ): Promise<Transaction | null> => {
    try {
      const response = await apiConfig.get(
        `/wallet/transactions/${transactionId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        return response.data.transaction;
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
