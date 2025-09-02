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
import { apiConfig, apiConfigFile } from "@/lib/api";

// Add missing types for user purchases
export interface MarketplacePlot {
  _id: string;
  plotId: string;
  price: number;
  soldDate?: string;
  quantity: number;
  deliveryStatus?: string;
  trackingNumber?: string;
}

export interface UserPurchase {
  _id: string;
  property: {
    _id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    status: string;
    thumbnail?: string;
    planFile?: string;
    documents?: string[];
    plotSize: string;
  };
  purchasedPlots: MarketplacePlot[];
  totalAmount: number;
  companyName?: string;
  companyLogo?: string;
}

// Types for marketplace listings
export type MarketplaceListingType = {
  id: string;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  thumbnail: string;
  quantity: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  location: string;
  type: string;
  size?: string;
  status: "available" | "pending" | "sold" | "out_of_stock";
  featured: boolean;
  trending?: boolean;
  images: string[];
  features: string[];
  documents: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
  companyId: {
    _id: string;
  };
  creatorId: string;
  categories?: string[];
  tags?: string[];
  isDigital?: boolean;
  downloadUrl?: string;
  variations?: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      price: number;
      discountedPrice?: number;
      quantity: number;
      sku?: string;
    }>;
  }>;
};

export type MarketplaceFilterType = {
  searchQuery: string;
  location: string;
  type: string;
  priceRange: [number, number];
  sortBy: string;
  viewMode: "grid" | "list";
  category?: string;
  inStock?: boolean;
};

// Context type
type MarketplaceContextType = {
  // Listings
  listings: MarketplaceListingType[];
  filteredListings: MarketplaceListingType[];
  filters: MarketplaceFilterType;
  setFilters: (filters: Partial<MarketplaceFilterType>) => void;
  resetFilters: () => void;
  getCompanies: () => Promise<any[]>;

  // User purchases
  userPurchases: UserPurchase[];
  isLoading: boolean;
  fetchUserPurchases: () => Promise<void>;
  downloadDocument: (
    propertyId: string,
    docType: string,
    docUrl: string
  ) => Promise<void>;

  // CRUD operations
  getListing: (id: string) => Promise<MarketplaceListingType | null>;
  addListing: (formData: FormData) => Promise<string | null>;
  updateListing: (id: string, formData: FormData) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;

  // Buyer operations
  buyProperty: (listingId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (listingId: string, quantity: number) => Promise<boolean>;

  // Agent operations
  getAgentListings: () => Promise<MarketplaceListingType[]>;
  featureListing: (id: string, featured: boolean) => Promise<boolean>;

  // Admin operations
  approveListing: (id: string) => Promise<boolean>;
  rejectListing: (id: string, reason: string) => Promise<boolean>;

  // Loading states
  isSubmitting: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => Promise<void>;
};

// Default filter values
const defaultFilters: MarketplaceFilterType = {
  searchQuery: "",
  location: "all",
  type: "all",
  priceRange: [0, 100000000000],
  sortBy: "trending",
  viewMode: "grid",
  inStock: true,
};

// Create context
const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined
);

