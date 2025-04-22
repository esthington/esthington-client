import { apiConfig } from "./api-config"
import { apiConfigFile } from "./api-config-file"
import type { Property } from "@/lib/mock-data"

export interface PropertyResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export const PropertyService = {
  // Get all properties
  getProperties: async (): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.get("/properties")
      return {
        success: true,
        message: "Properties retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve properties",
        error: error.message,
      }
    }
  },

  // Get property by ID
  getPropertyById: async (id: string): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.get(`/properties/${id}`)
      return {
        success: true,
        message: "Property retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve property",
        error: error.message,
      }
    }
  },

  // Create property
  createProperty: async (property: Omit<Property, "id" | "createdAt">): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.post("/properties", property)
      return {
        success: true,
        message: "Property created successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create property",
        error: error.message,
      }
    }
  },

  // Update property
  updateProperty: async (id: string, property: Partial<Property>): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.put(`/properties/${id}`, property)
      return {
        success: true,
        message: "Property updated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update property",
        error: error.message,
      }
    }
  },

  // Delete property
  deleteProperty: async (id: string): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.delete(`/properties/${id}`)
      return {
        success: true,
        message: "Property deleted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete property",
        error: error.message,
      }
    }
  },

  // Upload property images
  uploadPropertyImages: async (id: string, images: File[]): Promise<PropertyResponse> => {
    try {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })

      const response = await apiConfigFile.post(`/properties/${id}/images`, formData)
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

  // Delete property image
  deletePropertyImage: async (propertyId: string, imageId: string): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.delete(`/properties/${propertyId}/images/${imageId}`)
      return {
        success: true,
        message: "Image deleted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete image",
        error: error.message,
      }
    }
  },

  // Get property types
  getPropertyTypes: async (): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.get("/properties/types")
      return {
        success: true,
        message: "Property types retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve property types",
        error: error.message,
      }
    }
  },

  // Get property locations
  getPropertyLocations: async (): Promise<PropertyResponse> => {
    try {
      const response = await apiConfig.get("/properties/locations")
      return {
        success: true,
        message: "Property locations retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve property locations",
        error: error.message,
      }
    }
  },
}
