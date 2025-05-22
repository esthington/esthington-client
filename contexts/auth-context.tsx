"use client";

import { useMemo } from "react";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import cookie from "js-cookie";
import { apiConfig } from "@/lib/api";

// Types for authentication
export type UserRole = "buyer" | "agent" | "admin" | "super_admin";
export type AgentRank = "Bronze" | "Silver" | "Gold" | "Platinum";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avatar: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: UserRole;
  isEmailVerified: boolean;
  hasSeenSplash: boolean;
  onboardingCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  agentRank?: AgentRank;
  referralCode?: string;
  businessName?: string;
  licenseNumber?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  specializations?: string[];
  permissions?: string[];
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  firstName?: string;
  lastName?: string;
  userName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  referralCode?: string;
  licenseNumber?: string; // For agents
};

export type ResetPasswordData = {
  token: string;
  password: string;
  confirmPassword: string;
};

// User management types
export type UserFilter = {
  search?: string;
  role?: UserRole | string;
  status?: "active" | "inactive" | "blacklisted" | "suspended" | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type AdminData = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone?: string;
  role: "admin" | "super_admin";
  permissions?: string[];
};

// Context type
type AuthContextType = {
  // User state
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  resetUserPassword: (userId: string) => Promise<{ tempPassword: string }>;

  // User management
  users: UserProfile[];
  usersLoading: boolean;
  usersError: string | null;
  userFilter: UserFilter;
  setUserFilter: (
    filter: UserFilter | ((prev: UserFilter) => UserFilter)
  ) => void;
  filteredUsers: UserProfile[];
  totalUsers: number;
  getUsers: () => Promise<UserProfile[]>;
  getUserById: (id: string) => Promise<UserProfile | null>;
  addUser: (data: Partial<UserProfile>) => Promise<boolean>;
  updateUser: (id: string, data: Partial<UserProfile>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  blacklistUser: (id: string) => Promise<boolean>;
  unblacklistUser: (id: string) => Promise<boolean>;
  suspendUser: (id: string) => Promise<boolean>;
  activateUser: (id: string) => Promise<boolean>;

  // Admin management
  admins: UserProfile[];
  adminsLoading: boolean;
  adminsError: string | null;
  adminFilter: UserFilter;
  setAdminFilter: (
    filter: UserFilter | string | ((prev: UserFilter) => UserFilter)
  ) => void;
  filteredAdmins: UserProfile[];
  totalAdmins: number;
  getAdmins: () => Promise<void>;
  getAdminById: (id: string) => Promise<UserProfile | null>;
  addAdmin: (data: AdminData) => Promise<boolean>;
  updateAdmin: (id: string, data: Partial<AdminData>) => Promise<boolean>;
  deleteAdmin: (id: string) => Promise<boolean>;
  suspendAdmin: (id: string) => Promise<boolean>;
  activateAdmin: (id: string) => Promise<boolean>;

  // Role checks
  isBuyer: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // User management state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<UserFilter>({
    search: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Admin management state
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [adminsLoading, setAdminsLoading] = useState<boolean>(false);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [adminFilter, setAdminFilter] = useState<UserFilter>({
    search: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });
  const [totalAdmins, setTotalAdmins] = useState<number>(0);

  // Computed properties
  const isAuthenticated = !!user;
  const isBuyer = user?.role === "buyer";
  const isAgent = user?.role === "agent";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  // Filter users based on current filter
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by search term
    if (userFilter.search) {
      const searchLower = userFilter.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.userName &&
            user.userName.toLowerCase().includes(searchLower)) ||
          (user.role && user.role.toLowerCase().includes(searchLower))
      );
    }

    // Filter by role
    if (userFilter.role && userFilter.role !== "all") {
      filtered = filtered.filter((user) => user.role === userFilter.role);
    }

    // Filter by status
    if (userFilter.status) {
      if (userFilter.status === "active") {
        filtered = filtered.filter((user) => user.isActive);
      } else if (
        userFilter.status === "inactive" ||
        userFilter.status === "blacklisted" ||
        userFilter.status === "suspended"
      ) {
        filtered = filtered.filter((user) => !user.isActive);
      }
    }

    return filtered;
  }, [users, userFilter]);

  // Filter admins based on current filter
  const filteredAdmins = useMemo(() => {
    let filtered = [...admins];

    // Filter by search term
    if (adminFilter.search) {
      const searchLower = adminFilter.search.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.firstName.toLowerCase().includes(searchLower) ||
          admin.lastName.toLowerCase().includes(searchLower) ||
          admin.email.toLowerCase().includes(searchLower) ||
          (admin.userName && admin.userName.toLowerCase().includes(searchLower))
      );
    }

    // Filter by role
    if (adminFilter.role && adminFilter.role !== "all") {
      filtered = filtered.filter((admin) => admin.role === adminFilter.role);
    }

    // Filter by status
    if (adminFilter.status === "suspended") {
      filtered = filtered.filter((admin) => !admin.isActive);
    }

    return filtered;
  }, [admins, adminFilter]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check for token in cookies
        const token = cookie.get("esToken");

        if (token) {
          // Validate token and get user data
          try {
            const response = await apiConfig.get("/auth/me", {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.status === 200) {
              setUser(response.data.user);
            } else {
              cookie.remove("esToken");
              setUser(null);
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            cookie.remove("esToken");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        cookie.remove("esToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.post("/auth/login", credentials, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUser(response.data.user);

        // Check if email is verified
        if (!response.data.user.isEmailVerified) {
          router.push("/account-verify");
        } else {
          router.push("/dashboard");
        }

        toast.success("Login successful");
        return true;
      } else {
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register
  const register = async (data: RegisterData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const endpoint =
        data.role === "agent" ? "/auth/agent/register" : "/auth/buyer/register";

      const response = await apiConfig.post(endpoint, data, {
        withCredentials: true,
      });

      if (response.status === 201) {
        toast.success(
          "Registration successful. Please check your email for verification."
        );
        router.push("/account-verify");
        return true;
      } else {
        toast.error(
          response.data?.message || "Registration failed. Please try again."
        );
        return false;
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await apiConfig.post("/auth/logout", {}, { withCredentials: true });

      // Clear user state and cookie
      setUser(null);
      cookie.remove("esToken");

      // Redirect to login
      router.push("/signin");
      toast.success("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.post(
        "/auth/forgot-password",
        { email },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Password reset email sent. Please check your inbox.");
        return true;
      } else {
        toast.error(
          response.data?.message ||
            "Failed to send reset email. Please try again."
        );
        return false;
      }
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset password
  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.post(
        "/auth/reset-password",
        {
          token: data.token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success(
          "Password reset successful. You can now login with your new password."
        );
        router.push("/signin");
        return true;
      } else {
        toast.error(
          response.data?.message ||
            "Failed to reset password. Please try again."
        );
        return false;
      }
    } catch (error: any) {
      console.error("Reset password failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify email
  const verifyEmail = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.post(
        "/auth/user/account-verify",
        {
          verificationToken: token,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update user if already logged in
        if (user) {
          setUser({ ...user, isEmailVerified: true });
        }

        toast.success("Email verification successful.");
        return true;
      } else {
        toast.error(
          response.data?.message || "Failed to verify email. Please try again."
        );
        return false;
      }
    } catch (error: any) {
      console.error("Email verification failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to verify email. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (!user?.email) {
        toast.error("No email address available to send verification.");
        return false;
      }

      const response = await apiConfig.post("/auth/resend-verification", {
        email: user.email,
      });

      if (response.status === 200) {
        toast.success("Verification email sent. Please check your inbox.");
        return true;
      } else {
        toast.error(
          response.data?.message || "Failed to send verification email."
        );
        return false;
      }
    } catch (error: any) {
      console.error("Resend verification email failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to send verification email. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update profile
  const updateProfile = async (
    data: Partial<UserProfile>
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.put("/auth/profile", data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update user
        if (user) {
          setUser(response.data.user);
        }

        toast.success("Profile updated successfully.");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to update profile.");
        return false;
      }
    } catch (error: any) {
      console.error("Update profile failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Password changed successfully.");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to change password.");
        return false;
      }
    } catch (error: any) {
      console.error("Change password failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to change password. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset user password (admin function)
  const resetUserPassword = async (
    userId: string
  ): Promise<{ tempPassword: string }> => {
    setIsSubmitting(true);
    try {
      const response = await apiConfig.post(
        `/admin/users/${userId}/reset-password`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Password reset successfully.");
        return { tempPassword: response.data.tempPassword };
      } else {
        toast.error(response.data?.message || "Failed to reset password.");
        throw new Error("Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset user password failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // User Management Functions
  const getUsers = async (): Promise<UserProfile[]> => {
    if (!isAdmin) return [];

    setUsersLoading(true);
    setUsersError(null);

    try {
      // Build query params from filter
      const params = new URLSearchParams();
      if (userFilter.search) params.append("search", userFilter.search);
      if (userFilter.role) params.append("role", userFilter.role);
      if (userFilter.status) params.append("status", userFilter.status);
      if (userFilter.sortBy) params.append("sortBy", userFilter.sortBy);
      if (userFilter.sortOrder)
        params.append("sortOrder", userFilter.sortOrder);
      if (userFilter.page) params.append("page", userFilter.page.toString());
      if (userFilter.limit) params.append("limit", userFilter.limit.toString());

      const response = await apiConfig.get(
        `/admin/users?${params.toString()}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
        return response.data.users;
      } else {
        setUsersError("Failed to fetch users");
        return [];
      }
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      setUsersError(error?.response?.data?.message || "Failed to fetch users");
      return [];
    } finally {
      setUsersLoading(false);
    }
  };

  const getUserById = async (id: string): Promise<UserProfile | null> => {
    if (!isAdmin) return null;

    try {
      const response = await apiConfig.get(`/admin/users/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      return null;
    }
  };

  // Add user (admin function)
  const addUser = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!isAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.post("/admin/users", data, {
        withCredentials: true,
      });

      if (response.status === 201) {
        // Update local state
        setUsers((prevUsers) => [...prevUsers, response.data.user]);
        toast.success("User added successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to add user");
        return false;
      }
    } catch (error: any) {
      console.error("Failed to add user:", error);
      toast.error(error?.response?.data?.message || "Failed to add user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUser = async (
    id: string,
    data: Partial<UserProfile>
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(`/admin/users/${id}`, data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === id ? { ...u, ...data } : u))
        );
        toast.success("User updated successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to update user");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to update user ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to update user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.delete(`/admin/users/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
        toast.success("User deleted successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to delete user");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to delete user ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to delete user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const blacklistUser = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(
        `/admin/users/${id}/blacklist`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === id ? { ...u, isActive: false } : u))
        );
        toast.success("User blacklisted successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to blacklist user");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to blacklist user ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to blacklist user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const unblacklistUser = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(
        `/admin/users/${id}/unblacklist`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === id ? { ...u, isActive: true } : u))
        );
        toast.success("User unblacklisted successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to unblacklist user");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to unblacklist user ${id}:`, error);
      toast.error(
        error?.response?.data?.message || "Failed to unblacklist user"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const suspendUser = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(
        `/admin/users/${id}/suspend`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === id ? { ...u, isActive: false } : u))
        );
        toast.success("User suspended successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to suspend user");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to suspend user ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to suspend user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const activateUser = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(
        `/admin/users/${id}/activate`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === id ? { ...u, isActive: true } : u))
        );
        toast.success("User activated successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to activate user");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to activate user ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to activate user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Management Functions
  const getAdmins = async (): Promise<void> => {
    if (!isAdmin) return;

    setAdminsLoading(true);
    setAdminsError(null);

    try {
      // Build query params from filter
      const params = new URLSearchParams();
      if (adminFilter.search) params.append("search", adminFilter.search);
      if (adminFilter.role && adminFilter.role !== "all")
        params.append("role", adminFilter.role);
      if (adminFilter.status) params.append("status", adminFilter.status);
      if (adminFilter.sortBy) params.append("sortBy", adminFilter.sortBy);
      if (adminFilter.sortOrder)
        params.append("sortOrder", adminFilter.sortOrder);
      if (adminFilter.page) params.append("page", adminFilter.page.toString());
      if (adminFilter.limit)
        params.append("limit", adminFilter.limit.toString());

      const response = await apiConfig.get(
        `/admin/admins?${params.toString()}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setAdmins(response.data.admins);
        setTotalAdmins(response.data.total);
      } else {
        setAdminsError("Failed to fetch admins");
      }
    } catch (error: any) {
      console.error("Failed to fetch admins:", error);
      setAdminsError(
        error?.response?.data?.message || "Failed to fetch admins"
      );
    } finally {
      setAdminsLoading(false);
    }
  };

  const getAdminById = async (id: string): Promise<UserProfile | null> => {
    if (!isAdmin) return null;

    try {
      const response = await apiConfig.get(`/admin/admins/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.admin;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch admin ${id}:`, error);
      return null;
    }
  };

  const addAdmin = async (data: AdminData): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.post("/admin/admins", data, {
        withCredentials: true,
      });

      if (response.status === 201) {
        // Update local state
        setAdmins((prevAdmins) => [...prevAdmins, response.data.admin]);
        toast.success("Admin added successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to add admin");
        return false;
      }
    } catch (error: any) {
      console.error("Failed to add admin:", error);
      toast.error(error?.response?.data?.message || "Failed to add admin");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAdmin = async (
    id: string,
    data: Partial<AdminData>
  ): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(`/admin/admins/${id}`, data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        setAdmins((prevAdmins) =>
          prevAdmins.map((a) => (a.id === id ? { ...a, ...data } : a))
        );
        toast.success("Admin updated successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to update admin");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to update admin ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to update admin");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAdmin = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.delete(`/admin/admins/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        setAdmins((prevAdmins) => prevAdmins.filter((a) => a.id !== id));
        toast.success("Admin deleted successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to delete admin");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to delete admin ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to delete admin");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const suspendAdmin = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(
        `/admin/admins/${id}/suspend`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setAdmins((prevAdmins) =>
          prevAdmins.map((a) => (a.id === id ? { ...a, isActive: false } : a))
        );
        toast.success("Admin suspended successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to suspend admin");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to suspend admin ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to suspend admin");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const activateAdmin = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    setIsSubmitting(true);

    try {
      const response = await apiConfig.put(
        `/admin/admins/${id}/activate`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setAdmins((prevAdmins) =>
          prevAdmins.map((a) => (a.id === id ? { ...a, isActive: true } : a))
        );
        toast.success("Admin activated successfully");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to activate admin");
        return false;
      }
    } catch (error: any) {
      console.error(`Failed to activate admin ${id}:`, error);
      toast.error(error?.response?.data?.message || "Failed to activate admin");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle admin filter changes
  const handleAdminFilterChange = (
    filterValue: UserFilter | string | ((prev: UserFilter) => UserFilter)
  ) => {
    if (typeof filterValue === "string") {
      // If it's a string, it's likely from the tabs component
      setAdminFilter((prev) => ({
        ...prev,
        role:
          filterValue === "all"
            ? ""
            : filterValue === "super_admin"
            ? "super_admin"
            : filterValue === "admin"
            ? "admin"
            : "",
        status: filterValue === "suspended" ? "suspended" : "",
      }));
    } else {
      // Otherwise it's a filter object or function
      setAdminFilter(filterValue);
    }
  };

  // Load users and admins when authenticated and has admin role
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      getUsers();
      getAdmins();
    }
  }, [isAuthenticated, isAdmin]);

  // Refresh data when filters change
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      getUsers();
    }
  }, [userFilter, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      getAdmins();
    }
  }, [adminFilter, isAuthenticated, isAdmin]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isSubmitting,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    updateProfile,
    changePassword,
    resetUserPassword,

    // User management
    users,
    usersLoading,
    usersError,
    userFilter,
    setUserFilter,
    filteredUsers,
    totalUsers,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    blacklistUser,
    unblacklistUser,
    suspendUser,
    activateUser,

    // Admin management
    admins,
    adminsLoading,
    adminsError,
    adminFilter,
    setAdminFilter: handleAdminFilterChange,
    filteredAdmins,
    totalAdmins,
    getAdmins,
    getAdminById,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    suspendAdmin,
    activateAdmin,

    // Role checks
    isBuyer,
    isAgent,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
