"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiConfig } from "@/lib/api";

// Types based on the MongoDB schema
export enum ReferralStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum AgentRank {
  BRONZE = "Bronze",
  SILVER = "Silver",
  GOLD = "Gold",
  PLATINUM = "Platinum",
}

export interface Referral {
  _id: string;
  referrer: User;
  referred: User;
  status: ReferralStatus;
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  phone?: string;
  profileImage?: string;
  referralCode?: string;
  userName?: string;
  agentRank?: AgentRank;
}

export interface Transaction {
  _id: string;
  user: string;
  type: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
  referralLink: string | null;
}

export interface CommissionRates {
  [key: string]: {
    investment: number;
    property: number;
  };
}

export interface AgentRankInfo {
  currentRank: AgentRank;
  nextRank: AgentRank;
  progress: number;
  requiredReferrals: number;
  currentReferrals: number;
}

// Activity log entry type
export interface ActivityLogEntry {
  _id: string;
  referralId: string;
  date: string;
  title: string;
  description: string;
  type: string;
}

// Commission history entry type
export interface CommissionHistoryEntry {
  _id: string;
  referralId: string;
  amount: number;
  date: string;
  description: string;
  details: string;
  status: "pending" | "completed" | "failed";
}

interface ReferralsContextType {
  // State
  referrals: Referral[];
  isLoading: boolean;
  error: string | null;
  stats: ReferralStats | null;
  earnings: Transaction[];
  commissionRates: CommissionRates | null;
  agentRankInfo: AgentRankInfo | null;

  // Actions
  getUserReferrals: () => Promise<void>;
  getReferralStats: () => Promise<void>;
  generateReferralLink: () => Promise<string | null>;
  getReferralEarnings: (startDate?: string, endDate?: string) => Promise<void>;
  getReferralCommissionRates: () => Promise<void>;
  getAgentRankInfo: () => Promise<void>;
  processReferral: (
    referredUserId: string,
    transactionType: string,
    amount: number
  ) => Promise<void>;
  copyReferralLink: () => void;
  verifyReferralCode: (
    code: string
  ) => Promise<{ referrerId: string; referrerName: string } | null>;

  // Admin functions
  getReferralById: (id: string) => Promise<Referral | null>;
  getRefereesByReferrerId: (referrerId: string) => Promise<Referral[]>;
  getReferralCommissionHistory: (
    referralId: string
  ) => Promise<CommissionHistoryEntry[]>;
  getReferralActivityLog: (referralId: string) => Promise<ActivityLogEntry[]>;
  updateReferralStatus: (
    referralId: string,
    status: ReferralStatus
  ) => Promise<void>;
  deleteReferral: (referralId: string) => Promise<void>;
  getAllReferrals: (
    page?: number,
    limit?: number,
    filters?: Record<string, any>
  ) => Promise<{ referrals: Referral[]; total: number; pages: number }>;
}

const ReferralsContext = createContext<ReferralsContextType | undefined>(
  undefined
);

export const useReferrals = () => {
  const context = useContext(ReferralsContext);
  if (context === undefined) {
    throw new Error("useReferrals must be used within a ReferralsProvider");
  }
  return context;
};

interface ReferralsProviderProps {
  children: ReactNode;
}

