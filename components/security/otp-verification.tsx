"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OTPVerificationProps {
  /**
   * Title of the OTP verification modal
   */
  title?: string;
  /**
   * Description text for the OTP verification
   */
  description?: string;
  /**
   * Number of digits in the OTP code
   */
  length?: number;
  /**
   * Function to verify the OTP code
   * @param otp - The OTP code entered by the user
   * @returns Promise<boolean> - Whether the OTP is valid
   */
  onVerify: (otp: string) => Promise<boolean>;
  /**
   * Function to resend the OTP code
   * @returns Promise<void>
   */
  onResend: () => Promise<void>;
  /**
   * Function called when verification is successful
   */
  onSuccess?: () => void;
  /**
   * Whether the OTP verification is active
   */
  isActive: boolean;
  /**
   * OTP expiration time
   */
  expiresAt?: Date;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  title = "Security Verification",
  description = "Please enter the verification code sent to your registered email address.",
  length = 6,
  onVerify,
  onResend,
  onSuccess,
  isActive,
  expiresAt,
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  // Add state to track if code has been requested
  const [codeRequested, setCodeRequested] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Handle cooldown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle expiration timer
  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = Math.max(
        0,
        Math.floor((expiry.getTime() - now.getTime()) / 1000)
      );
      return diff;
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Show expiration message if OTP has expired
        setError("Verification code has expired. Please request a new one.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Reset state when modal becomes active
  useEffect(() => {
    if (isActive) {
      setOtpValues(Array(length).fill(""));
      setIsSuccess(false);
      setError(null);
      // Don't reset codeRequested here to maintain the state
    }
  }, [isActive, length]);

  // Focus first input when modal opens and code is requested
  useEffect(() => {
    if (isActive && codeRequested && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isActive, codeRequested]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    // Take only the last character if multiple characters are pasted
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);
    setError(null);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    const isLastInput = index === length - 1;
    const allFilled = newOtpValues.every((val) => val !== "");
    if (isLastInput && allFilled && value) {
      handleVerify();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle left arrow key
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow key
    else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is all digits and matches expected length
    if (!/^\d+$/.test(pastedData)) {
      toast.error("Only numbers are allowed");
      return;
    }

    const digits = pastedData.slice(0, length).split("");
    const newOtpValues = [...otpValues];

    digits.forEach((digit, index) => {
      if (index < length) {
        newOtpValues[index] = digit;
      }
    });

    setOtpValues(newOtpValues);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtpValues.findIndex((val) => val === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
      // Auto-submit if all fields are filled
      if (newOtpValues.every((val) => val !== "")) {
        setTimeout(() => handleVerify(), 100);
      }
    }
  };

  const handleVerify = async () => {
    const otp = otpValues.join("");
    if (otp.length !== length) {
      setError(`Please enter all ${length} digits`);
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await onVerify(otp);

      if (isValid) {
        setIsSuccess(true);
        toast.success("Verification successful");

        // Call onSuccess after a short delay to show the success animation
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setError("Invalid verification code. Please try again.");
        // Clear the inputs on failure
        setOtpValues(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await onResend();
      setCodeRequested(true); // Set code as requested
      toast.success("Verification code sent successfully");
      setCooldown(60); // 60 seconds cooldown

      // Clear the inputs
      setOtpValues(Array(length).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to send verification code");
    } finally {
      setIsResending(false);
    }
  };

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md p-6 mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[4px]"></div>
                <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Verification Successful
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-center">
                Your identity has been verified successfully.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[4px]"></div>
                  <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 p-3 rounded-full">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  {description}
                </p>

                {timeRemaining !== null &&
                  timeRemaining > 0 &&
                  codeRequested && (
                    <div className="mt-2 text-sm font-medium">
                      <span className="text-amber-600 dark:text-amber-400">
                        Expires in: {formatTimeRemaining(timeRemaining)}
                      </span>
                    </div>
                  )}
              </div>

              <div className="flex flex-col items-center space-y-6">
                {codeRequested ? (
                  <>
                    <div className="flex justify-center gap-2">
                      {otpValues.map((value, index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-12 h-14 text-center text-xl font-bold rounded-xl border-slate-200 dark:border-slate-700 focus:border-violet-300 focus:ring-violet-300 dark:focus:border-violet-600 dark:focus:ring-violet-600 shadow-sm"
                        />
                      ))}
                    </div>

                    {error && (
                      <div className="flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {error}
                      </div>
                    )}

                    <div className="w-full space-y-4">
                      <Button
                        onClick={handleVerify}
                        disabled={
                          isVerifying || otpValues.some((val) => val === "")
                        }
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
                      >
                        {isVerifying ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Verifying...
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>

                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          onClick={handleResend}
                          disabled={isResending || cooldown > 0}
                          className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {cooldown > 0
                            ? `Resend in ${cooldown}s`
                            : "Resend Code"}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full">
                    <Button
                      onClick={handleResend}
                      disabled={isResending}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
                    >
                      {isResending ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Request Verification Code"
                      )}
                    </Button>

                    {error && (
                      <div className="flex items-center text-red-500 text-sm mt-4">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
