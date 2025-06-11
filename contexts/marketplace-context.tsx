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
  // CRUD operations
  getListing: (id: string) => Promise<MarketplaceListingType | null>;
  addListing: (formData: FormData) => Promise<string | null>;
  updateListing: (id: string, formData: FormData) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;

  // Buyer operations
  buyProperty: (listingId: string) => Promise<boolean>;
  updateQuantity: (listingId: string, quantity: number) => Promise<boolean>;

  // Agent operations
  getAgentListings: () => Promise<MarketplaceListingType[]>;
  featureListing: (id: string, featured: boolean) => Promise<boolean>;

  // Admin operations
  approveListing: (id: string) => Promise<boolean>;
  rejectListing: (id: string, reason: string) => Promise<boolean>;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
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

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize with data
  useEffect(() => {
    fetchListings();
  }, []);

  // Fetch listings from API
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get("/marketplace/listings", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setListings(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace listings:", error);
      toast.error("Failed to load marketplace listings");
    } finally {
      setIsLoading(false);
    }
  };

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
  const setFilters = (newFilters: Partial<MarketplaceFilterType>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters to default
  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

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
  const buyProperty = async (listingId: string): Promise<boolean> => {

    try {
      const response = await apiConfig.post(
        `/marketplace/listings/${listingId}/purchase/initiate`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("hitting purchase endpoint", response);

      if (response.status === 200) {
        // Update the listing status in the local state
        setListings((prev) =>
          prev.map((listing) => {
            if (listing.id === listingId) {
              const updatedQuantity = listing.quantity - 1;
              return {
                ...listing,
                quantity: updatedQuantity,
                status: updatedQuantity <= 0 ? "out_of_stock" : listing.status,
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
  };

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

  const value = {
    // Listings
    listings,
    filteredListings,
    filters,
    setFilters,
    resetFilters,

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
