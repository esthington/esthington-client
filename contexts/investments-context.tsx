"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { successToast, errorToast } from "@/lib/toast"

// Define types for our context
type InvestmentStatus = "active" | "pending" | "closed"

interface InvestmentProperty {
  id: string
  title: string
  location: string
}

interface InvestmentUser {
  id: string
  name: string
  email: string
  avatar: string
}

interface InvestmentDocument {
  name: string
  size: number
  url: string
}

export interface Investment {
  id: string
  title: string
  description: string
  location: string
  price: number
  type: string
  returnRate: number
  investmentPeriod: string
  minInvestment: number
  totalInvestors: number
  funded: number
  target: number
  status: InvestmentStatus
  featured: boolean
  trending: boolean
  createdAt: string
  amenities?: string[]
  images: string[]
  documents?: InvestmentDocument[]
  investors?: {
    id: string
    name: string
    amount: number
    date: string
  }[]
  companyId?: string
}

interface InvestmentFilters {
  location: string
  type: string
  returnRateRange: [number, number]
  priceRange: [number, number]
  status?: InvestmentStatus
  featured?: boolean
  trending?: boolean
}

interface InvestmentSortOption {
  field: string
  direction: "asc" | "desc"
}

interface InvestmentContextType {
  // State
  investments: Investment[]
  userInvestments: Investment[]
  filteredInvestments: Investment[]
  selectedInvestment: Investment | null
  isLoading: boolean
  isSubmitting: boolean
  filters: InvestmentFilters
  sortOption: InvestmentSortOption

  // Actions - General
  fetchInvestments: () => Promise<void>
  fetchUserInvestments: () => Promise<void>
  getInvestmentById: (id: string) => Promise<Investment | null>
  setFilters: (filters: Partial<InvestmentFilters>) => void
  setSortOption: (option: InvestmentSortOption) => void
  clearFilters: () => void

  // Actions - Admin
  createInvestment: (investment: Partial<Investment>) => Promise<boolean>
  updateInvestment: (id: string, data: Partial<Investment>) => Promise<boolean>
  deleteInvestment: (id: string) => Promise<boolean>
  toggleFeatured: (id: string) => Promise<boolean>
  toggleTrending: (id: string) => Promise<boolean>
  changeInvestmentStatus: (id: string, status: InvestmentStatus) => Promise<boolean>

  // Actions - User
  investInProperty: (investmentId: string, amount: number) => Promise<boolean>
}

// Create the context
const InvestmentsContext = createContext<InvestmentContextType | undefined>(undefined)

