"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for marketplace
export type MarketplaceListingType = {
  id: string
  title: string
  description: string
  price: number
  location: string
  type: string
  size: string
  status: "available" | "pending" | "sold"
  featured: boolean
  trending: boolean
  images: string[]
  features: string[]
  createdAt: string
  updatedAt: string
  seller: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
  }
  investmentDetails?: {
    minInvestment: number
    expectedReturn: number
    duration: number
    maxInvestors: number
    investmentType: "fractional" | "rental" | "development" | "flip"
    currentInvestors?: number
    totalInvested?: number
  }
  companyId?: string
}

export type MarketplaceFilterType = {
  searchQuery: string
  location: string
  type: string
  priceRange: [number, number]
  sortBy: string
  viewMode: "grid" | "list"
}

// Context type
type MarketplaceContextType = {
  // Listings
  listings: MarketplaceListingType[]
  filteredListings: MarketplaceListingType[]
  filters: MarketplaceFilterType
  setFilters: (filters: Partial<MarketplaceFilterType>) => void
  resetFilters: () => void

  // CRUD operations
  getListing: (id: string) => MarketplaceListingType | undefined
  addListing: (listing: Omit<MarketplaceListingType, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateListing: (id: string, data: Partial<MarketplaceListingType>) => Promise<void>
  deleteListing: (id: string) => Promise<void>

  // Buyer operations
  buyProperty: (listingId: string, buyerId: string) => Promise<void>
  investInProperty: (listingId: string, investorId: string, amount: number) => Promise<void>

  // Agent operations
  getAgentListings: (agentId: string) => MarketplaceListingType[]
  featureListing: (id: string, featured: boolean) => Promise<void>

  // Admin operations
  approveListing: (id: string) => Promise<void>
  rejectListing: (id: string, reason: string) => Promise<void>

  // Loading states
  isLoading: boolean
  isSubmitting: boolean
}

// Default filter values
const defaultFilters: MarketplaceFilterType = {
  searchQuery: "",
  location: "all",
  type: "all",
  priceRange: [5000000, 100000000],
  sortBy: "trending",
  viewMode: "grid",
}

// Create context
const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

// Mock data for marketplace listings
const mockListings: MarketplaceListingType[] = [
  {
    id: "1",
    title: "Premium Land in Lekki Phase 1",
    description: "A beautiful piece of land in the heart of Lekki Phase 1. Perfect for residential development.",
    location: "Lekki Phase 1, Lagos",
    price: 75000000,
    type: "Residential",
    size: "1000 sqm",
    status: "available",
    featured: true,
    trending: true,
    features: ["Dry Land", "C of O", "Gated Community", "24/7 Security"],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: "seller1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 123 456 7890",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    investmentDetails: {
      minInvestment: 1000000,
      expectedReturn: 12,
      duration: 24,
      maxInvestors: 50,
      investmentType: "fractional",
      currentInvestors: 12,
      totalInvested: 25000000,
    },
    companyId: "company1",
  },
  {
    id: "2",
    title: "Commercial Plot in Victoria Island",
    description: "Prime commercial plot in Victoria Island. Excellent for office or retail development.",
    location: "Victoria Island, Lagos",
    price: 120000000,
    type: "Commercial",
    size: "2000 sqm",
    status: "available",
    featured: false,
    trending: true,
    features: ["Prime Location", "C of O", "Road Access", "Electricity"],
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhbmR8ZW58MHx8MHx8fDA%3D",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: "seller2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+234 987 654 3210",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    investmentDetails: {
      minInvestment: 2000000,
      expectedReturn: 15,
      duration: 36,
      maxInvestors: 30,
      investmentType: "development",
      currentInvestors: 8,
      totalInvested: 40000000,
    },
    companyId: "company2",
  },
  {
    id: "3",
    title: "Waterfront Land in Banana Island",
    description: "Exclusive waterfront land in Banana Island. Perfect for luxury residential development.",
    location: "Banana Island, Lagos",
    price: 250000000,
    type: "Residential",
    size: "1500 sqm",
    status: "available",
    featured: true,
    trending: false,
    features: ["Waterfront", "C of O", "Luxury Area", "Private Access"],
    images: [
      "https://images.unsplash.com/photo-1502787530428-11cf61d6ba18?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhbmR8ZW58MHx8MHx8fDA%3D",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: "seller3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "+234 555 123 4567",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    investmentDetails: {
      minInvestment: 5000000,
      expectedReturn: 18,
      duration: 48,
      maxInvestors: 20,
      investmentType: "fractional",
      currentInvestors: 5,
      totalInvested: 50000000,
    },
    companyId: "company3",
  },
  {
    id: "4",
    title: "Industrial Land in Agbara",
    description: "Large industrial land in Agbara Industrial Estate. Ideal for manufacturing or warehousing.",
    location: "Agbara, Ogun State",
    price: 85000000,
    type: "Industrial",
    size: "5000 sqm",
    status: "available",
    featured: false,
    trending: true,
    features: ["Industrial Zone", "Flat Terrain", "Road Access", "Power Supply"],
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhbmR8ZW58MHx8MHx8fDA%3D",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: "seller4",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+234 777 888 9999",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    investmentDetails: {
      minInvestment: 1500000,
      expectedReturn: 14,
      duration: 36,
      maxInvestors: 40,
      investmentType: "development",
      currentInvestors: 15,
      totalInvested: 35000000,
    },
    companyId: "company2",
  },
  {
    id: "5",
    title: "Residential Plot in Ikoyi",
    description: "Premium residential plot in Ikoyi. Perfect for luxury home development.",
    location: "Ikoyi, Lagos",
    price: 180000000,
    type: "Residential",
    size: "1200 sqm",
    status: "available",
    featured: true,
    trending: true,
    features: ["Gated Estate", "C of O", "Luxury Area", "24/7 Security"],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: "seller5",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      phone: "+234 111 222 3333",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    investmentDetails: {
      minInvestment: 3000000,
      expectedReturn: 16,
      duration: 24,
      maxInvestors: 25,
      investmentType: "fractional",
      currentInvestors: 10,
      totalInvested: 45000000,
    },
    companyId: "company1",
  },
  {
    id: "6",
    title: "Mixed-Use Land in Ikeja",
    description: "Strategic mixed-use land in Ikeja. Great for commercial and residential development.",
    location: "Ikeja, Lagos",
    price: 65000000,
    type: "Mixed-Use",
    size: "1800 sqm",
    status: "available",
    featured: false,
    trending: false,
    features: ["Commercial Area", "Governor's Consent", "Road Access", "High Foot Traffic"],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: {
      id: "seller6",
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "+234 444 555 6666",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    investmentDetails: {
      minInvestment: 1000000,
      expectedReturn: 13,
      duration: 30,
      maxInvestors: 35,
      investmentType: "development",
      currentInvestors: 20,
      totalInvested: 30000000,
    },
    companyId: "company3",
  },
]

// Provider component
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  // State for listings
  const [listings, setListings] = useState<MarketplaceListingType[]>([])
  const [filters, setFiltersState] = useState<MarketplaceFilterType>(defaultFilters)

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize with mock data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        setListings(mockListings)
      } catch (error) {
        console.error("Failed to initialize marketplace data:", error)
        errorToast("Failed to load marketplace listings")
      } finally {
        setIsLoading(false)
      }
    }

    initData()
  }, [])

  // Filter and sort listings based on filters
  const filteredListings = listings
    .filter((listing) => {
      // Filter by search query
      if (
        filters.searchQuery &&
        !listing.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !listing.location.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !listing.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filter by location
      if (filters.location !== "all" && !listing.location.includes(filters.location)) {
        return false
      }

      // Filter by type
      if (filters.type !== "all" && listing.type !== filters.type) {
        return false
      }

      // Filter by price range
      if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort based on sortBy option
      switch (filters.sortBy) {
        case "trending":
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  // Update filters
  const setFilters = (newFilters: Partial<MarketplaceFilterType>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }

  // Reset filters to default
  const resetFilters = () => {
    setFiltersState(defaultFilters)
  }

  // CRUD operations for listings
  const getListing = (id: string) => listings.find((listing) => listing.id === id)

  const addListing = async (
    listing: Omit<MarketplaceListingType, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()
      const newListing: MarketplaceListingType = {
        ...listing,
        id: `listing-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      setListings((prev) => [...prev, newListing])
      successToast("Listing added successfully")
      return newListing.id
    } catch (error) {
      console.error("Failed to add listing:", error)
      errorToast("Failed to add listing")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateListing = async (id: string, data: Partial<MarketplaceListingType>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : listing,
        ),
      )
      successToast("Listing updated successfully")
    } catch (error) {
      console.error("Failed to update listing:", error)
      errorToast("Failed to update listing")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteListing = async (id: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setListings((prev) => prev.filter((listing) => listing.id !== id))
      successToast("Listing deleted successfully")
    } catch (error) {
      console.error("Failed to delete listing:", error)
      errorToast("Failed to delete listing")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Buyer operations
  const buyProperty = async (listingId: string, buyerId: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to process purchase
      // For now, we'll just update the listing status
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: "sold",
                updatedAt: new Date().toISOString(),
              }
            : listing,
        ),
      )
      successToast("Property purchased successfully")
    } catch (error) {
      console.error("Failed to buy property:", error)
      errorToast("Failed to complete purchase")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const investInProperty = async (listingId: string, investorId: string, amount: number) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to process investment
      // For now, we'll just update the listing's investment details
      setListings((prev) =>
        prev.map((listing) => {
          if (listing.id === listingId && listing.investmentDetails) {
            const currentInvestors = (listing.investmentDetails.currentInvestors || 0) + 1
            const totalInvested = (listing.investmentDetails.totalInvested || 0) + amount

            return {
              ...listing,
              investmentDetails: {
                ...listing.investmentDetails,
                currentInvestors,
                totalInvested,
              },
              updatedAt: new Date().toISOString(),
            }
          }
          return listing
        }),
      )
      successToast("Investment processed successfully")
    } catch (error) {
      console.error("Failed to process investment:", error)
      errorToast("Failed to process investment")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Agent operations
  const getAgentListings = (agentId: string) => {
    return listings.filter((listing) => listing.seller.id === agentId)
  }

  const featureListing = async (id: string, featured: boolean) => {
    return updateListing(id, { featured })
  }

  // Admin operations
  const approveListing = async (id: string) => {
    return updateListing(id, { status: "available" })
  }

  const rejectListing = async (id: string, reason: string) => {
    // In a real app, you might store the rejection reason
    return deleteListing(id)
  }

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
    investInProperty,

    // Agent operations
    getAgentListings,
    featureListing,

    // Admin operations
    approveListing,
    rejectListing,

    // Loading states
    isLoading,
    isSubmitting,
  }

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

// Custom hook to use the context
export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider")
  }
  return context
}
