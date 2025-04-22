import { apiConfig } from "./api-config";
import cookie from "js-cookie";

export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiConfig.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Store token in cookie
      cookie.set("esToken", token, { expires: 7 }); // Expires in 7 days

      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  },

  logout: () => {
    cookie.remove("esToken");
    return { success: true };
  },

  register: async (userData: any) => {
    try {
      const response = await apiConfig.post("/auth/register", userData);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiConfig.get("/auth/me");
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, error: "Failed to get user information." };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiConfig.post("/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to send password reset email.",
      };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await apiConfig.post("/auth/reset-password", {
        token,
        password,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reset password.",
      };
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await apiConfig.post("/auth/verify-email", { token });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Verify email error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to verify email.",
      };
    }
  },

  resendVerificationEmail: async () => {
    try {
      const response = await apiConfig.post("/auth/resend-verification");
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Resend verification email error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to resend verification email.",
      };
    }
  },

  updateProfile: async (userData: any) => {
    try {
      const response = await apiConfig.put("/auth/profile", userData);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update profile.",
      };
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiConfig.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to change password.",
      };
    }
  },
};
