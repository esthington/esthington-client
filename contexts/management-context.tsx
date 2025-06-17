"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  AdminData,
  UserFilter,
  AdminFilter,
  UserStats,
} from "@/types/user-management";
import { UserRole, UserStatus } from "./auth-context";



// Updated types to match backend
export type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isActive: boolean;
  agentRank?: string;
  businessName?: string;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  permissions?: string[];
  walletBalance?: number;
};

export type AdminType = {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  permissions?: string[];
};

export type TransactionType = {
  id: string;
  type: "purchase" | "investment" | "withdrawal" | "deposit";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  time: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  property: {
    id: string;
    title: string;
    location: string;
  } | null;
  paymentMethod: "credit_card" | "bank_transfer" | "wallet";
  reference: string;
};

export type ApprovalType = {
  id: string;
  type: "property" | "withdrawal" | "kyc" | "document";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  time: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  details: any;
};

export type ReportDataType = {
  salesData: any[];
  userActivityData: any[];
  transactionTypeData: any[];
  propertyTypeData: any[];
  totalRevenue: number;
  totalUsers: number;
  totalProperties: number;
};

// Context type
type ManagementContextType = {
  // Users
  users: UserType[];
  filteredUsers: UserType[];
  userFilter: UserFilter;
  setUserFilter: (filter: UserFilter) => void;
  userStats: UserStats | null;
  getUser: (id: string) => UserType | undefined;
  addUser: (user: Partial<UserType>) => Promise<void>;
  updateUser: (id: string, data: Partial<UserType>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  blacklistUser: (id: string) => Promise<void>;
  unblacklistUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string) => Promise<{ tempPassword: string }>;
  verifyUser: (id: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchUserStats: () => Promise<void>;

  // Admins
  admins: AdminType[];
  filteredAdmins: AdminType[];
  adminFilter: AdminFilter;
  setAdminFilter: (filter: AdminFilter) => void;
  getAdmin: (id: string) => AdminType | undefined;
  addAdmin: (
    admin: AdminData
  ) => Promise<{ admin: AdminType; tempPassword?: string }>;
  updateAdmin: (id: string, data: Partial<AdminType>) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  suspendAdmin: (id: string) => Promise<void>;
  activateAdmin: (id: string) => Promise<void>;
  resetAdminPassword: (id: string) => Promise<{ tempPassword: string }>;
  fetchAdmins: () => Promise<void>;

  // Transactions
  transactions: TransactionType[];
  filteredTransactions: TransactionType[];
  transactionFilter: string;
  setTransactionFilter: (filter: string) => void;
  getTransaction: (id: string) => TransactionType | undefined;
  approveTransaction: (id: string) => Promise<void>;
  rejectTransaction: (id: string) => Promise<void>;

  // Approvals
  approvals: ApprovalType[];
  filteredApprovals: ApprovalType[];
  approvalFilter: string;
  setApprovalFilter: (filter: string) => void;
  getApproval: (id: string) => ApprovalType | undefined;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;

  // Reports
  reportData: ReportDataType;
  timeRange: string;
  setTimeRange: (range: string) => void;
  refreshReportData: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  usersLoading: boolean;
  adminsLoading: boolean;
};

// Create context
const ManagementContext = createContext<ManagementContextType | undefined>(
  undefined
);

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/admin${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
};

// Provider component
export function ManagementProvider({ children }: { children: ReactNode }) {
  // State for each section
  const [users, setUsers] = useState<UserType[]>([]);
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [approvals, setApprovals] = useState<ApprovalType[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [reportData, setReportData] = useState<ReportDataType>({
    salesData: [],
    userActivityData: [],
    transactionTypeData: [],
    propertyTypeData: [],
    totalRevenue: 0,
    totalUsers: 0,
    totalProperties: 0,
  });

  // Filter states
  const [userFilter, setUserFilter] = useState<UserFilter>({});
  const [adminFilter, setAdminFilter] = useState<AdminFilter>({});
  const [transactionFilter, setTransactionFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("year");

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [adminsLoading, setAdminsLoading] = useState<boolean>(false);

  // Filtered data based on filters
  const filteredUsers = users.filter((user) => {
    if (userFilter.role && user.role !== userFilter.role) return false;
    if (userFilter.status && user.status !== userFilter.status) return false;
    if (
      userFilter.verified !== undefined &&
      user.isEmailVerified !== userFilter.verified
    )
      return false;
    if (userFilter.search) {
      const searchLower = userFilter.search.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      if (
        !fullName.includes(searchLower) &&
        !user.email.toLowerCase().includes(searchLower) &&
        !user.userName.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const filteredAdmins = admins.filter((admin) => {
    if (adminFilter.role && admin.role !== adminFilter.role) return false;
    if (adminFilter.status === "active" && !admin.isActive) return false;
    if (adminFilter.status === "inactive" && admin.isActive) return false;
    if (adminFilter.search) {
      const searchLower = adminFilter.search.toLowerCase();
      const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
      if (
        !fullName.includes(searchLower) &&
        !admin.email.toLowerCase().includes(searchLower) &&
        !admin.userName.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const filteredTransactions = transactions.filter((transaction) => {
    if (transactionFilter === "all") return true;
    if (transactionFilter === "purchases")
      return transaction.type === "purchase";
    if (transactionFilter === "investments")
      return transaction.type === "investment";
    if (transactionFilter === "withdrawals")
      return transaction.type === "withdrawal";
    if (transactionFilter === "deposits") return transaction.type === "deposit";
    if (transactionFilter === "pending")
      return transaction.status === "pending";
    return true;
  });

  const filteredApprovals = approvals.filter((approval) => {
    if (approvalFilter === "all") return true;
    if (approvalFilter === "pending") return approval.status === "pending";
    if (approvalFilter === "approved") return approval.status === "approved";
    if (approvalFilter === "rejected") return approval.status === "rejected";
    return true;
  });

  // User operations
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userFilter.role) params.append("role", userFilter.role);
      if (userFilter.status) params.append("status", userFilter.status);
      if (userFilter.verified !== undefined)
        params.append("verified", userFilter.verified.toString());
      if (userFilter.search) params.append("search", userFilter.search);
      if (userFilter.page) params.append("page", userFilter.page.toString());
      if (userFilter.limit) params.append("limit", userFilter.limit.toString());

      const data = await apiCall(`/users?${params.toString()}`);
      setUsers(data.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const data = await apiCall("/users/stats");
      setUserStats(data.data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const getUser = (id: string) => users.find((user) => user._id === id);

  const addUser = async (userData: Partial<UserType>) => {
    setIsSubmitting(true);
    try {
      const data = await apiCall("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      setUsers((prev) => [...prev, data.data.user]);
      toast.success("User added successfully");
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<UserType>) => {
    setIsSubmitting(true);
    try {
      const data = await apiCall(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(userData),
      });
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? data.data.user : user))
      );
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsSubmitting(true);
    try {
      await apiCall(`/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const blacklistUser = async (id: string) => {
    return updateUser(id, { status: UserStatus.BLACKLISTED });
  };

  const unblacklistUser = async (id: string) => {
    return updateUser(id, { status: UserStatus.ACTIVE });
  };

  const resetUserPassword = async (id: string) => {
    setIsSubmitting(true);
    try {
      const data = await apiCall(`/users/${id}/reset-password`, {
        method: "PATCH",
      });
      toast.success("Password reset successfully");
      return { tempPassword: data.data.tempPassword };
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyUser = async (id: string) => {
    setIsSubmitting(true);
    try {
      await apiCall(`/users/${id}/verify`, { method: "PATCH" });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, isEmailVerified: true } : user
        )
      );
      toast.success("User verified successfully");
    } catch (error) {
      console.error("Failed to verify user:", error);
      toast.error("Failed to verify user");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin operations
  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const params = new URLSearchParams();
      if (adminFilter.role) params.append("role", adminFilter.role);
      if (adminFilter.status) params.append("status", adminFilter.status);
      if (adminFilter.search) params.append("search", adminFilter.search);
      if (adminFilter.page) params.append("page", adminFilter.page.toString());
      if (adminFilter.limit)
        params.append("limit", adminFilter.limit.toString());

      const data = await apiCall(`/admins?${params.toString()}`);
      setAdmins(data.data.admins);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      toast.error("Failed to load admins");
    } finally {
      setAdminsLoading(false);
    }
  };

  const getAdmin = (id: string) => admins.find((admin) => admin._id === id);

  const addAdmin = async (adminData: AdminData) => {
    setIsSubmitting(true);
    try {
      const data = await apiCall("/admins", {
        method: "POST",
        body: JSON.stringify(adminData),
      });
      setAdmins((prev) => [...prev, data.data.admin]);
      toast.success("Admin added successfully");
      return { admin: data.data.admin, tempPassword: data.data.tempPassword };
    } catch (error) {
      console.error("Failed to add admin:", error);
      toast.error("Failed to add admin");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAdmin = async (id: string, adminData: Partial<AdminType>) => {
    setIsSubmitting(true);
    try {
      const data = await apiCall(`/admins/${id}`, {
        method: "PATCH",
        body: JSON.stringify(adminData),
      });
      setAdmins((prev) =>
        prev.map((admin) => (admin._id === id ? data.data.admin : admin))
      );
      toast.success("Admin updated successfully");
    } catch (error) {
      console.error("Failed to update admin:", error);
      toast.error("Failed to update admin");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAdmin = async (id: string) => {
    setIsSubmitting(true);
    try {
      await apiCall(`/admins/${id}`, { method: "DELETE" });
      setAdmins((prev) => prev.filter((admin) => admin._id !== id));
      toast.success("Admin deleted successfully");
    } catch (error) {
      console.error("Failed to delete admin:", error);
      toast.error("Failed to delete admin");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const suspendAdmin = async (id: string) => {
    return updateAdmin(id, { isActive: false });
  };

  const activateAdmin = async (id: string) => {
    return updateAdmin(id, { isActive: true });
  };

  const resetAdminPassword = async (id: string) => {
    setIsSubmitting(true);
    try {
      const data = await apiCall(`/admins/${id}/reset-password`, {
        method: "PATCH",
      });
      toast.success("Password reset successfully");
      return { tempPassword: data.data.tempPassword };
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transaction operations (placeholder - implement when needed)
  const getTransaction = (id: string) =>
    transactions.find((transaction) => transaction.id === id);

  const approveTransaction = async (id: string) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id
            ? { ...transaction, status: "completed" }
            : transaction
        )
      );
      toast.success("Transaction approved successfully");
    } catch (error) {
      console.error("Failed to approve transaction:", error);
      toast.error("Failed to approve transaction");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectTransaction = async (id: string) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id
            ? { ...transaction, status: "failed" }
            : transaction
        )
      );
      toast.success("Transaction rejected successfully");
    } catch (error) {
      console.error("Failed to reject transaction:", error);
      toast.error("Failed to reject transaction");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approval operations (placeholder - implement when needed)
  const getApproval = (id: string) =>
    approvals.find((approval) => approval.id === id);

  const approveRequest = async (id: string) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      setApprovals((prev) =>
        prev.map((approval) =>
          approval.id === id ? { ...approval, status: "approved" } : approval
        )
      );
      toast.success("Request approved successfully");
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast.error("Failed to approve request");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectRequest = async (id: string, reason: string) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      setApprovals((prev) =>
        prev.map((approval) =>
          approval.id === id
            ? {
                ...approval,
                status: "rejected",
                rejectionReason: reason,
              }
            : approval
        )
      );
      toast.success("Request rejected successfully");
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to reject request");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Report operations (placeholder - implement when needed)
  const refreshReportData = async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      toast.success("Report data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh report data:", error);
      toast.error("Failed to refresh report data");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // Only fetch if we have a token (user is authenticated)
        const token = localStorage.getItem("token");
        if (token) {
          await Promise.all([fetchUsers(), fetchUserStats(), fetchAdmins()]);
        }
      } catch (error) {
        console.error("Failed to initialize data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Refetch users when filter changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUsers();
    }
  }, [userFilter]);

  // Refetch admins when filter changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAdmins();
    }
  }, [adminFilter]);

  const value = {
    // Users
    users,
    filteredUsers,
    userFilter,
    setUserFilter,
    userStats,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    blacklistUser,
    unblacklistUser,
    resetUserPassword,
    verifyUser,
    fetchUsers,
    fetchUserStats,

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
    resetAdminPassword,
    fetchAdmins,

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
    usersLoading,
    adminsLoading,
  };

  return (
    <ManagementContext.Provider value={value}>
      {children}
    </ManagementContext.Provider>
  );
}

// Custom hook to use the context
export function useManagement() {
  const context = useContext(ManagementContext);
  if (context === undefined) {
    throw new Error("useManagement must be used within a ManagementProvider");
  }
  return context;
}
