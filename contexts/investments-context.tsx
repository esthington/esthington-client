"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { apiConfig, apiConfigFile } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useWallet } from "@/contexts/wallet-context";

// Enums
export enum InvestmentStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ReturnType {
  FIXED = "fixed",
  VARIABLE = "variable",
  PROFIT_SHARING = "profit_sharing",
}

export enum PayoutFrequency {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUALLY = "semi_annually",
  ANNUALLY = "annually",
  END_OF_TERM = "end_of_term",
}

export enum InvestmentCategory {
  REAL_ESTATE = "real_estate",
}

// Types
export type PropertyType = {
  _id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  thumbnail?: string;
  investmentId?: string;
};

export type InvestmentDetailsType = {
  _id: string;
  title: string;
  description: string;
  propertyId: PropertyType;
  location: string;
  minimumInvestment: number;
  targetAmount: number;
  raisedAmount: number;
  returnRate: number;
  returnType: ReturnType;
  durations: [];
  payoutFrequency: PayoutFrequency;
  investmentPlans: [];
  investmentPeriod: string;
  riskLevel: string;
  startDate: string;
  minInvestment: string;
  maxInvestors: string;
  endDate: string;
  status: InvestmentStatus;
  type: InvestmentCategory;
  featured: boolean;
  trending: boolean;
  investors: {
    userId: string;
    amount: number;
    date: string;
  }[];
  totalInvestors: number;
  documents: string[];
  amenities: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  percentageFunded: number;
  remainingAmount: number;
};

