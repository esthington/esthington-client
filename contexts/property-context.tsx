"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Property, mockProperties } from "@/lib/mock-data"
import { successToast, errorToast } from "@/lib/toast"

// Define the context type
interface PropertyContextType {
  // Properties
  properties: Property[]
  filteredProperties: Property[]
  selectedProperty: Property | null
  isLoading: boolean

  // Filters
  searchQuery: string
  locationFilter: string
  typeFilter: string
  sortOption: string
  viewMode: "grid" | "list"

  // CRUD operations
  getPropertyById: (id: string) => Property | null
  createProperty: (property: Omit<Property, "id" | "createdAt">) => Promise<Property>
  updateProperty: (id: string, property: Partial<Property>) => Promise<Property>
  deleteProperty: (id: string) => Promise<boolean>

  // Filter operations
  setSearchQuery: (query: string) => void
  setLocationFilter: (location: string) => void
  setTypeFilter: (type: string) => void
  setSortOption: (option: string) => void
  setViewMode: (mode: "grid" | "list") => void

  // Selection
  selectProperty: (property: Property | null) => void
}

// Create the context with a default value
const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

// Provider props
interface PropertyProviderProps {
  children: ReactNode
}

// Provider component
export function PropertyProvider({ children }: PropertyProviderProps) {
  // State for properties
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortOption, setSortOption] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Load initial data
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use the mock data
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        setProperties(mockProperties)
      } catch (error) {
        console.error("Error loading properties:", error)
        errorToast("Failed to load properties", {
          description: "Please try again or contact support if the issue persists.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...properties]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply location filter
    if (locationFilter !== "all") {
      result = result.filter((property) => property.location.includes(locationFilter))
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((property) => property.type === typeFilter)
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      default:
        break
    }

    setFilteredProperties(result)
  }, [properties, searchQuery, locationFilter, typeFilter, sortOption])

  // CRUD operations
  const getPropertyById = (id: string): Property | null => {
    return properties.find((property) => property.id === id) || null
  }

  const createProperty = async (property: Omit<Property, "id" | "createdAt">): Promise<Property> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

      const newProperty: Property = {
        ...property,
        id: `${properties.length + 1}`,
        createdAt: new Date().toISOString(),
      }

      setProperties((prevProperties) => [...prevProperties, newProperty])

      successToast("Property created successfully", {
        description: `${newProperty.title} has been added to your properties.`,
      })

      return newProperty
    } catch (error) {
      console.error("Error creating property:", error)
      errorToast("Failed to create property", {
        description: "Please try again or contact support if the issue persists.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProperty = async (id: string, propertyUpdate: Partial<Property>): Promise<Property> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

      const updatedProperties = properties.map((property) =>
        property.id === id ? { ...property, ...propertyUpdate } : property,
      )

      setProperties(updatedProperties)

      const updatedProperty = updatedProperties.find((property) => property.id === id)

      if (!updatedProperty) {
        throw new Error("Property not found")
      }

      successToast("Property updated successfully", {
        description: `Changes to ${updatedProperty.title} have been saved.`,
      })

      return updatedProperty
    } catch (error) {
      console.error("Error updating property:", error)
      errorToast("Failed to update property", {
        description: "Please try again or contact support if the issue persists.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProperty = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

      setProperties((prevProperties) => prevProperties.filter((property) => property.id !== id))

      successToast("Property deleted successfully", {
        description: "The property has been removed from your listings.",
      })

      return true
    } catch (error) {
      console.error("Error deleting property:", error)
      errorToast("Failed to delete property", {
        description: "Please try again or contact support if the issue persists.",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const selectProperty = (property: Property | null) => {
    setSelectedProperty(property)
  }

  // Context value
  const value: PropertyContextType = {
    properties,
    filteredProperties,
    selectedProperty,
    isLoading,

    searchQuery,
    locationFilter,
    typeFilter,
    sortOption,
    viewMode,

    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,

    setSearchQuery,
    setLocationFilter,
    setTypeFilter,
    setSortOption,
    setViewMode,

    selectProperty,
  }

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>
}

// Custom hook to use the property context
export function useProperty() {
  const context = useContext(PropertyContext)
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider")
  }
  return context
}