// Provider component
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  // State for listings
  const [listings, setListings] = useState<MarketplaceListingType[]>([]);
  const [filters, setFiltersState] =
    useState<MarketplaceFilterType>(defaultFilters);

  // State for user purchases
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(100);

  // Initialize with data
  useEffect(() => {
    fetchListings();
  }, []);

  // Refetch data when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchListings();
    }
  }, [currentPage]);

  // Fetch listings from API
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get("/marketplace/listings", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        setListings(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace listings:", error);
      toast.error("Failed to load marketplace listings");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Fetch user purchases
  const fetchUserPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get("/marketplace/purchases", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserPurchases(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch user purchases:", error);
      toast.error("Failed to load your purchases");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Download document
  const downloadDocument = useCallback(
    async (propertyId: string, docType: string, docUrl: string) => {
      try {
        // Create a temporary link to download the document
        const link = document.createElement("a");
        link.href = docUrl;
        link.download = `${docType}-${propertyId}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Document download started");
      } catch (error) {
        console.error("Failed to download document:", error);
        toast.error("Failed to download document");
      }
    },
    []
  );

  // Filter and sort listings based on filters
  const filteredListings = listings
    .filter((listing) => {
      // Filter by search query
      if (
        filters.searchQuery &&
        !listing.title
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !listing.location
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !listing.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by location
      if (
        filters.location !== "all" &&
        !listing.location.includes(filters.location)
      ) {
        return false;
      }

      // Filter by type
      if (filters.type !== "all" && listing.type !== filters.type) {
        return false;
      }

      // Filter by price range
      const effectivePrice = listing.discountedPrice || listing.price;
      if (
        effectivePrice < filters.priceRange[0] ||
        effectivePrice > filters.priceRange[1]
      ) {
        return false;
      }

      // Filter by category
      if (
        filters.category &&
        (!listing.categories || !listing.categories.includes(filters.category))
      ) {
        return false;
      }

      // Filter by stock status
      if (
        filters.inStock &&
        (listing.quantity <= 0 || listing.status === "out_of_stock")
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
        case "price-high":
          return (
            (b.discountedPrice || b.price) - (a.discountedPrice || a.price)
          );
        case "price-low":
          return (
            (a.discountedPrice || a.price) - (b.discountedPrice || b.price)
          );
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "discount":
          const aDiscount = a.discountedPrice
            ? ((a.price - a.discountedPrice) / a.price) * 100
            : 0;
          const bDiscount = b.discountedPrice
            ? ((b.price - b.discountedPrice) / b.price) * 100
            : 0;
          return bDiscount - aDiscount;
        default:
          return 0;
      }
    });

  // Update filters
  const setFilters = useCallback(
    (newFilters: Partial<MarketplaceFilterType>) => {
      setFiltersState((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Get a single listing by ID
  const getListing = async (
    id: string
  ): Promise<MarketplaceListingType | null> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get(`/marketplace/listings/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch listing:", error);
      toast.error("Failed to load listing details");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new listing
  const addListing = async (formData: FormData): Promise<string | null> => {
    setIsSubmitting(true);
    try {
      console.log("FormData:", formData.get("data"));
      const response = await apiConfigFile.post(
        "/marketplace/listings",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        const newListing = response.data.data;
        setListings((prev) => [...prev, newListing]);
        toast.success("Listing created successfully");
        return newListing.id;
      }
      return null;
    } catch (error) {
      console.error("Failed to create listing:", error);
      toast.error("Failed to create listing");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing listing
  const updateListing = async (
    id: string,
    formData: FormData
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfigFile.put(
        `/marketplace/listings/${id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const updatedListing = response.data.data;
        setListings((prev) =>
          prev.map((listing) => (listing.id === id ? updatedListing : listing))
        );
        toast.success("Listing updated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update listing:", error);
      toast.error("Failed to update listing");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a listing
  const deleteListing = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.delete(`/marketplace/listings/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setListings((prev) => prev.filter((listing) => listing.id !== id));
        toast.success("Listing deleted successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete listing:", error);
      toast.error("Failed to delete listing");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buy a property
  const buyProperty = useCallback(
    async (listingId: string, quantity: number): Promise<boolean> => {
      try {
        const response = await apiConfig.post(
          `/marketplace/listings/${listingId}/purchase/initiate`,
          { quantity },
          {
            withCredentials: true,
          }
        );

        console.log("hitting purchase endpoint", response);

        if (response.status === 201) {
          // Update the listing status in the local state
          setListings((prev) =>
            prev.map((listing) => {
              if (listing.id === listingId) {
                const updatedQuantity = listing.quantity - 1;
                return {
                  ...listing,
                  quantity: updatedQuantity,
                  status:
                    updatedQuantity <= 0 ? "out_of_stock" : listing.status,
                  updatedAt: new Date().toISOString(),
                };
              }
              return listing;
            })
          );
          toast.success("Item purchased successfully");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to purchase item:", error);
        toast.error("Failed to complete purchase");
        return false;
      }
    },
    []
  );

  // Update quantity
  const updateQuantity = async (
    listingId: string,
    quantity: number
  ): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      const response = await apiConfig.patch(
        `/marketplace/listings/${listingId}/quantity`,
        { quantity },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setListings((prev) =>
          prev.map((listing) => {
            if (listing.id === listingId) {
              return {
                ...listing,
                quantity,
                status: quantity <= 0 ? "out_of_stock" : "available",
                updatedAt: new Date().toISOString(),
              };
            }
            return listing;
          })
        );
        toast.success("Inventory updated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update inventory:", error);
      toast.error("Failed to update inventory");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get listings for the current agent
  const getAgentListings = async (): Promise<MarketplaceListingType[]> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get("/marketplace/listings/agent", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch agent listings:", error);
      toast.error("Failed to load your listings");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Feature or unfeature a listing
  const featureListing = async (
    id: string,
    featured: boolean
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.patch(
        `/marketplace/listings/${id}/feature`,
        { featured },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === id
              ? { ...listing, featured, updatedAt: new Date().toISOString() }
              : listing
          )
        );
        toast.success(
          featured
            ? "Listing featured successfully"
            : "Listing unfeatured successfully"
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update listing feature status:", error);
      toast.error("Failed to update listing");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get companies
  const getCompanies = async (): Promise<any[]> => {
    try {
      const response = await apiConfig.get("/companies", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      return [];
    }
  };

  // Approve a listing (admin only)
  const approveListing = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.patch(
        `/marketplace/listings/${id}/approve`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === id
              ? {
                  ...listing,
                  status: "available",
                  updatedAt: new Date().toISOString(),
                }
              : listing
          )
        );
        toast.success("Listing approved successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to approve listing:", error);
      toast.error("Failed to approve listing");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject a listing (admin only)
  const rejectListing = async (
    id: string,
    reason: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.patch(
        `/marketplace/listings/${id}/reject`,
        { reason },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setListings((prev) => prev.filter((listing) => listing.id !== id));
        toast.success("Listing rejected successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to reject listing:", error);
      toast.error("Failed to reject listing");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page change
  const handlePageChange = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  const value = {
    // Listings
    listings,
    filteredListings,
    filters,
    setFilters,
    resetFilters,

    // User purchases
    userPurchases,
    fetchUserPurchases,
    downloadDocument,

    // CRUD operations
    getListing,
    addListing,
    updateListing,
    deleteListing,

    // Buyer operations
    buyProperty,
    updateQuantity,

    // Agent operations
    getAgentListings,
    featureListing,
    getCompanies,

    // Admin operations
    approveListing,
    rejectListing,

    // Loading states
    isLoading,
    isSubmitting,

    // Pagination
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    handlePageChange,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

// Custom hook to use the context
export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
