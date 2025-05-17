"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OTPVerification } from "@/components/security/otp-verification";
import { useOTP } from "@/components/security/useOtp";
import { apiConfig } from "@/lib/api";
import TransferMoneyPage from "@/components/wallet/transfer-money-page";

export default function TransferMoney() {
  const router = useRouter();
  const [pageLoaded, setPageLoaded] = useState(false);

  // Use the OTP hook with real API calls
  const {
    isOTPActive,
    isVerified,
    expiresAt,
    requestOTP,
    verifyOTP,
    onSuccess,
  } = useOTP({
    autoTrigger: true,
  });

  // Set page as loaded after a small delay to ensure smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Prevent navigation if not verified
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isVerified) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isVerified]);

  return (
    <>
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

      <TransferMoneyPage />
    </>
  );
}
