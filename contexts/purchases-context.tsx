"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { successToast, errorToast } from "@/lib/toast";
import { useWallet } from "@/contexts/wallet-context";

// Types for purchases
export type PurchaseStatus =
  | "completed"
  | "pending"
  | "processing"
  | "failed"
  | "refunded";

export type Purchase = {
  id: string;
  landId: string;
  landTitle: string;
  landLocation: string;
  landType: string;
  landImage: string;
  purchaseAmount: number;
  purchaseDate: string;
  status: PurchaseStatus;
  documentUrl?: string;
  size: string;
  transactionId?: string;
  paymentMethod: "card" | "bank_transfer" | "wallet";
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    companyId?: string;
  };
};

// Context type
export type PurchasesContextType = {
  // Purchases
  purchases: Purchase[];
  filteredPurchases: Purchase[];
  filters: {
    status: string;
    type: string;
    searchQuery: string;
    dateRange: [Date | null, Date | null];
  };
  isLoading: boolean;
  isSubmitting: boolean;

  // CRUD operations
  getPurchase: (id: string) => Purchase | undefined;
  createPurchase: (
    purchase: Omit<Purchase, "id" | "purchaseDate" | "status">
  ) => Promise<string>;
  updatePurchase: (id: string, data: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;

  // Filter operations
  setFilters: (filters: Partial<PurchasesContextType["filters"]>) => void;
  resetFilters: () => void;

  // Document operations
  downloadDocument: (id: string) => Promise<void>;
  uploadDocument: (id: string, file: File) => Promise<void>;

  // Status operations
  completePurchase: (id: string) => Promise<void>;
  cancelPurchase: (id: string) => Promise<void>;
  refundPurchase: (id: string) => Promise<void>;
};

// Default filters
const defaultFilters = {
  status: "all",
  type: "all",
  searchQuery: "",
  dateRange: [null, null] as [Date | null, Date | null],
};

// Mock purchases
const mockPurchases: Purchase[] = [
  {
    id: "1",
    landId: "1",
    landTitle: "Premium Land in Lekki Phase 1",
    landLocation: "Lekki Phase 1, Lagos",
    landType: "Residential",
    landImage:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D",
    purchaseAmount: 75000000,
    purchaseDate: "2023-05-15",
    status: "completed",
    documentUrl: "#",
    size: "1000 sqm",
    paymentMethod: "card",
    buyer: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    seller: {
      id: "seller1",
      name: "ABC Properties",
      companyId: "company1",
    },
  },
  {
    id: "2",
    landId: "3",
    landTitle: "Waterfront Land in Banana Island",
    landLocation: "Banana Island, Lagos",
    landType: "Residential",
    landImage:
      "https://images.unsplash.com/photo-1502787530428-11cf61d6ba18?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhbmR8ZW58MHx8MHx8fDA%3D",
    purchaseAmount: 250000000,
    purchaseDate: "2023-06-10",
    status: "completed",
    documentUrl: "#",
    size: "1500 sqm",
    paymentMethod: "bank_transfer",
    buyer: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    seller: {
      id: "seller3",
      name: "XYZ Realtors",
      companyId: "company3",
    },
  },
  {
    id: "3",
    landId: "4",
    landTitle: "Industrial Land in Agbara",
    landLocation: "Agbara, Ogun State",
    landType: "Industrial",
    landImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhbmR8ZW58MHx8MHx8fDA%3D",
    purchaseAmount: 85000000,
    purchaseDate: "2023-07-01",
    status: "pending",
    size: "5000 sqm",
    paymentMethod: "wallet",
    buyer: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    seller: {
      id: "seller4",
      name: "Industrial Estates Ltd",
      companyId: "company2",
    },
  },
];

// Create context
const PurchasesContext = createContext<PurchasesContextType | undefined>(
  undefined
);

// Provider component
export function PurchasesProvider({ children }: { children: ReactNode }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filters, setFiltersState] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { balance, withdrawMoney } = useWallet();

  // Initialize purchases
  useEffect(() => {
    const initPurchases = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        setPurchases(mockPurchases);
      } catch (error) {
        console.error("Failed to initialize purchases:", error);
        errorToast("Failed to load purchases");
      } finally {
        setIsLoading(false);
      }
    };

    initPurchases();
  }, []);

  // Filter purchases based on filters
  const filteredPurchases = purchases.filter((purchase) => {
    // Filter by search query
    if (
      filters.searchQuery &&
      !purchase.landTitle
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) &&
      !purchase.landLocation
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by status
    if (filters.status !== "all" && purchase.status !== filters.status) {
      return false;
    }

    // Filter by type
    if (filters.type !== "all" && purchase.landType !== filters.type) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const purchaseDate = new Date(purchase.purchaseDate);
      const startDate = filters.dateRange[0];
      const endDate = filters.dateRange[1];

      if (purchaseDate < startDate || purchaseDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // Set filters
  const setFilters = (newFilters: Partial<typeof filters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  // Get purchase by ID
  const getPurchase = (id: string) =>
    purchases.find((purchase) => purchase.id === id);

  // Create purchase
  const createPurchase = async (
    purchase: Omit<Purchase, "id" | "purchaseDate" | "status">
  ): Promise<string> => {
    setIsSubmitting(true);
    try {
      if (balance < purchase.purchaseAmount) {
        throw new Error("Insufficient balance");
      }

      await withdrawMoney(purchase.purchaseAmount, "default-bank-account-id");

      // In a real app, this would be an API call
      const newPurchase: Purchase = {
        ...purchase,
        id: `purchase-${Date.now()}`,
        purchaseDate: new Date().toISOString(),
        status: "pending",
      };

      setPurchases((prev) => [...prev, newPurchase]);
      successToast("Purchase created successfully");

      return newPurchase.id;
    } catch (error: any) {
      console.error("Failed to create purchase:", error);
      errorToast(error.message || "Failed to create purchase");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update purchase
  const updatePurchase = async (id: string, data: Partial<Purchase>) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      setPurchases((prev) =>
        prev.map((purchase) =>
          purchase.id === id ? { ...purchase, ...data } : purchase
        )
      );
      successToast("Purchase updated successfully");
    } catch (error) {
      console.error("Failed to update purchase:", error);
      errorToast("Failed to update purchase");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete purchase
  const deletePurchase = async (id: string) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      setPurchases((prev) => prev.filter((purchase) => purchase.id !== id));
      successToast("Purchase deleted successfully");
    } catch (error) {
      console.error("Failed to delete purchase:", error);
      errorToast("Failed to delete purchase");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download document
  const downloadDocument = async (id: string) => {
    try {
      // In a real app, this would be an API call to download the document
      const purchase = purchases.find((p) => p.id === id);

      if (!purchase || !purchase.documentUrl) {
        throw new Error("Document not found");
      }

      // Simulate download
      window.open(purchase.documentUrl, "_blank");
      successToast("Document download started");
    } catch (error) {
      console.error("Failed to download document:", error);
      errorToast("Failed to download document");
      throw error;
    }
  };

  // Upload document
  const uploadDocument = async (id: string, file: File) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call to upload the document
      // For now, we'll just simulate a successful upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update the purchase with the document URL
      setPurchases((prev) =>
        prev.map((purchase) =>
          purchase.id === id
            ? { ...purchase, documentUrl: URL.createObjectURL(file) }
            : purchase
        )
      );

      successToast("Document uploaded successfully");
    } catch (error) {
      console.error("Failed to upload document:", error);
      errorToast("Failed to upload document");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete purchase
  const completePurchase = async (id: string) => {
    return updatePurchase(id, { status: "completed" });
  };

  // Cancel purchase
  const cancelPurchase = async (id: string) => {
    return updatePurchase(id, { status: "failed" });
  };

  // Refund purchase
  const refundPurchase = async (id: string) => {
    return updatePurchase(id, { status: "refunded" });
  };

  const value = {
    purchases,
    filteredPurchases,
    filters,
    isLoading,
    isSubmitting,
    getPurchase,
    createPurchase,
    updatePurchase,
    deletePurchase,
    setFilters,
    resetFilters,
    downloadDocument,
    uploadDocument,
    completePurchase,
    cancelPurchase,
    refundPurchase,
  };

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
}

// Custom hook to use the context
export function usePurchases() {
  const context = useContext(PurchasesContext);
  if (context === undefined) {
    throw new Error("usePurchases must be used within a PurchasesProvider");
  }
  return context;
}
