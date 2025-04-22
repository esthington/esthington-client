"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for each management section
export type UserType = {
  id: string
  name: string
  email: string
  role: "buyer" | "agent" | "admin" | "super_admin"
  status: "active" | "suspended" | "blacklisted"
  verified: boolean
  joinDate: string
  lastActive: string
  avatar: string
  transactions?: number
  properties?: number
  walletBalance?: number
  companyId?: string | null
}

export type AdminType = {
  id: string
  name: string
  email: string
  role: "admin" | "super_admin"
  status: "active" | "suspended"
  joinDate: string
  lastActive: string
  avatar: string
  permissions: string[]
  activityLog: {
    action: string
    timestamp: string
    target: string
  }[]
}

export type TransactionType = {
  id: string
  type: "purchase" | "investment" | "withdrawal" | "deposit"
  amount: number
  status: "completed" | "pending" | "failed"
  date: string
  time: string
  user: {
    id: string
    name: string
    email: string
    avatar: string
  }
  property: {
    id: string
    title: string
    location: string
  } | null
  paymentMethod: "credit_card" | "bank_transfer" | "wallet"
  reference: string
}

export type ApprovalType = {
  id: string
  type: "property" | "withdrawal" | "kyc" | "document"
  title: string
  description: string
  status: "pending" | "approved" | "rejected"
  date: string
  time: string
  user: {
    id: string
    name: string
    email: string
    avatar: string
  }
  details: any
}

export type ReportDataType = {
  salesData: any[]
  userActivityData: any[]
  transactionTypeData: any[]
  propertyTypeData: any[]
  totalRevenue: number
  totalUsers: number
  totalProperties: number
}

