import { apiConfig } from "./api-config"
import type { UserType, AdminType } from "@/contexts/management-context"

export interface ManagementResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

export const ManagementService = {
  // Users
  getUsers: async (): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get("/management/users")
      return {
        success: true,
        message: "Users retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve users",
        error: error.message,
      }
    }
  },

  getUserById: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get(`/management/users/${id}`)
      return {
        success: true,
        message: "User retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve user",
        error: error.message,
      }
    }
  },

  addUser: async (user: Omit<UserType, "id">): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.post("/management/users", user)
      return {
        success: true,
        message: "User added successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add user",
        error: error.message,
      }
    }
  },

  updateUser: async (id: string, data: Partial<UserType>): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/users/${id}`, data)
      return {
        success: true,
        message: "User updated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update user",
        error: error.message,
      }
    }
  },

  deleteUser: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.delete(`/management/users/${id}`)
      return {
        success: true,
        message: "User deleted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user",
        error: error.message,
      }
    }
  },

  blacklistUser: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/users/${id}/blacklist`)
      return {
        success: true,
        message: "User blacklisted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to blacklist user",
        error: error.message,
      }
    }
  },

  unblacklistUser: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/users/${id}/unblacklist`)
      return {
        success: true,
        message: "User unblacklisted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unblacklist user",
        error: error.message,
      }
    }
  },

  // Admins
  getAdmins: async (): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get("/management/admins")
      return {
        success: true,
        message: "Admins retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve admins",
        error: error.message,
      }
    }
  },

  getAdminById: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get(`/management  Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get(\`/management/admins/${id}`)
      return {
        success: true,
        message: "Admin retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve admin",
        error: error.message,
      }
    }
  },

  addAdmin: async (admin: Omit<AdminType, "id">): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.post("/management/admins", admin)
      return {
        success: true,
        message: "Admin added successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add admin",
        error: error.message,
      }
    }
  },

  updateAdmin: async (id: string, data: Partial<AdminType>): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/admins/${id}`, data)
      return {
        success: true,
        message: "Admin updated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update admin",
        error: error.message,
      }
    }
  },

  deleteAdmin: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.delete(`/management/admins/${id}`)
      return {
        success: true,
        message: "Admin deleted successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete admin",
        error: error.message,
      }
    }
  },

  suspendAdmin: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/admins/${id}/suspend`)
      return {
        success: true,
        message: "Admin suspended successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to suspend admin",
        error: error.message,
      }
    }
  },

  activateAdmin: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/admins/${id}/activate`)
      return {
        success: true,
        message: "Admin activated successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to activate admin",
        error: error.message,
      }
    }
  },

  // Transactions
  getTransactions: async (): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get("/management/transactions")
      return {
        success: true,
        message: "Transactions retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve transactions",
        error: error.message,
      }
    }
  },

  getTransactionById: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get(`/management/transactions/${id}`)
      return {
        success: true,
        message: "Transaction retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve transaction",
        error: error.message,
      }
    }
  },

  approveTransaction: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/transactions/${id}/approve`)
      return {
        success: true,
        message: "Transaction approved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve transaction",
        error: error.message,
      }
    }
  },

  rejectTransaction: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/transactions/${id}/reject`)
      return {
        success: true,
        message: "Transaction rejected successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject transaction",
        error: error.message,
      }
    }
  },

  // Approvals
  getApprovals: async (): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get("/management/approvals")
      return {
        success: true,
        message: "Approvals retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve approvals",
        error: error.message,
      }
    }
  },

  getApprovalById: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get(`/management/approvals/${id}`)
      return {
        success: true,
        message: "Approval retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve approval",
        error: error.message,
      }
    }
  },

  approveRequest: async (id: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/approvals/${id}/approve`)
      return {
        success: true,
        message: "Request approved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve request",
        error: error.message,
      }
    }
  },

  rejectRequest: async (id: string, reason: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.put(`/management/approvals/${id}/reject`, { reason })
      return {
        success: true,
        message: "Request rejected successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject request",
        error: error.message,
      }
    }
  },

  // Reports
  getReportData: async (timeRange: string): Promise<ManagementResponse> => {
    try {
      const response = await apiConfig.get(`/management/reports?timeRange=${timeRange}`)
      return {
        success: true,
        message: "Report data retrieved successfully",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to retrieve report data",
        error: error.message,
      }
    }
  },
}
