"use client";

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

  // Computed properties
  const isAuthenticated = !!user;
  const isBuyer = user?.role === "buyer";
  const isAgent = user?.role === "agent";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check for token in cookies
        const token = cookie.get("esToken");

        console.log("token", token);

        if (token) {
          // Validate token and get user data
          try {
            const response = await apiConfig.get("/auth/me", {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            console.log("data", response.data.user);
            if (response.status === 200) {
              console.log("User before update:", response.data.user);
              setUser(response.data.user);
            } else {
              cookie.remove("esToken");
              setUser(null);
            }
          } catch (error) {
            // console.error("Failed to fetch user data:", error);
            cookie.remove("esToken");
            setUser(null);
          }
        } 
      } catch (error) {
        // console.error("Failed to initialize auth:", error);
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
        console.log("User before update:", response.data.user);

        if (user) {
          setUser(response.data.user);
          // setUser({ ...user, ...data });
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
