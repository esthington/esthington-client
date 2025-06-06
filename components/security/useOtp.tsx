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
  autoTrigger = false, // Changed default to false
  customRequestOTP,
  customVerifyOTP,
}: UseOTPOptions = {}) => {
  const [isOTPActive, setIsOTPActive] = useState(autoTrigger);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  // Add state to track if the code has been requested
  const [codeRequested, setCodeRequested] = useState(false);
  // Add state to track validity period
  const [isWithinValidityPeriod, setIsWithinValidityPeriod] = useState(false);

  // Check validity period on mount
  useEffect(() => {
    if (autoTrigger) {
      checkValidityPeriod();
    }
  }, [autoTrigger]);

  // Function to check if user is within OTP validity period
  const checkValidityPeriod = async () => {
    try {
      const response = await apiConfig.get("/security/check-validity-period", {
        withCredentials: true,
      });

      const isValid = response.data.isValid;
      setIsWithinValidityPeriod(isValid);

      if (isValid) {
        // If within validity period, user is considered verified
        setIsVerified(true);
        setIsOTPActive(false);
      } else {
        // If not within validity period, activate OTP but don't request yet
        setIsOTPActive(true);
      }

      return isValid;
    } catch (error) {
      console.error("Failed to check validity period:", error);
      setIsWithinValidityPeriod(false);
      setIsOTPActive(true);
      return false;
    }
  };

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
      setCodeRequested(true); // Set code as requested

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

  // Change the onSuccess function to not require a parameter
  const handleSuccess = () => {
    setIsOTPActive(false);
  };

  // Update the return object
  return {
    isOTPActive,
    isVerified,
    isLoading,
    expiresAt,
    isWithinValidityPeriod,
    codeRequested,
    showOTP: () => setIsOTPActive(true),
    hideOTP: () => setIsOTPActive(false),
    resetOTP: () => {
      setIsVerified(false);
      setIsOTPActive(autoTrigger);
      setCodeRequested(false);
    },
    requestOTP: handleRequestOTP,
    verifyOTP: handleVerifyOTP,
    onSuccess: handleSuccess, // This now matches the expected type
    checkValidityPeriod,
  };
};
