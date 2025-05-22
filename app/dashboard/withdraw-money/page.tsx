"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OTPVerification } from "@/components/security/otp-verification";
import { useOTP } from "@/components/security/useOtp";
import WithdrawMoneyPage from "@/components/wallet/withdraw-money-page";

export default function WithdrawMoney() {
  const router = useRouter();
  const [pageLoaded, setPageLoaded] = useState(false);

  // Use the OTP hook with autoTrigger set to false
  const {
    isOTPActive,
    isVerified,
    expiresAt,
    requestOTP,
    verifyOTP,
    onSuccess,
    isWithinValidityPeriod,
    checkValidityPeriod,
  } = useOTP({
    autoTrigger: false, // Don't auto-trigger OTP request
  });

  // Set page as loaded after a small delay to ensure smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check validity period when component mounts
  useEffect(() => {
    if (pageLoaded) {
      checkValidityPeriod();
    }
  }, [pageLoaded, checkValidityPeriod]);

  // Prevent navigation if not verified and not within validity period
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isVerified && !isWithinValidityPeriod) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isVerified, isWithinValidityPeriod]);

  return (
    <>
      {/* Only show OTP verification if not within validity period */}
      {!isWithinValidityPeriod && (
        <OTPVerification
          title="Security Verification Required"
          description="For your security, please enter the verification code sent to your registered email address."
          length={6}
          isActive={pageLoaded && isOTPActive && !isVerified}
          onVerify={verifyOTP}
          onResend={requestOTP}
          onSuccess={onSuccess}
          expiresAt={expiresAt}
        />
      )}

      <WithdrawMoneyPage />
    </>
  );
}