export type UserInvestmentType = {
  _id: string;
  userId: string;
  investmentId: string | InvestmentDetailsType;
  amount: number;
  status: InvestmentStatus;
  startDate: string;
  endDate: string;
  expectedReturn: number;
  actualReturn: number;
  nextPayoutDate?: string;
  payouts: {
    date: string;
    amount: number;
    status: "pending" | "paid" | "failed";
    transactionId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  totalPayouts: number;
  remainingPayouts: number;
};

export type InvestmentFilterType = {
  searchQuery: string;
  location: string;
  type: string;
  returnRateRange: [number, number];
  priceRange: [number, number];
  status?: InvestmentStatus;
  featured?: boolean;
  trending?: boolean;
  sortBy: string;
  viewMode: "grid" | "list";
};

interface InvestmentPlan {
  name: string;
  minAmount: string;
  returnRate: string;
}

// Context type
type InvestmentContextType = {
  // State
  investments: InvestmentDetailsType[];
  filteredInvestments: InvestmentDetailsType[];
  userInvestments: UserInvestmentType[];
  availableProperties: PropertyType[];
  selectedInvestment: InvestmentDetailsType | null;
  filters: InvestmentFilterType;

  // Filter actions
  setFilters: (filters: Partial<InvestmentFilterType>) => void;
  resetFilters: () => void;

  // Data fetching
  fetchInvestments: () => Promise<void>;
  fetchUserInvestments: () => Promise<void>;
  fetchAvailableProperties: () => Promise<void>;
  getInvestmentById: (id: string) => Promise<InvestmentDetailsType | null>;
  getProperties: (params?: {}) => Promise<any>; // Add this line

  // CRUD operations
  createInvestment: (formData: FormData) => Promise<string | null>;
  updateInvestment: (id: string, formData: FormData) => Promise<boolean>;
  deleteInvestment: (id: string) => Promise<boolean>;

  // Status operations
  toggleFeatured: (id: string) => Promise<boolean>;
  toggleTrending: (id: string) => Promise<boolean>;
  changeInvestmentStatus: (
    id: string,
    status: InvestmentStatus
  ) => Promise<boolean>;

  // User operations
  investInProperty: (
    investmentId: string,
    amount: number,
    note: string,
    selectedPlan: string,
    selectedDuration: string,
    calculatedReturns: object
  ) => Promise<boolean>;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
};

// Default filter values
const defaultFilters: InvestmentFilterType = {
  searchQuery: "",
  location: "all",
  type: "all",
  returnRateRange: [0, 50],
  priceRange: [0, 1000000000],
  sortBy: "trending",
  viewMode: "grid",
};

// Create context
const InvestmentContext = createContext<InvestmentContextType | undefined>(
  undefined
);

// Provider component
export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { fundWallet, refreshWalletData } = useWallet();

  // State
  const [investments, setInvestments] = useState<InvestmentDetailsType[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestmentType[]>(
    []
  );
  const [availableProperties, setAvailableProperties] = useState<
    PropertyType[]
  >([]);
  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentDetailsType | null>(null);
  const [filters, setFiltersState] =
    useState<InvestmentFilterType>(defaultFilters);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize with data
  useEffect(() => {
    fetchInvestments();
    if (user?._id) {
      fetchUserInvestments();
    }
  }, [user]);

  // Fetch all investments
  const fetchInvestments = async () => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get("/investments", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setInvestments(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch investments:", error);
      toast.error("Failed to load investments");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user investments
  const fetchUserInvestments = async () => {
    if (!user?._id) return;

    setIsLoading(true);
    try {
      const response = await apiConfig.get(`/users/${user._id}/investments`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserInvestments(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch user investments:", error);
      toast.error("Failed to load your investments");
    } finally {
      setIsLoading(false);
    }
  };

  // Add the getProperties function implementation
  // Add this function inside the InvestmentProvider component, before the return statement
  const getProperties = async (params?: {}): Promise<any> => {
    try {
      const response = await apiConfig.get("/properties/all", {
        withCredentials: true,
        params,
      });

      if (response.status === 200) {
        return {
          properties: response.data.data || [],
        };
      }
      return { properties: [] };
    } catch (error: any) {
      console.error("Error fetching properties:", error);

      return { properties: [] };
    }
  };

  // Update the fetchAvailableProperties function to use getProperties
  const fetchAvailableProperties = async () => {
    setIsLoading(true);
    try {
      // First try to get properties specifically available for investment
      let response = await apiConfig.get("/properties/all", {
        withCredentials: true,
      });

      if (
        response.status === 200 &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setAvailableProperties(response.data.data || []);
      } else {
        // If no specific endpoint or no data, fall back to getting all properties
        const result = await getProperties();
        setAvailableProperties(result.properties || []);
      }
    } catch (error) {
      console.error("Failed to fetch available properties:", error);

      // Try fallback to all properties
      try {
        const result = await getProperties();
        setAvailableProperties(result.properties || []);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setAvailableProperties([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get investment by ID
  const getInvestmentById = async (
    id: string
  ): Promise<InvestmentDetailsType | null> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get(`/investments/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const investment = response.data.data;
        setSelectedInvestment(investment);
        return investment;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch investment details:", error);
      toast.error("Failed to load investment details");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort investments based on filters
  const filteredInvestments = investments
    .filter((investment) => {
      // Filter by search query
      if (
        filters.searchQuery &&
        !investment.title
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !investment.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !(
          typeof investment.propertyId === "object" &&
          investment.propertyId.location
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase())
        )
      ) {
        return false;
      }

      // Filter by location
      if (
        filters.location !== "all" &&
        !(
          typeof investment.propertyId === "object" &&
          investment.propertyId.location.includes(filters.location)
        )
      ) {
        return false;
      }

      // Filter by type
      if (filters.type !== "all" && investment.type !== filters.type) {
        return false;
      }

      // Filter by return rate range
      if (
        investment.returnRate < filters.returnRateRange[0] ||
        investment.returnRate > filters.returnRateRange[1]
      ) {
        return false;
      }

      // Filter by price range
      if (
        investment.targetAmount < filters.priceRange[0] ||
        investment.targetAmount > filters.priceRange[1]
      ) {
        return false;
      }

      // Filter by status
      if (filters.status && investment.status !== filters.status) {
        return false;
      }

      // Filter by featured
      if (
        filters.featured !== undefined &&
        investment.featured !== filters.featured
      ) {
        return false;
      }

      // Filter by trending
      if (
        filters.trending !== undefined &&
        investment.trending !== filters.trending
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort based on sortBy option
      switch (filters.sortBy) {
        case "trending":
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "returnRate-high":
          return b.returnRate - a.returnRate;
        case "returnRate-low":
          return a.returnRate - b.returnRate;
        case "target-high":
          return b.targetAmount - a.targetAmount;
        case "target-low":
          return a.targetAmount - b.targetAmount;
        case "funded-high":
          return b.percentageFunded - a.percentageFunded;
        case "funded-low":
          return a.percentageFunded - b.percentageFunded;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  // Update filters
  const setFilters = (newFilters: Partial<InvestmentFilterType>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters to default
  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  // Create investment
  const createInvestment = async (
    formData: FormData
  ): Promise<string | null> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfigFile.post("/investments", formData, {
        withCredentials: true,
      });

      if (response.status === 201) {
        const newInvestment = response.data.data;
        setInvestments((prev) => [...prev, newInvestment]);

        // Remove the property from available properties
        if (newInvestment.propertyId) {
          const propertyId =
            typeof newInvestment.propertyId === "object"
              ? newInvestment.propertyId._id
              : newInvestment.propertyId;

          setAvailableProperties((prev) =>
            prev.filter((p) => p._id !== propertyId)
          );
        }

        toast.success("Investment created successfully");
        return newInvestment._id;
      }
      return null;
    } catch (error) {
      console.error("Failed to create investment:", error);
      toast.error("Failed to create investment");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update investment
  const updateInvestment = async (
    id: string,
    formData: FormData
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfigFile.put(`/investments/${id}`, formData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const updatedInvestment = response.data.data;
        setInvestments((prev) =>
          prev.map((investment) =>
            investment._id === id ? updatedInvestment : investment
          )
        );

        // Update selected investment if it's the one being edited
        if (selectedInvestment?._id === id) {
          setSelectedInvestment(updatedInvestment);
        }

        toast.success("Investment updated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update investment:", error);
      toast.error("Failed to update investment");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete investment
  const deleteInvestment = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const investment = investments.find((inv) => inv._id === id);
      if (!investment) return false;

      const response = await apiConfig.delete(`/investments/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setInvestments((prev) =>
          prev.filter((investment) => investment._id !== id)
        );

        // Clear selected investment if it's the one being deleted
        if (selectedInvestment?._id === id) {
          setSelectedInvestment(null);
        }

        // If the investment was linked to a property, make it available again
        if (
          typeof investment.propertyId === "object" &&
          investment.propertyId?._id
        ) {
          const propertyId = investment.propertyId._id;

          // Fetch the property details to add back to available properties
          const propertyResponse = await apiConfig.get(
            `/properties/${propertyId}`,
            {
              withCredentials: true,
            }
          );

          if (propertyResponse.status === 200) {
            const property = propertyResponse.data.data;
            setAvailableProperties((prev) => [...prev, property]);
          }
        }

        toast.success("Investment deleted successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast.error("Failed to delete investment");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string): Promise<boolean> => {
    try {
      const investment = investments.find((inv) => inv._id === id);
      if (!investment) return false;

      const response = await apiConfig.patch(
        `/investments/${id}/featured`,
        { featured: !investment.featured },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setInvestments((prev) =>
          prev.map((inv) =>
            inv._id === id ? { ...inv, featured: !inv.featured } : inv
          )
        );

        // Update selected investment if it's the one being modified
        if (selectedInvestment?._id === id) {
          setSelectedInvestment((prev) =>
            prev ? { ...prev, featured: !prev.featured } : null
          );
        }

        toast.success(
          investment.featured
            ? "Investment removed from featured"
            : "Investment marked as featured"
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update featured status:", error);
      toast.error("Failed to update featured status");
      return false;
    }
  };

  // Toggle trending status
  const toggleTrending = async (id: string): Promise<boolean> => {
    try {
      const investment = investments.find((inv) => inv._id === id);
      if (!investment) return false;

      const response = await apiConfig.patch(
        `/investments/${id}/trending`,
        { trending: !investment.trending },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setInvestments((prev) =>
          prev.map((inv) =>
            inv._id === id ? { ...inv, trending: !inv.trending } : inv
          )
        );

        // Update selected investment if it's the one being modified
        if (selectedInvestment?._id === id) {
          setSelectedInvestment((prev) =>
            prev ? { ...prev, trending: !prev.trending } : null
          );
        }

        toast.success(
          investment.trending
            ? "Investment removed from trending"
            : "Investment marked as trending"
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update trending status:", error);
      toast.error("Failed to update trending status");
      return false;
    }
  };

  // Change investment status
  const changeInvestmentStatus = async (
    id: string,
    status: InvestmentStatus
  ): Promise<boolean> => {
    try {
      const response = await apiConfig.patch(
        `/investments/${id}/status`,
        { status },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setInvestments((prev) =>
          prev.map((inv) => (inv._id === id ? { ...inv, status } : inv))
        );

        // Update selected investment if it's the one being modified
        if (selectedInvestment?._id === id) {
          setSelectedInvestment((prev) => (prev ? { ...prev, status } : null));
        }

        const statusText =
          status === InvestmentStatus.ACTIVE
            ? "activated"
            : status === InvestmentStatus.PENDING
            ? "set to pending"
            : status === InvestmentStatus.COMPLETED
            ? "marked as completed"
            : status === InvestmentStatus.DRAFT
            ? "saved as draft"
            : "cancelled";

        toast.success(`Investment has been ${statusText}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update investment status:", error);
      toast.error("Failed to update investment status");
      return false;
    }
  };

  // Invest in property
  const investInProperty = async (
    investmentId: string,
    amount: number,
    selectedPlan: string,
    selectedDuration: string,
    notes: string,
    calculatedReturns: object
  ): Promise<boolean> => {
    if (!user?._id) {
      toast.error("You must be logged in to invest");
      return false;
    }

    // setIsSubmitting(true);
    try {
      // First check if the investment exists and is active
      const investment = investments.find((inv) => inv._id === investmentId);
      if (!investment) {
        throw new Error("Investment not found");
      }

      if (investment.status !== InvestmentStatus.ACTIVE) {
        throw new Error("This investment is not currently active");
      }

      if (amount < investment.minimumInvestment) {
        throw new Error(
          `Minimum investment amount is ${investment.minimumInvestment}`
        );
      }

      // // Create user investment record
      const response = await apiConfig.post(
        `/investments/${investmentId}/invest`,
        {
          userId: user._id,
          amount,
          selectedPlan,
          selectedDuration,
          notes,
          calculatedReturns,
        },
        {
          withCredentials: true,
        }
      );

      const userInvestment = response.data.data;

      // Update investments list with new funding amount
      setInvestments((prev) =>
        prev.map((inv) => {
          if (inv._id === investmentId) {
            const newRaisedAmount = inv.raisedAmount + amount;
            const newPercentageFunded = Math.min(
              100,
              (newRaisedAmount / inv.targetAmount) * 100
            );

            return {
              ...inv,
              raisedAmount: newRaisedAmount,
              totalInvestors: inv.totalInvestors + 1,
              percentageFunded: newPercentageFunded,
              investors: [
                ...inv.investors,
                {
                  userId: user._id,
                  amount,
                  date: new Date().toISOString(),
                },
              ],
            };
          }
          return inv;
        })
      );

      // Add to user investments
      setUserInvestments((prev) => [...prev, userInvestment]);

      // Refresh wallet data
      await refreshWalletData();

      toast.success("Investment successful! Thank you for investing.");

      return false;
    } catch (error: any) {
      console.error("Error investing in property:", error);
      toast.error(error.message || "Failed to process your investment");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace your API call temporarily with this:
  // const investInProperty = async (...args: any) => {
  //   // setIsSubmitting(true);

  //   // Simulate API call without actually making one
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   // setIsSubmitting(false);
  //   return false;
  // };

  // Include getProperties in the context value
  const value = {
    // State
    investments,
    filteredInvestments,
    userInvestments,
    availableProperties,
    selectedInvestment,
    filters,

    // Filter actions
    setFilters,
    resetFilters,

    // Data fetching
    fetchInvestments,
    fetchUserInvestments,
    fetchAvailableProperties,
    getInvestmentById,
    getProperties, // Add this line

    // CRUD operations
    createInvestment,
    updateInvestment,
    deleteInvestment,

    // Status operations
    toggleFeatured,
    toggleTrending,
    changeInvestmentStatus,

    // User operations
    investInProperty,

    // Loading states
    isLoading,
    isSubmitting,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}

// Custom hook to use the context
export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestment must be used within an InvestmentProvider");
  }
  return context;
}