export const ReferralsProvider = ({ children }: ReferralsProviderProps) => {
  const router = useRouter();

  // State
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [earnings, setEarnings] = useState<Transaction[]>([]);
  const [commissionRates, setCommissionRates] =
    useState<CommissionRates | null>(null);
  const [agentRankInfo, setAgentRankInfo] = useState<AgentRankInfo | null>(
    null
  );

  // Get user's referrals
  const getUserReferrals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get("/referrals", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setReferrals(response.data.data);
      } else {
        throw new Error("Failed to fetch referrals");
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError("Failed to fetch referrals");
      toast.error("Failed to fetch referrals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get referral stats
  const getReferralStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get("/referrals/stats", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setStats(response.data.data);
      } else {
        throw new Error("Failed to fetch referral stats");
      }
    } catch (err) {
      console.error("Error fetching referral stats:", err);
      setError("Failed to fetch referral stats");
      toast.error("Failed to fetch referral stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate referral link
  const generateReferralLink = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.post(
        "/referrals/generate-link",
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { referralLink } = response.data.data;

        // Update stats with new referral link
        if (stats) {
          setStats({
            ...stats,
            referralLink,
          });
        }

        toast.success("Referral link generated successfully");
        return referralLink;
      } else {
        throw new Error("Failed to generate referral link");
      }
    } catch (err) {
      console.error("Error generating referral link:", err);
      setError("Failed to generate referral link");
      toast.error("Failed to generate referral link");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  // Get referral earnings
  const getReferralEarnings = useCallback(
    async (startDate?: string, endDate?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        let url = "/referrals/earnings";
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await apiConfig.get(url, { withCredentials: true });

        if (response.status === 200) {
          setEarnings(response.data.data);
        } else {
          throw new Error("Failed to fetch referral earnings");
        }
      } catch (err) {
        console.error("Error fetching referral earnings:", err);
        setError("Failed to fetch referral earnings");
        toast.error("Failed to fetch referral earnings");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get referral commission rates
  const getReferralCommissionRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get("/referrals/commission-rates", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setCommissionRates(response.data.data);
      } else {
        throw new Error("Failed to fetch commission rates");
      }
    } catch (err) {
      console.error("Error fetching commission rates:", err);
      setError("Failed to fetch commission rates");
      toast.error("Failed to fetch commission rates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get agent rank info
  const getAgentRankInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get("/referrals/agent-rank", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setAgentRankInfo(response.data.data);
      } else {
        throw new Error("Failed to fetch agent rank information");
      }
    } catch (err) {
      console.error("Error fetching agent rank info:", err);
      setError("Failed to fetch agent rank information");
      toast.error("Failed to fetch agent rank information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process referral
  const processReferral = useCallback(
    async (referredUserId: string, transactionType: string, amount: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiConfig.post(
          "/referrals/process",
          { referredUserId, transactionType, amount },
          { withCredentials: true }
        );

        if (response.status === 200) {
          // Refresh referrals and earnings after processing
          await getUserReferrals();
          await getReferralEarnings();

          const { commission } = response.data.data;
          toast.success(
            `Referral processed successfully. Commission: ${commission}`
          );
        } else {
          throw new Error("Failed to process referral");
        }
      } catch (err) {
        console.error("Error processing referral:", err);
        setError("Failed to process referral");
        toast.error("Failed to process referral");
      } finally {
        setIsLoading(false);
      }
    },
    [getUserReferrals, getReferralEarnings]
  );

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(() => {
    if (!stats?.referralLink) {
      toast.error("No referral link available");
      return;
    }

    navigator.clipboard.writeText(stats.referralLink);
    toast.success("Referral link copied to clipboard");
  }, [stats]);

  // Verify referral code
  const verifyReferralCode = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get(`/referrals/verify/${code}`);

      if (response.status === 200) {
        return response.data.data;
      } else {
        throw new Error("Invalid referral code");
      }
    } catch (err) {
      console.error("Error verifying referral code:", err);
      setError("Invalid referral code");
      toast.error("Invalid referral code");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin functions

  // Get all referrals (admin)
  const getAllReferrals = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters,
        });

        const response = await apiConfig.get(
          `/admin/referrals?${queryParams}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          return response.data.data;
        } else {
          throw new Error("Failed to fetch all referrals");
        }
      } catch (err) {
        console.error("Error fetching all referrals:", err);
        setError("Failed to fetch all referrals");
        toast.error("Failed to fetch all referrals");
        return { referrals: [], total: 0, pages: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get referral by ID
  const getReferralById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get(`/referrals/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data;
      } else {
        throw new Error("Failed to fetch referral");
      }
    } catch (err) {
      console.error("Error fetching referral:", err);
      setError("Failed to fetch referral");
      toast.error("Failed to fetch referral");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get referees by referrer ID
  const getRefereesByReferrerId = useCallback(async (referrerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get(
        `/referrals/referrer/${referrerId}/referees`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        return response.data.data;
      } else {
        throw new Error("Failed to fetch referees");
      }
    } catch (err) {
      console.error("Error fetching referees:", err);
      setError("Failed to fetch referees");
      toast.error("Failed to fetch referees");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get referral commission history
  const getReferralCommissionHistory = useCallback(
    async (referralId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiConfig.get(
          `/referrals/${referralId}/commissions`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          return response.data.data;
        } else {
          throw new Error("Failed to fetch commission history");
        }
      } catch (err) {
        console.error("Error fetching commission history:", err);
        setError("Failed to fetch commission history");
        toast.error("Failed to fetch commission history");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get referral activity log
  const getReferralActivityLog = useCallback(async (referralId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.get(
        `/referrals/${referralId}/activity`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        return response.data.data;
      } else {
        throw new Error("Failed to fetch activity log");
      }
    } catch (err) {
      console.error("Error fetching activity log:", err);
      setError("Failed to fetch activity log");
      toast.error("Failed to fetch activity log");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update referral status
  const updateReferralStatus = useCallback(
    async (referralId: string, status: ReferralStatus) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiConfig.patch(
          `/referrals/${referralId}/status`,
          { status },
          { withCredentials: true }
        );

        if (response.status !== 200) {
          throw new Error("Failed to update referral status");
        }
      } catch (err) {
        console.error("Error updating referral status:", err);
        setError("Failed to update referral status");
        toast.error("Failed to update referral status");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete referral
  const deleteReferral = useCallback(async (referralId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiConfig.delete(`/referrals/${referralId}`, {
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error("Failed to delete referral");
      }
    } catch (err) {
      console.error("Error deleting referral:", err);
      setError("Failed to delete referral");
      toast.error("Failed to delete referral");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await getUserReferrals();
      await getReferralStats();
      await getReferralCommissionRates();

      // Only fetch agent rank info if needed (could check user role here)
      try {
        await getAgentRankInfo();
      } catch (err) {
        // Silently fail as this might not be available for all users
        console.log("Agent rank info not available for this user");
      }
    };

    loadInitialData();
  }, [
    getUserReferrals,
    getReferralStats,
    getReferralCommissionRates,
    getAgentRankInfo,
  ]);

  const value = {
    // State
    referrals,
    isLoading,
    error,
    stats,
    earnings,
    commissionRates,
    agentRankInfo,

    // Actions
    getUserReferrals,
    getReferralStats,
    generateReferralLink,
    getReferralEarnings,
    getReferralCommissionRates,
    getAgentRankInfo,
    processReferral,
    copyReferralLink,
    verifyReferralCode,

    // Admin functions
    getReferralById,
    getRefereesByReferrerId,
    getReferralCommissionHistory,
    getReferralActivityLog,
    updateReferralStatus,
    deleteReferral,
    getAllReferrals,
  };

  return (
    <ReferralsContext.Provider value={value}>
      {children}
    </ReferralsContext.Provider>
  );
};
