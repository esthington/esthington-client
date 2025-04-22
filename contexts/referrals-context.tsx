"use client";

import type React from "react";
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

// Types based on the MongoDB schema
export interface Referral {
  _id: string;
  referrer: User;
  referred: User;
  status: "pending" | "active" | "inactive";
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode?: string;
  agentRank?: "Bronze" | "Silver" | "Gold" | "Platinum";
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

// Update the ReferralStats interface to support role-specific referral links
export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
  referralLink: string | null;
  buyerReferralLink: string | null;
  agentReferralLink: string | null;
}

export interface CommissionRates {
  [key: string]: {
    investment: number;
    property: number;
  };
}

export interface AgentRankInfo {
  currentRank: "Bronze" | "Silver" | "Gold" | "Platinum";
  nextRank: "Bronze" | "Silver" | "Gold" | "Platinum";
  progress: number;
  requiredReferrals: number;
  currentReferrals: number;
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
  generateReferralLink: (role?: "buyer" | "agent") => Promise<string | null>;
  getReferralEarnings: (startDate?: string, endDate?: string) => Promise<void>;
  getReferralCommissionRates: () => Promise<void>;
  getAgentRankInfo: () => Promise<void>;
  processReferral: (
    referredUserId: string,
    transactionType: string,
    amount: number
  ) => Promise<void>;
  copyReferralLink: (role?: "buyer" | "agent") => void;
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

export const ReferralsProvider: React.FC<ReferralsProviderProps> = ({
  children,
}) => {
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

  // Mock API calls - in a real app, these would call your backend API
  const getUserReferrals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app: const response = await fetch('/api/referrals')
      // Mock data based on the controller
      const mockReferrals: Referral[] = [
        {
          _id: "ref1",
          referrer: {
            _id: "user1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          },
          referred: {
            _id: "user2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
          },
          status: "active",
          earnings: 250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "ref2",
          referrer: {
            _id: "user1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          },
          referred: {
            _id: "user3",
            firstName: "Bob",
            lastName: "Johnson",
            email: "bob@example.com",
          },
          status: "pending",
          earnings: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setReferrals(mockReferrals);
    } catch (err) {
      setError("Failed to fetch referrals");
      toast.error("Failed to fetch referrals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update the getReferralStats function to include role-specific links
  const getReferralStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app: const response = await fetch('/api/referrals/stats')
      // Mock data based on the controller
      const mockStats: ReferralStats = {
        totalReferrals: 24,
        activeReferrals: 18,
        totalEarnings: 2450,
        pendingEarnings: 350,
        conversionRate: 75,
        referralLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/register?ref=abc123`,
        buyerReferralLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/buyer/signup?ref=buyer123`,
        agentReferralLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/agent/signup?ref=agent456`,
      };

      setStats(mockStats);
    } catch (err) {
      setError("Failed to fetch referral stats");
      toast.error("Failed to fetch referral stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update the generateReferralLink function to support role-specific links
  const generateReferralLink = useCallback(
    async (role: "buyer" | "agent" = "agent") => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app: const response = await fetch('/api/referrals/generate-link', { method: 'POST', body: JSON.stringify({ role }) })
        // Mock data based on the controller
        const referralCode = `${role}${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        const referralLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${role}/signup?ref=${referralCode}`;

        // Update stats with new referral link
        if (stats) {
          setStats({
            ...stats,
            referralLink, // Keep this for backward compatibility
            ...(role === "buyer" ? { buyerReferralLink: referralLink } : {}),
            ...(role === "agent" ? { agentReferralLink: referralLink } : {}),
          });
        }

        toast.success(
          `${
            role.charAt(0).toUpperCase() + role.slice(1)
          } referral link generated successfully`
        );
        return referralLink;
      } catch (err) {
        setError(`Failed to generate ${role} referral link`);
        toast.error(`Failed to generate ${role} referral link`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [stats]
  );

  const getReferralEarnings = useCallback(
    async (startDate?: string, endDate?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app:
        // let url = '/api/referrals/earnings'
        // if (startDate && endDate) {
        //   url += `?startDate=${startDate}&endDate=${endDate}`
        // }
        // const response = await fetch(url)

        // Mock data based on the controller
        const mockEarnings: Transaction[] = [
          {
            _id: "trans1",
            user: "user1",
            type: "referral",
            amount: 150,
            status: "completed",
            description: "Referral commission for investment purchase by user2",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "trans2",
            user: "user1",
            type: "referral",
            amount: 100,
            status: "completed",
            description: "Referral commission for property purchase by user3",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
          {
            _id: "trans3",
            user: "user1",
            type: "referral",
            amount: 75,
            status: "pending",
            description: "Referral commission for investment purchase by user4",
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          },
        ];

        setEarnings(mockEarnings);
      } catch (err) {
        setError("Failed to fetch referral earnings");
        toast.error("Failed to fetch referral earnings");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getReferralCommissionRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app: const response = await fetch('/api/referrals/commission-rates')
      // Mock data based on the controller
      const mockCommissionRates: CommissionRates = {
        Bronze: {
          investment: 2.5, // 2.5% commission on investments
          property: 1.0, // 1% commission on property purchases
        },
        Silver: {
          investment: 3.5,
          property: 1.5,
        },
        Gold: {
          investment: 5.0,
          property: 2.0,
        },
        Platinum: {
          investment: 7.5,
          property: 3.0,
        },
      };

      setCommissionRates(mockCommissionRates);
    } catch (err) {
      setError("Failed to fetch commission rates");
      toast.error("Failed to fetch commission rates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAgentRankInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app: const response = await fetch('/api/referrals/agent-rank')
      // Mock data based on the controller
      const mockAgentRankInfo: AgentRankInfo = {
        currentRank: "Silver",
        nextRank: "Gold",
        progress: 60,
        requiredReferrals: 25,
        currentReferrals: 15,
      };

      setAgentRankInfo(mockAgentRankInfo);
    } catch (err) {
      setError("Failed to fetch agent rank information");
      toast.error("Failed to fetch agent rank information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processReferral = useCallback(
    async (referredUserId: string, transactionType: string, amount: number) => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app:
        // const response = await fetch('/api/referrals/process', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ referredUserId, transactionType, amount })
        // })

        // Mock processing
        const commission =
          transactionType === "investment"
            ? amount * 0.05 // 5% for investment
            : amount * 0.02; // 2% for property

        // Update referrals to set status to active
        setReferrals((prevReferrals) =>
          prevReferrals.map((ref) =>
            ref.referred._id === referredUserId
              ? { ...ref, status: "active" }
              : ref
          )
        );

        // Add new transaction to earnings
        const newTransaction: Transaction = {
          _id: `trans${Date.now()}`,
          user: "user1",
          type: "referral",
          amount: commission,
          status: "completed",
          description: `Referral commission for ${transactionType} purchase by ${referredUserId}`,
          createdAt: new Date().toISOString(),
        };

        setEarnings((prevEarnings) => [newTransaction, ...prevEarnings]);

        toast.success(
          `Referral processed successfully. Commission: $${commission}`
        );
      } catch (err) {
        setError("Failed to process referral");
        toast.error("Failed to process referral");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update the copyReferralLink function to support role-specific links
  const copyReferralLink = useCallback(
    (role?: "buyer" | "agent") => {
      if (!stats) {
        toast.error("No referral link available");
        return;
      }

      let linkToCopy = stats.referralLink;

      if (role === "buyer" && stats.buyerReferralLink) {
        linkToCopy = stats.buyerReferralLink;
      } else if (role === "agent" && stats.agentReferralLink) {
        linkToCopy = stats.agentReferralLink;
      }

      if (linkToCopy) {
        navigator.clipboard.writeText(linkToCopy);
        toast.success(
          `${
            role ? role.charAt(0).toUpperCase() + role.slice(1) : "Referral"
          } link copied to clipboard`
        );
      } else {
        toast.error("No referral link available");
      }
    },
    [stats]
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await getUserReferrals();
      await getReferralStats();
      await getReferralCommissionRates();
      await getAgentRankInfo();
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
  };

  return (
    <ReferralsContext.Provider value={value}>
      {children}
    </ReferralsContext.Provider>
  );
};
