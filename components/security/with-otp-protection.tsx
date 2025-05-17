"use client";

import type { ComponentType } from "react";
import { OTPVerification } from "@/components/security/otp-verification";
import { useOTP } from "./useOtp";

interface WithOTPProtectionProps {
  /**
   * Custom request OTP function (optional)
   */
  customRequestOTP?: () => Promise<{ expiresAt: Date }>;
  /**
   * Custom verify OTP function (optional)
   */
  customVerifyOTP?: (otp: string) => Promise<boolean>;
  /**
   * Title for the OTP verification modal
   */
  title?: string;
  /**
   * Description for the OTP verification modal
   */
  description?: string;
  /**
   * Number of digits in the OTP code
   */
  otpLength?: number;
}

/**
 * Higher-order component that adds OTP verification to a page or component
 */
export function withOTPProtection<P extends object>({
  customRequestOTP,
  customVerifyOTP,
  title,
  description,
  otpLength = 6,
}: WithOTPProtectionProps = {}) {
  return (Component: ComponentType<P>) => {
    const WithOTPProtection = (props: P) => {
      const {
        isOTPActive,
        isVerified,
        expiresAt,
        requestOTP: handleRequestOTP,
        verifyOTP: handleVerifyOTP,
        onSuccess,
      } = useOTP({
        autoTrigger: true,
        customRequestOTP,
        customVerifyOTP,
      });

      const handleResendOTP = async () => {
        try {
          await handleRequestOTP();
          return Promise.resolve();
        } catch (error) {
          console.error("Failed to resend OTP:", error);
          return Promise.reject(error);
        }
      };

      return (
        <>
          <OTPVerification
            title={title || "Security Verification Required"}
            description={
              description ||
              "For your security, please enter the verification code sent to your registered email address."
            }
            length={otpLength}
            isActive={isOTPActive && !isVerified}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onSuccess={onSuccess}
            expiresAt={expiresAt}
          />

          <Component {...props} />
        </>
      );
    };

    WithOTPProtection.displayName = `withOTPProtection(${
      Component.displayName || Component.name || "Component"
    })`;

    return WithOTPProtection;
  };
}