// Mock data for investments
const mockInvestments: Investment[] = [
  {
    id: "1",
    title: "Luxury Apartment Complex",
    description:
      "A premium residential development featuring 24 luxury apartments in the heart of Lagos. Each unit comes with high-end finishes, smart home technology, and access to exclusive amenities including a rooftop infinity pool, fitness center, and 24/7 security.",
    location: "Lagos, Nigeria",
    price: 250000000,
    type: "Residential",
    returnRate: 12,
    investmentPeriod: "36 months",
    minInvestment: 100000,
    totalInvestors: 45,
    funded: 75,
    target: 250000000,
    status: "active",
    featured: true,
    trending: true,
    createdAt: "2023-05-15",
    amenities: [
      "Swimming Pool",
      "Gym",
      "24/7 Security",
      "Parking",
      "Smart Home Features",
      "Rooftop Garden",
      "Children's Play Area",
      "Backup Power",
    ],
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D",
    ],
    documents: [
      { name: "Investment Prospectus.pdf", size: 2.4, url: "#" },
      { name: "Financial Projections.pdf", size: 1.8, url: "#" },
      { name: "Legal Documentation.pdf", size: 3.2, url: "#" },
    ],
    investors: [
      { id: "1", name: "John Doe", amount: 500000, date: "2023-06-10" },
      { id: "2", name: "Jane Smith", amount: 250000, date: "2023-06-12" },
      { id: "3", name: "Robert Johnson", amount: 1000000, date: "2023-06-15" },
      { id: "4", name: "Sarah Williams", amount: 150000, date: "2023-06-18" },
      { id: "5", name: "Michael Brown", amount: 300000, date: "2023-06-20" },
    ],
  },
  {
    id: "2",
    title: "Commercial Office Building",
    description:
      "A modern 12-story office building in Abuja's central business district. The property features flexible office spaces, meeting rooms, high-speed elevators, underground parking, and energy-efficient design. Ideal for corporate headquarters and professional services firms.",
    location: "Abuja, Nigeria",
    price: 450000000,
    type: "Commercial",
    returnRate: 15,
    investmentPeriod: "48 months",
    minInvestment: 250000,
    totalInvestors: 28,
    funded: 60,
    target: 450000000,
    status: "active",
    featured: false,
    trending: true,
    createdAt: "2023-06-22",
    amenities: [
      "Underground Parking",
      "High-speed Elevators",
      "Conference Facilities",
      "24/7 Security",
      "Backup Power",
      "Central Air Conditioning",
      "Fiber Optic Internet",
    ],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29tbWVyY2lhbCUyMGJ1aWxkaW5nfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8b2ZmaWNlfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    documents: [
      { name: "Commercial Property Prospectus.pdf", size: 3.1, url: "#" },
      { name: "Market Analysis.pdf", size: 2.2, url: "#" },
      { name: "Rental Income Projections.pdf", size: 1.5, url: "#" },
    ],
    investors: [
      { id: "6", name: "David Wilson", amount: 750000, date: "2023-07-05" },
      { id: "7", name: "Emily Davis", amount: 500000, date: "2023-07-08" },
      { id: "8", name: "James Taylor", amount: 1250000, date: "2023-07-12" },
      { id: "9", name: "Olivia Martin", amount: 300000, date: "2023-07-15" },
    ],
  },
  {
    id: "3",
    title: "Residential Housing Estate",
    description:
      "A premium residential estate featuring 50 luxury homes in a gated community. Each home comes with modern amenities, spacious layouts, and beautiful landscaping. The estate includes communal facilities like a clubhouse, swimming pool, and children's playground.",
    location: "Port Harcourt, Nigeria",
    price: 350000000,
    type: "Residential",
    returnRate: 10,
    investmentPeriod: "24 months",
    minInvestment: 50000,
    totalInvestors: 120,
    funded: 90,
    target: 350000000,
    status: "active",
    featured: true,
    trending: false,
    createdAt: "2023-07-10",
    amenities: [
      "Gated Community",
      "Clubhouse",
      "Swimming Pool",
      "Children's Playground",
      "24/7 Security",
      "Landscaped Gardens",
      "Backup Power",
    ],
    images: [
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG91c2luZyUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG91c2V8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww",
    ],
  },
  {
    id: "4",
    title: "Shopping Mall Development",
    description:
      "A modern shopping mall development in Lagos featuring retail spaces, food courts, entertainment zones, and ample parking. The mall is strategically located in a high-traffic area with excellent visibility and accessibility.",
    location: "Lagos, Nigeria",
    price: 650000000,
    type: "Commercial",
    returnRate: 18,
    investmentPeriod: "60 months",
    minInvestment: 500000,
    totalInvestors: 15,
    funded: 40,
    target: 650000000,
    status: "pending",
    featured: false,
    trending: true,
    createdAt: "2023-08-05",
    images: [
      "https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNob3BwaW5nJTIwbWFsbHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c2hvcHBpbmclMjBtYWxsfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1567449303078-57ad995bd17a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNob3BwaW5nJTIwbWFsbHxlbnwwfHwwfHx8MA%3D%3D",
    ],
  },
  {
    id: "5",
    title: "Waterfront Luxury Villas",
    description:
      "A collection of luxury waterfront villas offering stunning views and premium amenities. Each villa features spacious living areas, private pools, and direct access to the waterfront. The development includes a private marina, clubhouse, and 24/7 security.",
    location: "Lagos, Nigeria",
    price: 850000000,
    type: "Residential",
    returnRate: 14,
    investmentPeriod: "48 months",
    minInvestment: 200000,
    totalInvestors: 32,
    funded: 55,
    target: 850000000,
    status: "active",
    featured: true,
    trending: true,
    createdAt: "2023-09-18",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGx1eHVyeSUyMGhvdXNlfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGx1eHVyeSUyMGhvdXNlfGVufDB8fDB8fHww",
    ],
  },
  {
    id: "6",
    title: "Industrial Warehouse Complex",
    description:
      "A modern industrial warehouse complex strategically located with excellent access to major transportation routes. The complex features high-ceiling warehouses, loading docks, office spaces, and ample parking for trucks and staff vehicles.",
    location: "Abuja, Nigeria",
    price: 320000000,
    type: "Industrial",
    returnRate: 16,
    investmentPeriod: "36 months",
    minInvestment: 150000,
    totalInvestors: 25,
    funded: 80,
    target: 320000000,
    status: "closed",
    featured: false,
    trending: false,
    createdAt: "2023-10-25",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2FyZWhvdXNlfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2FyZWhvdXNlfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1565891741441-64926e441838?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdhcmVob3VzZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
  },
]

