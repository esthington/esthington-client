"use client";

import { apiConfig } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseOTPOptions {
  /**
   * Whether to automatically trigger OTP verification when the component mounts
   */
  autoTrigger?: boolean;
  /**
   * Custom request OTP function (optional)
   */
  customRequestOTP?: () => Promise<{ expiresAt: Date }>;
  /**
   * Custom verify OTP function (optional)
   */
  customVerifyOTP?: (otp: string) => Promise<boolean>;
}

export const useOTP = ({
  autoTrigger = true,
  customRequestOTP,
  customVerifyOTP,
}: UseOTPOptions = {}) => {
  const [isOTPActive, setIsOTPActive] = useState(autoTrigger);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);

  // Auto-trigger OTP request on mount if enabled
  useEffect(() => {
    if (autoTrigger) {
      handleRequestOTP();
    }
  }, [autoTrigger]);

  const handleRequestOTP = async () => {
    setIsLoading(true);
    try {
      let response;

      if (customRequestOTP) {
        response = await customRequestOTP();
      } else {
        // Use the real API endpoint
        const apiResponse = await apiConfig.post(
          "/security/request-otp",
          {},
          { withCredentials: true }
        );
        response = apiResponse.data;
      }

      setIsOTPActive(true);

      // Set expiration time if available
      if (response && response.expiresAt) {
        setExpiresAt(new Date(response.expiresAt));
      }

      return response;
    } catch (error) {
      console.error("Failed to request OTP:", error);
      toast.error("Failed to request verification code", {
        description:
          "Please try again or contact support if the issue persists.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      let isValid;

      if (customVerifyOTP) {
        isValid = await customVerifyOTP(otp);
      } else {
        // Use the real API endpoint

        console.log("Verifying OTP:", otp);
        // Send the OTP to the server for verification
        const response = await apiConfig.post(
          "/security/verify-otp",
          { otp },
          { withCredentials: true }
        );
        console.log("OTP verification response:", response);
        isValid = response.data.success;
      }

      if (isValid) {
        setIsVerified(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsOTPActive(false);
  };

  return {
    isOTPActive,
    isVerified,
    isLoading,
    expiresAt,
    showOTP: () => setIsOTPActive(true),
    hideOTP: () => setIsOTPActive(false),
    resetOTP: () => {
      setIsVerified(false);
      setIsOTPActive(autoTrigger);
    },
    requestOTP: handleRequestOTP,
    verifyOTP: handleVerifyOTP,
    onSuccess: handleSuccess,
  };
};
