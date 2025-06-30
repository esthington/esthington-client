"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Home,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import cookie from "js-cookie";
import { toast } from "sonner"; // Import toast without Toaster
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { apiConfig } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";

// Create a custom hook to manage toast calls
function useToastOnce() {
  const toastShownRef = useRef(new Set());

  interface ToastOptions {
    id?: string;
    duration?: number;
  }

  const showToast = (
    type: string,
    message: string,
    options: ToastOptions = {}
  ) => {
    const id = options.id || message;

    // Only show the toast if it hasn't been shown before
    if (!toastShownRef.current.has(id)) {
      toastShownRef.current.add(id);

      // Use the appropriate toast type
      if (type === "success") {
        toast.success(message, options);
      } else if (type === "error") {
        toast.error(message, options);
      } else {
        toast(message, options);
      }

      // Remove from set after toast duration to allow showing again later if needed
      setTimeout(() => {
        toastShownRef.current.delete(id);
      }, options.duration || 3000);
    }
  };

  return showToast;
}

function AccountVerificationPage() {
  const [status, setStatus] = useState("emailsent");
  const [loading, setLoading] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { user } = useAuth();
  const statusRef = useRef(status);
  const searchParams = useSearchParams();
  const router = useRouter();
  const showToast = useToastOnce();
  const requestInProgressRef = useRef(false);
  const verificationCheckedRef = useRef(false); // Add ref to track if verification has been checked

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const token = searchParams.get("token");

  useEffect(() => {
    // Prevent infinite loop by checking if verification has already been attempted
    if (verificationCheckedRef.current) return;

    if (user?.isEmailVerified) {
      router.replace("/dashboard");
      return;
    }

    let isMounted = true;
    const longerEXP = 1000 * 60 * 60 * 24 * 30;

    // const checkVerify = async () => {
    //   if (!token) return

    //   try {
    //     setLoading(true)
    //     setVerificationFailed(false)
    //     verificationCheckedRef.current = true // Mark verification as checked to prevent loops

    //     const response = await apiConfig.post("auth/user/verify-email", {
    //       verificationToken: token,
    //     })

    //     if (!isMounted) return // Prevent setting state on unmounted component

    //     if (response.data.type === "emailverified") {
    //       cookie.set("esToken", response.data.token, {
    //         expires: new Date(Date.now() + longerEXP),
    //       })

    //       setStatus("emailverified")
    //       showToast("success", "Email verified successfully!", {
    //         id: "email-verified-success",
    //         duration: 3000,
    //       })

    //       let count = 5
    //       const timer = setInterval(() => {
    //         count -= 1
    //         if (isMounted) {
    //           setCountdown(count)
    //         }
    //         if (count <= 0) {
    //           clearInterval(timer)
    //           if (isMounted) {
    //             router.replace("/dashboard") // Redirect to dashboard
    //           }
    //         }
    //       }, 1000)

    //       return () => {
    //         clearInterval(timer)
    //       }
    //     }

    //     if (response.data.type === "linkexpired") {
    //       cookie.set("esToken", response.data.token, {
    //         expires: new Date(Date.now() + longerEXP),
    //       })
    //       setStatus("linkexpired")
    //       showToast("error", "Verification link has expired", {
    //         id: "link-expired",
    //         duration: 3000,
    //       })
    //     } else {
    //       setStatus("emailsent")
    //     }
    //   } catch (error) {
    //     console.error(error)

    //     // Set verification failed state to true
    //     if (isMounted) {
    //       setVerificationFailed(true)
    //       setStatus("verificationfailed")
    //     }

    //     if ((error as any)?.response?.data?.message === "User not found") {
    //       showToast("error", "User not found", {
    //         id: "user-not-found-verify",
    //         duration: 3000,
    //       })
    //       setTimeout(() => {
    //         if (isMounted) {
    //           router.replace("/signup")
    //         }
    //       }, 1000)
    //     } else {
    //       showToast("error", "Verification failed", {
    //         id: "verification-failed",
    //         duration: 3000,
    //       })
    //     }
    //   } finally {
    //     if (isMounted) {
    //       setLoading(false)
    //     }
    //   }
    // }

    const checkVerify = async () => {
      if (!token) {
        console.log("⛔ No token available; exiting early.");
        return;
      }

      try {
        console.log("⏳ Starting verification with token:", token);
        setLoading(true);
        setVerificationFailed(false);
        verificationCheckedRef.current = true;
        console.log("🔄 States reset and verification marked as checked.");

        // Make sure the API endpoint matches your backend route
        const response = await apiConfig.post("/auth/user/verify-email", {
          verificationToken: token,
        });

        console.log("📡 Verification response:", response.data);

        // if (!isMounted) {
        //   console.log("🛑 Component unmounted, stopping further execution.");
        //   return;
        // }

        if (response.data.success && response.data.type === "emailverified") {
          console.log("✅ Email verified. Saving token in cookie.");
          cookie.set("esToken", response.data.token, {
            expires: new Date(Date.now() + longerEXP),
          });

          // Also save refresh token if needed
          if (response.data.refreshToken) {
            cookie.set("refreshToken", response.data.refreshToken, {
              expires: new Date(Date.now() + longerEXP),
            });
          }

          setStatus("emailverified");
          showToast("success", "Email verified successfully!", {
            id: "email-verified-success",
            duration: 3000,
          });
          console.log("🎉 Toast shown for successful verification.");

          let count = 5;
          const timer = setInterval(() => {
            count -= 1;
            if (count <= 0) {
              router.push("/dashboard");
              clearInterval(timer);
              // if (isMounted) {
              //   console.log("🚀 Redirecting to /dashboard");
              //   router.replace("/dashboard");
              // }
            }
          }, 1000);

          return () => {
            clearInterval(timer);
            console.log("🧹 Timer cleared on unmount.");
          };
        }

        if (response.data.type === "linkexpired") {
          console.log("⚠️ Link expired. Saving token and updating status.");
          if (response.data.token) {
            cookie.set("esToken", response.data.token, {
              expires: new Date(Date.now() + longerEXP),
            });

            // Also save refresh token if needed
            if (response.data.refreshToken) {
              cookie.set("refreshToken", response.data.refreshToken, {
                expires: new Date(Date.now() + longerEXP),
              });
            }
          }

          setStatus("linkexpired");
          showToast(
            "error",
            "Verification link has expired. A new link has been sent to your email.",
            {
              id: "link-expired",
              duration: 5000,
            }
          );
        } else {
          console.log("📨 Email resent or not verified yet.");
          setStatus("emailsent");
        }
      } catch (error) {
        console.error("❌ Verification failed:", error);

        setVerificationFailed(true);
        setStatus("verificationfailed");

        showToast("error", "Verification failed!", {
          id: "email-verified-failed",
          duration: 3000,
        });

        const errorMessage =
          (error as any)?.response?.data?.message || "Verification failed";

        if (errorMessage === "User not found") {
          console.log("🔍 User not found. Redirecting to signup...");
          showToast("error", "User not found", {
            id: "user-not-found-verify",
            duration: 3000,
          });

          setTimeout(() => {
            if (isMounted) {
              router.replace("/signup");
            }
          }, 1000);
        } else {
          showToast("error", errorMessage, {
            id: "verification-failed",
            duration: 3000,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("✅ Finished verification. Loader turned off.");
        }
      }
    };

    checkVerify();

    return () => {
      isMounted = false;
    };
  }, [token, user, router, showToast]); // Dependencies that won't change during component lifecycle

  interface RequestNewEmailPayload {
    email: string | undefined;
  }

  interface ApiResponse {
    status: number;
    data: {
      emailVerified?: boolean;
      message?: string;
    };
  }

  const handleRequestNewEmail = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // Prevent default form submission behavior if this is in a form
    e.preventDefault();

    // Prevent multiple simultaneous requests
    if (loading || requestInProgressRef.current) return;

    requestInProgressRef.current = true;

    const payLoad: RequestNewEmailPayload = {
      email: user?.email,
    };

    try {
      setLoading(true);
      setVerificationFailed(false);

      const response: ApiResponse = await apiConfig.post(
        "/auth/user/resend-verification",
        payLoad,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setStatus("emailsent");
        showToast("success", "Verification Email Sent Successfully", {
          id: "verification-email-sent",
          duration: 3000,
        });

        if (response.data.emailVerified === true) {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } else if (response.status === 404) {
        showToast("error", "User not found", {
          id: "user-not-found",
          duration: 3000,
        });
        setTimeout(() => {
          router.push("/signup");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Email verification error", error);

      if (error?.response?.data?.message === "User not found") {
        setTimeout(() => {
          router.push("/signup");
        }, 1000);
      }

      showToast(
        "error",
        error?.response?.data?.message || "An error occurred",
        {
          id: "verification-error",
          duration: 3000,
        }
      );
    } finally {
      setLoading(false);
      // Reset the request flag after a short delay to prevent rapid clicking
      setTimeout(() => {
        requestInProgressRef.current = false;
      }, 500);
    }
  };

  const renderContent = () => {
    switch (statusRef.current) {
      case "emailsent":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="block dark:hidden"
                />
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="hidden dark:block"
                />
              </div>
            </motion.div>
            <CardTitle className="text-2xl mb-2">
              Verify Your Esthington Account
            </CardTitle>
            <CardDescription className="text-center mt-3">
              We've sent a verification email to your registered email address.
              Please check your inbox and click on the verification link to
              access your property listings and management tools.
            </CardDescription>
            <Button
              onClick={handleRequestNewEmail}
              className="w-full mt-3"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  Sending...
                </span>
              ) : (
                "Request New Verification Email"
              )}
            </Button>
          </>
        );
      case "linkexpired":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="block dark:hidden"
                />
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="hidden dark:block"
                />
              </div>
            </motion.div>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-amber-500" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Verification Link Expired
            </CardTitle>
            <CardDescription className="text-center mb-4">
              The verification link has expired. Please request a new
              verification email to access your property management dashboard.
            </CardDescription>
            <Button
              onClick={handleRequestNewEmail}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  Sending...
                </span>
              ) : (
                "Request New Verification Email"
              )}
            </Button>
          </>
        );
      case "verificationfailed":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="block dark:hidden"
                />
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="hidden dark:block"
                />
              </div>
            </motion.div>
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl mb-2">Verification Failed</CardTitle>
            <CardDescription className="text-center mb-4">
              We couldn't verify your email address. Please request a new
              verification email to try again.
            </CardDescription>
            <Button
              onClick={() => {
                router.push("/login");
              }}
              className="w-full"
            >
              Back to login
            </Button>
          </>
        );
      case "emailverified":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="block dark:hidden"
                />
                <Image
                  src="/logo.png"
                  alt="Esthington Logo"
                  width={48}
                  height={48}
                  className="hidden dark:block"
                />
              </div>
            </motion.div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Account Verified Successfully
            </CardTitle>
            <CardDescription className="text-center">
              Your Esthington account has been successfully verified.
              Redirecting you to your property dashboard in {countdown}{" "}
              seconds...
            </CardDescription>
            <motion.div
              className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            >
              <div className="bg-primary h-full rounded-full"></div>
            </motion.div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-md border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardContent className="text-center pt-6">
              {renderContent()}
            </CardContent>
          </CardHeader>
          <CardFooter className="flex justify-center space-x-4 text-sm text-gray-500 pb-6">
            <a
              href="/help"
              className="flex items-center hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Help Center
            </a>
            <a
              href="/contact"
              className="flex items-center hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4 mr-1" />
              Contact Support
            </a>
          </CardFooter>
        </Card>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Home className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-primary">Esthington</p>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 Esthington. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// IMPORTANT: This component should be the ONLY place in your entire app that renders the Toaster component
export default function AccountVerify() {
  return (
    <React.Fragment>
      {/* Do NOT include the Toaster component here */}
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <AccountVerificationPage />
      </React.Suspense>
    </React.Fragment>
  );
}
