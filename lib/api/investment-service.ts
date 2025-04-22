import { apiConfig } from "./api-config"
import { apiConfigFile } from "./api-config-file"
import type { Investment } from "@/contexts/investments-context"

export interface InvestmentResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export const InvestmentService = {
  // Get all investments
  getInvestments: async (): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.get("/investments")
      return {
        success: true,
        message: "Investments retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve investments",
        error: error.message,
      }
    }
  },

  // Get user investments
  getUserInvestments: async (): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.get("/investments/user")
      return {
        success: true,
        message: "User investments retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve user investments",
        error: error.message,
      }
    }
  },

  // Get investment by ID
  getInvestmentById: async (id: string): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.get(`/investments/${id}`)
      return {
        success: true,
        message: "Investment retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve investment",
        error: error.message,
      }
    }
  },

  // Create investment (admin)
  createInvestment: async (investment: Partial<Investment>): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.post("/investments", investment)
      return {
        success: true,
        message: "Investment created successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create investment",
        error: error.message,
      }
    }
  },

  // Update investment (admin)
  updateInvestment: async (id: string, data: Partial<Investment>): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.put(`/investments/${id}`, data)
      return {
        success: true,
        message: "Investment updated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update investment",
        error: error.message,
      }
    }
  },

  // Delete investment (admin)
  deleteInvestment: async (id: string): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.delete(`/investments/${id}`)
      return {
        success: true,
        message: "Investment deleted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete investment",
        error: error.message,
      }
    }
  },

  // Toggle featured status (admin)
  toggleFeatured: async (id: string): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.put(`/investments/${id}/featured`)
      return {
        success: true,
        message: "Featured status toggled successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to toggle featured status",
        error: error.message,
      }
    }
  },

  // Toggle trending status (admin)
  toggleTrending: async (id: string): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.put(`/investments/${id}/trending`)
      return {
        success: true,
        message: "Trending status toggled successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to toggle trending status",
        error: error.message,
      }
    }
  },

  // Change investment status (admin)
  changeInvestmentStatus: async (id: string, status: "active" | "pending" | "closed"): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.put(`/investments/${id}/status`, { status })
      return {
        success: true,
        message: "Investment status changed successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change investment status",
        error: error.message,
      }
    }
  },

  // Invest in property (user)
  investInProperty: async (investmentId: string, amount: number): Promise<InvestmentResponse> => {
    try {
      const response = await apiConfig.post(`/investments/${investmentId}/invest`, { amount })
      return {
        success: true,
        message: "Investment successful",
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

  // Upload investment images
  uploadInvestmentImages: async (id: string, images: File[]): Promise<InvestmentResponse> => {
    try {
      const formData = new FormData()
      images.forEach((image) => {
        formData.append("images", image)
      })

      const response = await apiConfigFile.post(`/investments/${id}/images`, formData)
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

  // Upload investment documents
  uploadInvestmentDocuments: async (id: string, documents: File[]): Promise<InvestmentResponse> => {
    try {
      const formData = new FormData()
      documents.forEach((document) => {
        formData.append("documents", document)
      })

      const response = await apiConfigFile.post(`/investments/${id}/documents`, formData)
      return {
        success: true,
        message: "Documents uploaded successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload documents",
        error: error.message,
      }
    }
  },
}