// Mock user investments
const mockUserInvestments = [
  {
    id: "1",
    title: "Luxury Apartment Complex",
    description: "A premium residential development featuring 24 luxury apartments in the heart of Lagos.",
    location: "Lagos, Nigeria",
    price: 250000000,
    type: "Residential",
    returnRate: 12,
    investmentPeriod: "36 months",
    minInvestment: 100000,
    totalInvestors: 45,
    funded: 75,
    target: 250000000,
    status: "active",
    featured: true,
    trending: true,
    createdAt: "2023-05-15",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D",
    ],
    userInvestment: {
      amount: 500000,
      date: "2023-06-10",
      returns: 60000,
      nextPayout: "2023-12-10",
    },
  },
  {
    id: "3",
    title: "Residential Housing Estate",
    description: "A premium residential estate featuring 50 luxury homes in a gated community.",
    location: "Port Harcourt, Nigeria",
    price: 350000000,
    type: "Residential",
    returnRate: 10,
    investmentPeriod: "24 months",
    minInvestment: 50000,
    totalInvestors: 120,
    funded: 90,
    target: 350000000,
    status: "active",
    featured: true,
    trending: false,
    createdAt: "2023-07-10",
    images: [
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG91c2luZyUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    userInvestment: {
      amount: 250000,
      date: "2023-07-15",
      returns: 25000,
      nextPayout: "2023-12-15",
    },
  },
]