// Context type
type ManagementContextType = {
  // Users
  users: UserType[]
  filteredUsers: UserType[]
  userFilter: string
  setUserFilter: (filter: string) => void
  getUser: (id: string) => UserType | undefined
  addUser: (user: Omit<UserType, "id">) => Promise<void>
  updateUser: (id: string, data: Partial<UserType>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  blacklistUser: (id: string) => Promise<void>
  unblacklistUser: (id: string) => Promise<void>

  // Admins
  admins: AdminType[]
  filteredAdmins: AdminType[]
  adminFilter: string
  setAdminFilter: (filter: string) => void
  getAdmin: (id: string) => AdminType | undefined
  addAdmin: (admin: Omit<AdminType, "id">) => Promise<void>
  updateAdmin: (id: string, data: Partial<AdminType>) => Promise<void>
  deleteAdmin: (id: string) => Promise<void>
  suspendAdmin: (id: string) => Promise<void>
  activateAdmin: (id: string) => Promise<void>

  // Transactions
  transactions: TransactionType[]
  filteredTransactions: TransactionType[]
  transactionFilter: string
  setTransactionFilter: (filter: string) => void
  getTransaction: (id: string) => TransactionType | undefined
  approveTransaction: (id: string) => Promise<void>
  rejectTransaction: (id: string) => Promise<void>

  // Approvals
  approvals: ApprovalType[]
  filteredApprovals: ApprovalType[]
  approvalFilter: string
  setApprovalFilter: (filter: string) => void
  getApproval: (id: string) => ApprovalType | undefined
  approveRequest: (id: string) => Promise<void>
  rejectRequest: (id: string, reason: string) => Promise<void>

  // Reports
  reportData: ReportDataType
  timeRange: string
  setTimeRange: (range: string) => void
  refreshReportData: () => Promise<void>

  // Loading states
  isLoading: boolean
  isSubmitting: boolean
}

// Create context
const ManagementContext = createContext<ManagementContextType | undefined>(undefined)

// Mock data imports
import { mockUsers } from "@/lib/mock-data"
import { mockAdmins } from "@/lib/mock-data"
import { mockTransactions } from "@/lib/mock-data"
import { mockApprovals } from "@/lib/mock-data"
import { mockReportData } from "@/lib/mock-data"

// Provider component
export function ManagementProvider({ children }: { children: ReactNode }) {
  // State for each section
  const [users, setUsers] = useState<UserType[]>([])
  const [admins, setAdmins] = useState<AdminType[]>([])
  const [transactions, setTransactions] = useState<TransactionType[]>([])
  const [approvals, setApprovals] = useState<ApprovalType[]>([])
  const [reportData, setReportData] = useState<ReportDataType>({
    salesData: [],
    userActivityData: [],
    transactionTypeData: [],
    propertyTypeData: [],
    totalRevenue: 0,
    totalUsers: 0,
    totalProperties: 0,
  })

  // Filter states
  const [userFilter, setUserFilter] = useState<string>("all")
  const [adminFilter, setAdminFilter] = useState<string>("all")
  const [transactionFilter, setTransactionFilter] = useState<string>("all")
  const [approvalFilter, setApprovalFilter] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("year")

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize with mock data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      try {
        // In a real app, these would be API calls
        // setUsers(mockUsers)
        // setAdmins(mockAdmins)
        // setTransactions(mockTransactions)
        // setApprovals(mockApprovals)
        setReportData(mockReportData)
      } catch (error) {
        console.error("Failed to initialize data:", error)
        errorToast("Failed to load management data")
      } finally {
        setIsLoading(false)
      }
    }

    initData()
  }, [])

  // Filtered data based on filters
  const filteredUsers = users.filter((user) => {
    if (userFilter === "all") return true
    if (userFilter === "buyers") return user.role === "buyer"
    if (userFilter === "agents") return user.role === "agent"
    if (userFilter === "blacklisted") return user.status === "blacklisted"
    return true
  })

  const filteredAdmins = admins.filter((admin) => {
    if (adminFilter === "all") return true
    if (adminFilter === "super_admin") return admin.role === "super_admin"
    if (adminFilter === "admin") return admin.role === "admin"
    if (adminFilter === "suspended") return admin.status === "suspended"
    return true
  })

  const filteredTransactions = transactions.filter((transaction) => {
    if (transactionFilter === "all") return true
    if (transactionFilter === "purchases") return transaction.type === "purchase"
    if (transactionFilter === "investments") return transaction.type === "investment"
    if (transactionFilter === "withdrawals") return transaction.type === "withdrawal"
    if (transactionFilter === "deposits") return transaction.type === "deposit"
    if (transactionFilter === "pending") return transaction.status === "pending"
    return true
  })

  const filteredApprovals = approvals.filter((approval) => {
    if (approvalFilter === "all") return true
    if (approvalFilter === "pending") return approval.status === "pending"
    if (approvalFilter === "approved") return approval.status === "approved"
    if (approvalFilter === "rejected") return approval.status === "rejected"
    return true
  })

  // CRUD operations for Users
  const getUser = (id: string) => users.find((user) => user.id === id)

  const addUser = async (user: Omit<UserType, "id">) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      const newUser: UserType = {
        ...user,
        id: `user-${Date.now()}`,
      }
      setUsers((prev) => [...prev, newUser])
      successToast("User added successfully")
    } catch (error) {
      console.error("Failed to add user:", error)
      errorToast("Failed to add user")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateUser = async (id: string, data: Partial<UserType>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...data } : user)))
      successToast("User updated successfully")
    } catch (error) {
      console.error("Failed to update user:", error)
      errorToast("Failed to update user")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteUser = async (id: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setUsers((prev) => prev.filter((user) => user.id !== id))
      successToast("User deleted successfully")
    } catch (error) {
      console.error("Failed to delete user:", error)
      errorToast("Failed to delete user")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const blacklistUser = async (id: string) => {
    return updateUser(id, { status: "blacklisted" })
  }

  const unblacklistUser = async (id: string) => {
    return updateUser(id, { status: "active" })
  }

  // CRUD operations for Admins
  const getAdmin = (id: string) => admins.find((admin) => admin.id === id)

  const addAdmin = async (admin: Omit<AdminType, "id">) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      const newAdmin: AdminType = {
        ...admin,
        id: `admin-${Date.now()}`,
      }
      setAdmins((prev) => [...prev, newAdmin])
      successToast("Admin added successfully")
    } catch (error) {
      console.error("Failed to add admin:", error)
      errorToast("Failed to add admin")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateAdmin = async (id: string, data: Partial<AdminType>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setAdmins((prev) => prev.map((admin) => (admin.id === id ? { ...admin, ...data } : admin)))
      successToast("Admin updated successfully")
    } catch (error) {
      console.error("Failed to update admin:", error)
      errorToast("Failed to update admin")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteAdmin = async (id: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setAdmins((prev) => prev.filter((admin) => admin.id !== id))
      successToast("Admin deleted successfully")
    } catch (error) {
      console.error("Failed to delete admin:", error)
      errorToast("Failed to delete admin")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const suspendAdmin = async (id: string) => {
    return updateAdmin(id, { status: "suspended" })
  }

  const activateAdmin = async (id: string) => {
    return updateAdmin(id, { status: "active" })
  }

  // Operations for Transactions
  const getTransaction = (id: string) => transactions.find((transaction) => transaction.id === id)

  const approveTransaction = async (id: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setTransactions((prev) =>
        prev.map((transaction) => (transaction.id === id ? { ...transaction, status: "completed" } : transaction)),
      )
      successToast("Transaction approved successfully")
    } catch (error) {
      console.error("Failed to approve transaction:", error)
      errorToast("Failed to approve transaction")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const rejectTransaction = async (id: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setTransactions((prev) =>
        prev.map((transaction) => (transaction.id === id ? { ...transaction, status: "failed" } : transaction)),
      )
      successToast("Transaction rejected successfully")
    } catch (error) {
      console.error("Failed to reject transaction:", error)
      errorToast("Failed to reject transaction")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Operations for Approvals
  const getApproval = (id: string) => approvals.find((approval) => approval.id === id)

  const approveRequest = async (id: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setApprovals((prev) =>
        prev.map((approval) => (approval.id === id ? { ...approval, status: "approved" } : approval)),
      )
      successToast("Request approved successfully")
    } catch (error) {
      console.error("Failed to approve request:", error)
      errorToast("Failed to approve request")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const rejectRequest = async (id: string, reason: string) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      setApprovals((prev) =>
        prev.map((approval) =>
          approval.id === id
            ? {
                ...approval,
                status: "rejected",
                rejectionReason: reason,
              }
            : approval,
        ),
      )
      successToast("Request rejected successfully")
    } catch (error) {
      console.error("Failed to reject request:", error)
      errorToast("Failed to reject request")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Operations for Reports
  const refreshReportData = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call with the timeRange
      // For now, we'll just simulate a refresh
      setReportData({ ...mockReportData })
      successToast("Report data refreshed successfully")
    } catch (error) {
      console.error("Failed to refresh report data:", error)
      errorToast("Failed to refresh report data")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    // Users
    users,
    filteredUsers,
    userFilter,
    setUserFilter,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    blacklistUser,
    unblacklistUser,

    // Admins
    admins,
    filteredAdmins,
    adminFilter,
    setAdminFilter,
    getAdmin,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    suspendAdmin,
    activateAdmin,

    // Transactions
    transactions,
    filteredTransactions,
    transactionFilter,
    setTransactionFilter,
    getTransaction,
    approveTransaction,
    rejectTransaction,

    // Approvals
    approvals,
    filteredApprovals,
    approvalFilter,
    setApprovalFilter,
    getApproval,
    approveRequest,
    rejectRequest,

    // Reports
    reportData,
    timeRange,
    setTimeRange,
    refreshReportData,

    // Loading states
    isLoading,
    isSubmitting,
  }

  return <ManagementContext.Provider value={value}>{children}</ManagementContext.Provider>
}

// Custom hook to use the context
export function useManagement() {
  const context = useContext(ManagementContext)
  if (context === undefined) {
    throw new Error("useManagement must be used within a ManagementProvider")
  }
  return context
}
