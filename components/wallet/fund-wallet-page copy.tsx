"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Wallet, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimatedCard } from "@/components/ui/animated-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FadeIn from "@/components/animations/fade-in";
import Image from "next/image";
import { useWallet } from "@/contexts/wallet-context";
import { toast } from "@/components/ui/use-toast";
import { usePaystackPayment } from "react-paystack";

export default function FundWalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fundWallet, verifyWalletFunding, isLoading, refreshWalletData } =
    useWallet();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paystackReference, setPaystackReference] = useState("");
  const [showPaystackButton, setShowPaystackButton] = useState(false);
  const [paystackConfig, setPaystackConfig] = useState<any>(null);
  const paystack = usePaystackPayment(paystackConfig); // Initialize Paystack here

  // Get user info from localStorage
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user info from localStorage
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("userEmail") || "");
      setUserName(localStorage.getItem("userName") || "");
    }
  }, []);


  // Check for reference in URL (for payment verification)
  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    // If we have a reference, verify the payment
    if (reference && !processingPayment) {
      setProcessingPayment(true);

      const verifyPayment = async () => {
        const success = await verifyWalletFunding(reference);

        if (success) {
          toast({
            title: "Payment Successful",
            description: "Your wallet has been funded successfully",
          });

          // Redirect to wallet page after a delay
          setTimeout(() => {
            router.push("/dashboard/my-wallet");
          }, 2000);
        } else {
          toast({
            title: "Payment Failed",
            description: "We couldn't verify your payment. Please try again.",
            variant: "destructive",
          });
        }

        setProcessingPayment(false);
      };

      verifyPayment();
    }
  }, [searchParams, verifyWalletFunding, router, processingPayment]);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = Number.parseInt(amount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amountValue < 100) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be at least ₦100",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card") {
      // Generate a unique reference
      const reference = `pay_${Date.now()}_${Math.floor(
        Math.random() * 1000000
      )}`;
      setPaystackReference(reference);

      // Define callback functions
      const onSuccess = async (reference: any) => {
        // Handle successful payment
        setProcessingPayment(true);

        try {
          // Verify the payment on your backend
          const success = await verifyWalletFunding(reference.reference);

          console.log("reference:", reference);
          console.log("Payment verification response:", success);

          if (success) {
            toast({
              title: "Payment Successful",
              description: "Your wallet has been funded successfully",
            });

            // Refresh wallet data
            await refreshWalletData();

            // Redirect to wallet page after a delay
            setTimeout(() => {
              router.push("/dashboard/my-wallet");
            }, 2000);
          } else {
            toast({
              title: "Payment Verification Failed",
              description:
                "We couldn't verify your payment. Please contact support.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast({
            title: "Error",
            description: "An error occurred while verifying your payment",
            variant: "destructive",
          });
        } finally {
          setProcessingPayment(false);
          setShowPaystackButton(false);
        }
      };

      const onClose = () => {
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the payment",
          variant: "destructive",
        });
        setShowPaystackButton(false);
      };

      // Configure Paystack
      const config = {
        reference,
        email: userEmail || "customer@example.com",
        amount: amountValue * 100, // Paystack amount is in kobo (multiply by 100)
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        firstname: userName.split(" ")[0] || "Customer",
        lastname: userName.split(" ")[1] || "",
        metadata: {
          custom_fields: [
            {
              display_name: "Payment For",
              variable_name: "payment_for",
              value: "Wallet Funding",
            },
          ],
        },
        onSuccess,
        onClose,
      };

      // Set config and show button
      setPaystackConfig(config);
      setShowPaystackButton(true);

      // Directly initialize payment
      // const paystack = usePaystackPayment(config);
      setTimeout(() => {
        if (paystackConfig) {
          paystack({
            onSuccess: (reference: any) => {
              // Handle successful payment
              setProcessingPayment(true);

              verifyWalletFunding(reference.reference)
                .then((success) => {
                  if (success) {
                    toast({
                      title: "Payment Successful",
                      description: "Your wallet has been funded successfully",
                    });

                    refreshWalletData();

                    setTimeout(() => {
                      router.push("/dashboard/my-wallet");
                    }, 2000);
                  } else {
                    toast({
                      title: "Payment Verification Failed",
                      description:
                        "We couldn't verify your payment. Please contact support.",
                      variant: "destructive",
                    });
                  }
                })
                .catch((error) => {
                  console.error("Payment verification error:", error);
                  toast({
                    title: "Error",
                    description:
                      "An error occurred while verifying your payment",
                    variant: "destructive",
                  });
                })
                .finally(() => {
                  setProcessingPayment(false);
                  setShowPaystackButton(false);
                });
            },
            onClose: () => {
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment",
                variant: "destructive",
              });
              setShowPaystackButton(false);
            },
          });
        }
      }, 100);
    } else if (paymentMethod === "bank") {
      try {
        // For bank transfers, create a manual transaction
        const reference = `manual_${Date.now()}_${Math.floor(
          Math.random() * 1000000
        )}`;
        const success = await fundWallet(amountValue, "bank_transfer", {
          reference,
        });

        if (success) {
          toast({
            title: "Transaction Recorded",
            description:
              "Your bank transfer has been recorded. Your wallet will be credited once payment is confirmed.",
          });

          // Redirect to wallet page after a delay
          setTimeout(() => {
            router.push("/dashboard/my-wallet");
          }, 2000);
        }
      } catch (error) {
        console.error("Error recording bank transfer:", error);
        toast({
          title: "Error",
          description: "An error occurred while recording your bank transfer",
          variant: "destructive",
        });
      }
    }
  };

  // Add this useEffect after the other useEffects
  useEffect(() => {
    if (paystackConfig && showPaystackButton) {
      // const paystack = usePaystackPayment(paystackConfig);
      const timer = setTimeout(() => {
        paystack({
          onSuccess: (reference: any) => {
            // Handle successful payment
            setProcessingPayment(true);

            verifyWalletFunding(reference.reference)
              .then((success) => {
                if (success) {
                  toast({
                    title: "Payment Successful",
                    description: "Your wallet has been funded successfully",
                  });

                  refreshWalletData();

                  setTimeout(() => {
                    router.push("/dashboard/my-wallet");
                  }, 2000);
                } else {
                  toast({
                    title: "Payment Verification Failed",
                    description:
                      "We couldn't verify your payment. Please contact support.",
                    variant: "destructive",
                  });
                }
              })
              .catch((error) => {
                console.error("Payment verification error:", error);
                toast({
                  title: "Error",
                  description: "An error occurred while verifying your payment",
                  variant: "destructive",
                });
              })
              .finally(() => {
                setProcessingPayment(false);
                setShowPaystackButton(false);
              });
          },
          onClose: () => {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment",
              variant: "destructive",
            });
            setShowPaystackButton(false);
          },
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [paystackConfig, showPaystackButton]);

  // If we're processing a payment verification
  if (processingPayment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we process your payment...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fund Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add funds to your wallet
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/my-wallet">
                    Wallet
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Fund Wallet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        {!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && (
          <FadeIn delay={0.1}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Configuration</AlertTitle>
              <AlertDescription>
                Paystack public key is not configured. Please add
                NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your environment variables.
              </AlertDescription>
            </Alert>
          </FadeIn>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <AnimatedCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      required
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("5000")}
                        className={
                          amount === "5000"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }
                      >
                        ₦5,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("10000")}
                        className={
                          amount === "10000"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }
                      >
                        ₦10,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("20000")}
                        className={
                          amount === "20000"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }
                      >
                        ₦20,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("50000")}
                        className={
                          amount === "50000"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }
                      >
                        ₦50,000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleQuickAmount("100000")}
                        className={
                          amount === "100000"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }
                      >
                        ₦100,000
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label
                          htmlFor="card"
                          className="flex items-center cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit/Debit Card (Instant)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label
                          htmlFor="bank"
                          className="flex items-center cursor-pointer"
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Bank Transfer (Manual)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "bank" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          Bank Transfer Instructions
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                          Transfer the amount to the account details below. Your
                          wallet will be credited once the payment is confirmed.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Bank Name:
                            </span>
                            <span className="text-sm font-medium">
                              First Bank of Nigeria
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Account Name:
                            </span>
                            <span className="text-sm font-medium">
                              Esthington Properties Ltd
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Account Number:
                            </span>
                            <span className="text-sm font-medium">
                              0123456789
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Reference:
                            </span>
                            <span className="text-sm font-medium">
                              EST-{localStorage.getItem("userId") || "USER"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white"
                    disabled={isLoading || showPaystackButton}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />{" "}
                        Processing...
                      </>
                    ) : showPaystackButton ? (
                      <>Initializing Payment...</>
                    ) : (
                      <>Fund Wallet</>
                    )}
                  </Button>
                </form>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount:
                    </span>
                    <span className="font-medium">
                      ₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Transaction Fee:
                    </span>
                    <span className="font-medium">₦0</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-900 dark:text-white font-medium">
                      Total:
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      ₦{amount ? Number.parseInt(amount).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t flex items-center justify-between gap-3 py-3">
                  {/* <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Secure Payment
                  </h3> */}
                  <div className="flex items-center gap-2 w-full">
                    <Image
                      className="h-24 w-auto rounded-full"
                      src="https://st.depositphotos.com/2036511/3293/v/450/depositphotos_32936807-stock-illustration-secure-transaction-badge.jpg"
                      alt="Visa"
                      width={40}
                      height={24}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    All transactions are secure and encrypted. By funding your
                    wallet, you agree to our Terms of Service and Privacy
                    Policy.
                  </p>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/my-wallet")}
                >
                  <ArrowRight className="mr-2 h-4 w-4" /> Go to My Wallet
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
