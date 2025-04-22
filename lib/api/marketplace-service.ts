import { apiConfig } from "./api-config"
import { apiConfigFile } from "./api-config-file"
import type { MarketplaceListingType } from "@/contexts/marketplace-context"

export interface MarketplaceResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export const MarketplaceService = {
  // Get all listings
  getListings: async (): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.get("/marketplace")
      return {
        success: true,
        message: "Listings retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve listings",
        error: error.message,
      }
    }
  },

  // Get listing by ID
  getListingById: async (id: string): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.get(`/marketplace/${id}`)
      return {
        success: true,
        message: "Listing retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve listing",
        error: error.message,
      }
    }
  },

  // Create listing
  createListing: async (
    listing: Omit<MarketplaceListingType, "id" | "createdAt" | "updatedAt">,
  ): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.post("/marketplace", listing)
      return {
        success: true,
        message: "Listing created successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create listing",
        error: error.message,
      }
    }
  },

  // Update listing
  updateListing: async (id: string, data: Partial<MarketplaceListingType>): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.put(`/marketplace/${id}`, data)
      return {
        success: true,
        message: "Listing updated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update listing",
        error: error.message,
      }
    }
  },

  // Delete listing
  deleteListing: async (id: string): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.delete(`/marketplace/${id}`)
      return {
        success: true,
        message: "Listing deleted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete listing",
        error: error.message,
      }
    }
  },

  // Upload listing images
  uploadListingImages: async (id: string, images: File[]): Promise<MarketplaceResponse> => {
    try {
      const formData = new FormData()
      images.forEach((image) => {
        formData.append("images", image)
      })

      const response = await apiConfigFile.post(`/marketplace/${id}/images`, formData)
      return {
        success: true,
        message: "Images uploaded successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload images",
        error: error.message,
      }
    }
  },

  // Buy property
  buyProperty: async (listingId: string): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.post(`/marketplace/${listingId}/buy`)
      return {
        success: true,
        message: "Property purchased successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to purchase property",
        error: error.message,
      }
    }
  },

  // Invest in property
  investInProperty: async (listingId: string, amount: number): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.post(`/marketplace/${listingId}/invest`, { amount })
      return {
        success: true,
        message: "Investment processed successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to process investment",
        error: error.message,
      }
    }
  },

  // Get agent listings
  getAgentListings: async (): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.get("/marketplace/agent")
      return {
        success: true,
        message: "Agent listings retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve agent listings",
        error: error.message,
      }
    }
  },

  // Feature listing
  featureListing: async (id: string, featured: boolean): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.put(`/marketplace/${id}/feature`, { featured })
      return {
        success: true,
        message: featured ? "Listing featured successfully" : "Listing unfeatured successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update featured status",
        error: error.message,
      }
    }
  },

  // Approve listing (admin)
  approveListing: async (id: string): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.put(`/marketplace/${id}/approve`)
      return {
        success: true,
        message: "Listing approved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve listing",
        error: error.message,
      }
    }
  },

  // Reject listing (admin)
  rejectListing: async (id: string, reason: string): Promise<MarketplaceResponse> => {
    try {
      const response = await apiConfig.put(`/marketplace/${id}/reject`, { reason })
      return {
        success: true,
        message: "Listing rejected successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject listing",
        error: error.message,
      }
    }
  },
}