// Create the provider component
export const InvestmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [userInvestments, setUserInvestments] = useState<Investment[]>([])
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([])
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default filters and sort options
  const [filters, setFiltersState] = useState<InvestmentFilters>({
    location: "all",
    type: "all",
    returnRateRange: [5, 20],
    priceRange: [0, 1000000000],
  })

  const [sortOption, setSortOptionState] = useState<InvestmentSortOption>({
    field: "trending",
    direction: "desc",
  })

  // Fetch all investments
  const fetchInvestments = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setInvestments(mockInvestments)
      applyFiltersAndSort(mockInvestments)
    } catch (error) {
      console.error("Error fetching investments:", error)
      errorToast("Failed to load investments")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch user investments
  const fetchUserInvestments = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUserInvestments(
        mockUserInvestments.map(({ userInvestment, ...investment }) => ({
          ...investment,
          status: investment.status as InvestmentStatus,
        }))
      )
    } catch (error) {
      console.error("Error fetching user investments:", error)
      errorToast("Failed to load your investments")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get investment by ID
  const getInvestmentById = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      const investment = mockInvestments.find((inv) => inv.id === id) || null
      setSelectedInvestment(investment)
      return investment
    } catch (error) {
      console.error("Error fetching investment details:", error)
      errorToast("Failed to load investment details")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(
    (investmentsToFilter: Investment[]) => {
      // Apply filters
      let filtered = [...investmentsToFilter]

      if (filters.location !== "all") {
        filtered = filtered.filter((inv) => inv.location.includes(filters.location))
      }

      if (filters.type !== "all") {
        filtered = filtered.filter((inv) => inv.type === filters.type)
      }

      filtered = filtered.filter(
        (inv) => inv.returnRate >= filters.returnRateRange[0] && inv.returnRate <= filters.returnRateRange[1],
      )

      filtered = filtered.filter((inv) => inv.price >= filters.priceRange[0] && inv.price <= filters.priceRange[1])

      if (filters.status) {
        filtered = filtered.filter((inv) => inv.status === filters.status)
      }

      if (filters.featured !== undefined) {
        filtered = filtered.filter((inv) => inv.featured === filters.featured)
      }

      if (filters.trending !== undefined) {
        filtered = filtered.filter((inv) => inv.trending === filters.trending)
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const direction = sortOption.direction === "asc" ? 1 : -1

        switch (sortOption.field) {
          case "trending":
            return ((b.trending ? 1 : 0) - (a.trending ? 1 : 0)) * direction
          case "featured":
            return ((b.featured ? 1 : 0) - (a.featured ? 1 : 0)) * direction
          case "returnRate":
            return (b.returnRate - a.returnRate) * direction
          case "price":
            return (b.price - a.price) * direction
          case "funded":
            return (b.funded - a.funded) * direction
          case "createdAt":
            return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * direction
          default:
            return 0
        }
      })

      setFilteredInvestments(filtered)
    },
    [filters, sortOption],
  )

  // Set filters
  const setFilters = useCallback(
    (newFilters: Partial<InvestmentFilters>) => {
      setFiltersState((prev) => {
        const updated = { ...prev, ...newFilters }
        applyFiltersAndSort(investments)
        return updated
      })
    },
    [investments, applyFiltersAndSort],
  )

  // Set sort option
  const setSortOption = useCallback(
    (option: InvestmentSortOption) => {
      setSortOptionState(option)
      applyFiltersAndSort(investments)
    },
    [investments, applyFiltersAndSort],
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      location: "all",
      type: "all",
      returnRateRange: [5, 20],
      priceRange: [0, 1000000000],
    })
    applyFiltersAndSort(investments)
  }, [investments, applyFiltersAndSort])

  // Create investment (admin)
  const createInvestment = useCallback(
    async (investment: Partial<Investment>) => {
      setIsSubmitting(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const newInvestment: Investment = {
          id: `${investments.length + 1}`,
          title: investment.title || "New Investment",
          description: investment.description || "",
          location: investment.location || "",
          price: investment.price || 0,
          type: investment.type || "Residential",
          returnRate: investment.returnRate || 10,
          investmentPeriod: investment.investmentPeriod || "36 months",
          minInvestment: investment.minInvestment || 100000,
          totalInvestors: 0,
          funded: 0,
          target: investment.price || 0,
          status: "pending",
          featured: investment.featured || false,
          trending: investment.trending || false,
          createdAt: new Date().toISOString().split("T")[0],
          amenities: investment.amenities || [],
          images: investment.images || ["/placeholder.svg?height=400&width=600"],
          documents: investment.documents || [],
        }

        setInvestments((prev) => [...prev, newInvestment])
        successToast("Investment created successfully")
        return true
      } catch (error) {
        console.error("Error creating investment:", error)
        errorToast("Failed to create investment")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [investments],
  )

  // Update investment (admin)
  const updateInvestment = useCallback(
    async (id: string, data: Partial<Investment>) => {
      setIsSubmitting(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1200))

        setInvestments((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)))

        if (selectedInvestment?.id === id) {
          setSelectedInvestment((prev) => (prev ? { ...prev, ...data } : null))
        }

        successToast("Investment updated successfully")
        return true
      } catch (error) {
        console.error("Error updating investment:", error)
        errorToast("Failed to update investment")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedInvestment],
  )

  // Delete investment (admin)
  const deleteInvestment = useCallback(
    async (id: string) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setInvestments((prev) => prev.filter((inv) => inv.id !== id))

        if (selectedInvestment?.id === id) {
          setSelectedInvestment(null)
        }

        successToast("Investment deleted successfully")
        return true
      } catch (error) {
        console.error("Error deleting investment:", error)
        errorToast("Failed to delete investment")
        return false
      }
    },
    [selectedInvestment],
  )

  // Toggle featured status (admin)
  const toggleFeatured = useCallback(
    async (id: string) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        setInvestments((prev) => prev.map((inv) => (inv.id === id ? { ...inv, featured: !inv.featured } : inv)))

        if (selectedInvestment?.id === id) {
          setSelectedInvestment((prev) => (prev ? { ...prev, featured: !prev.featured } : null))
        }

        successToast(
          `Investment ${investments.find((inv) => inv.id === id)?.featured ? "removed from" : "marked as"} featured`,
        )
        return true
      } catch (error) {
        console.error("Error toggling featured status:", error)
        errorToast("Failed to update featured status")
        return false
      }
    },
    [investments, selectedInvestment],
  )

  // Toggle trending status (admin)
  const toggleTrending = useCallback(
    async (id: string) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        setInvestments((prev) => prev.map((inv) => (inv.id === id ? { ...inv, trending: !inv.trending } : inv)))

        if (selectedInvestment?.id === id) {
          setSelectedInvestment((prev) => (prev ? { ...prev, trending: !prev.trending } : null))
        }

        successToast(
          `Investment ${investments.find((inv) => inv.id === id)?.trending ? "removed from" : "marked as"} trending`,
        )
        return true
      } catch (error) {
        console.error("Error toggling trending status:", error)
        errorToast("Failed to update trending status")
        return false
      }
    },
    [investments, selectedInvestment],
  )

  // Change investment status (admin)
  const changeInvestmentStatus = useCallback(
    async (id: string, status: InvestmentStatus) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setInvestments((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)))

        if (selectedInvestment?.id === id) {
          setSelectedInvestment((prev) => (prev ? { ...prev, status } : null))
        }

        const statusText = status === "active" ? "activated" : status === "pending" ? "set to pending" : "closed"

        successToast(`Investment has been ${statusText}`)
        return true
      } catch (error) {
        console.error("Error changing investment status:", error)
        errorToast("Failed to update investment status")
        return false
      }
    },
    [investments, selectedInvestment],
  )

  // Invest in property (user)
  const investInProperty = useCallback(
    async (investmentId: string, amount: number) => {
      setIsSubmitting(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Update the investment
        setInvestments((prev) =>
          prev.map((inv) => {
            if (inv.id === investmentId) {
              const newFundedAmount = Math.min(inv.funded + (amount / inv.target) * 100, 100)
              const newTotalInvestors = inv.totalInvestors + 1

              return {
                ...inv,
                funded: newFundedAmount,
                totalInvestors: newTotalInvestors,
              }
            }
            return inv
          }),
        )

        // Add to user investments
        const investment = investments.find((inv) => inv.id === investmentId)
        if (investment) {
          const userInvestment = {
            ...investment,
            userInvestment: {
              amount,
              date: new Date().toISOString().split("T")[0],
              returns: (amount * investment.returnRate) / 100,
              nextPayout: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
          }

          setUserInvestments((prev) => {
            const exists = prev.some((inv) => inv.id === investmentId)
            return exists
              ? prev.map((inv) => (inv.id === investmentId ? userInvestment : inv))
              : [...prev, userInvestment]
          })
        }

        successToast("Investment successful! Thank you for investing.")
        return true
      } catch (error) {
        console.error("Error investing in property:", error)
        errorToast("Failed to process your investment")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [investments],
  )

  // Initialize data on mount
  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  // Update filtered investments when investments or filters change
  useEffect(() => {
    applyFiltersAndSort(investments)
  }, [investments, filters, sortOption, applyFiltersAndSort])

  const contextValue: InvestmentContextType = {
    investments,
    userInvestments,
    filteredInvestments,
    selectedInvestment,
    isLoading,
    isSubmitting,
    filters,
    sortOption,
    fetchInvestments,
    fetchUserInvestments,
    getInvestmentById,
    setFilters,
    setSortOption,
    clearFilters,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    toggleFeatured,
    toggleTrending,
    changeInvestmentStatus,
    investInProperty,
  }

  return <InvestmentsContext.Provider value={contextValue}>{children}</InvestmentsContext.Provider>
}

// Custom hook to use the investments context
export const useInvestments = () => {
  const context = useContext(InvestmentsContext)
  if (context === undefined) {
    throw new Error("useInvestments must be used within an InvestmentsProvider")
  }
  return context
}
