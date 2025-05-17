"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Wallet,
  ArrowRight,
  AlertCircle,
  LayoutDashboard,
  CircleDollarSign,
  ShieldCheck,
  BanknoteIcon,
  ArrowDownLeft,
  Building2,
  Copy,
  CheckCircle,
  BadgePercent,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FadeIn from "@/components/animations/fade-in";
import Image from "next/image";
import { useWallet } from "@/contexts/wallet-context";
import { toast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function FundWalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fundWallet, verifyWalletFunding, isLoading, refreshWalletData } =
    useWallet();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user } = useAuth();
  const paystackRef = useRef<any>(null);

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

  // Initialize Paystack
  useEffect(() => {
    // Import Paystack dynamically to avoid SSR issues
    const loadPaystack = async () => {
      try {
        const PaystackModule = await import("@paystack/inline-js");
        paystackRef.current = PaystackModule.default;
      } catch (error) {
        console.error("Failed to load Paystack:", error);
      }
    };

    loadPaystack();

    // Cleanup function
    return () => {
      paystackRef.current = null;
    };
  }, []);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    // Prevent the event from bubbling up to the form
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(text);
    sonnerToast.success("Copied to clipboard", {
      description: text,
    });
  };

  const resetForm = () => {
    setAmount("");
    setPaymentMethod("card");
  };

  // Paystack success callback
  const handlePaystackSuccess = async (response: any) => {
    console.log("success", response)
    setProcessingPayment(true);

    try {
      // Verify the payment on your backend
      const success = await verifyWalletFunding(response.reference);

      if (success) {
        toast({
          title: "Payment Successful",
          description: "Your wallet has been funded successfully",
        });

        // Refresh wallet data
        await refreshWalletData();

        // Reset form - ensure amount is cleared
        resetForm();

        // Redirect to wallet page immediately
        router.push("/dashboard/my-wallet");
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
    }
  };

  // Paystack close callback
  const handlePaystackClose = () => {
    console.log("new close" )
    toast({
      title: "Payment Cancelled",
      description: "You cancelled the payment",
      variant: "destructive",
    });
  };

  const initializePaystack = (amountValue: number) => {
    if (!paystackRef.current) {
      toast({
        title: "Payment Error",
        description: "Payment system is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Generate a unique reference
    const reference = `pay_${Date.now()}_${Math.floor(
      Math.random() * 1000000
    )}`;

    // Initialize Paystack
    const paystack = new paystackRef.current();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      email: user?.email || "customer@example.com",
      amount: amountValue * 100, // Paystack amount is in kobo (multiply by 100)
      reference,
      firstname: user?.firstName || "Customer",
      lastname: user?.lastName || "",
      metadata: {
        custom_fields: [
          {
            display_name: "Payment For",
            variable_name: "payment_for",
            value: "Wallet Funding",
          },
        ],
      },
      onSuccess: (response: any) => handlePaystackSuccess(response),
      onCancel: handlePaystackClose,
    });
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
      initializePaystack(amountValue);
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

          resetForm(); // Reset the form

          // Redirect to wallet page immediately
          router.push("/dashboard/my-wallet");
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

  // Reset form when component mounts
  useEffect(() => {
    resetForm();
  }, []);

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

  // Check if amount is valid
  const isAmountValid = amount && Number(amount) >= 100;

  // Check if Paystack is properly configured
  const isPaystackConfigured = !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Determine if the button should be disabled
  const isButtonDisabled =
    isLoading ||
    processingPayment ||
    !isAmountValid ||
    (paymentMethod === "card" && !isPaystackConfigured);

  return (
    <>
      <div className="space-y-8 pb-10">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                <div className="mr-3 bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-md">
                  <CircleDollarSign className="h-6 w-6 text-white" />
                </div>
                Fund Wallet
              </h1>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard/my-wallet"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                  >
                    <Wallet className="h-3.5 w-3.5 mr-1" />
                    My Wallet
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium flex items-center">
                    <CircleDollarSign className="h-3.5 w-3.5 mr-1" />
                    Fund Wallet
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        {!isPaystackConfigured && (
          <FadeIn delay={0.1}>
            <Alert
              variant="destructive"
              className="rounded-xl border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300"
            >
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
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                  <Tabs
                    defaultValue="card"
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="mb-6"
                  >
                    <TabsList className="grid grid-cols-2 h-10 rounded-xl p-1 bg-slate-100 dark:bg-slate-800/50">
                      <TabsTrigger value="card" className="rounded-lg text-sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Card Payment
                      </TabsTrigger>
                      <TabsTrigger value="bank" className="rounded-lg text-sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Bank Transfer
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="amount"
                          className="text-base font-medium"
                        >
                          Amount (₦)
                        </Label>
                        <Badge
                          variant="outline"
                          className="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 border-violet-200 dark:border-violet-800/50"
                        >
                          Min: ₦100
                        </Badge>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            ₦
                          </span>
                        </div>
                        <Input
                          id="amount"
                          type="text"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          className="pl-8 h-12 text-lg font-medium rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                          required
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("5000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                            amount === "5000"
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : ""
                          }`}
                        >
                          ₦5,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("10000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                            amount === "10000"
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : ""
                          }`}
                        >
                          ₦10,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("20000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                            amount === "20000"
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : ""
                          }`}
                        >
                          ₦20,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("50000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                            amount === "50000"
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : ""
                          }`}
                        >
                          ₦50,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("100000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                            amount === "100000"
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : ""
                          }`}
                        >
                          ₦100,000
                        </Button>
                      </div>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="space-y-4 pt-2">
                        <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-800/30">
                          <div className="flex items-start">
                            <div className="relative mr-3 mt-0.5">
                              <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                              <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                                <CreditCard className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                Card Payment Information
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Your payment will be processed securely via
                                Paystack. Click the button below to proceed with
                                your payment.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center justify-center pt-2">
                          <Image
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvIs8nw1jMaInt3dOjOfwsXIZykI-P2x282Q&s"
                            alt="Visa"
                            width={48}
                            height={30}
                            className="h-8 w-auto rounded-2xl"
                          />
                          <Image
                            src="https://d28wu8o6itv89t.cloudfront.net/images/mastercardlogopng-1579603310730.png"
                            alt="Mastercard"
                            width={48}
                            height={30}
                            className="h-8 w-auto rounded-2xl"
                          />
                          <Image
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdUls8fScu5ktjPXwB9IJRWYS5xo2-g7bY1IJyr--6nMsJiWDk1i_xCpRFPXFMPk1_Y9U&usqp=CAU"
                            alt="Verve"
                            width={48}
                            height={30}
                            className="h-8 w-auto rounded-2xl"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="space-y-4 pt-2">
                        <div className="bg-violet-50 dark:bg-violet-900/20 p-5 rounded-xl border border-violet-100 dark:border-violet-800/30">
                          <div className="flex items-start mb-4">
                            <div className="relative mr-3 mt-0.5">
                              <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                              <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                Bank Transfer Instructions
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Transfer the amount to the account details
                                below. Your wallet will be credited once the
                                payment is confirmed.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Bank Name:
                              </span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">
                                  First Bank of Nigeria
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button" // Explicitly set type to button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 ml-1"
                                        onClick={(e) =>
                                          copyToClipboard(
                                            "First Bank of Nigeria",
                                            e
                                          )
                                        }
                                      >
                                        <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-violet-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy to clipboard</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Account Name:
                              </span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">
                                  Esthington Properties Ltd
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button" // Explicitly set type to button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 ml-1"
                                        onClick={(e) =>
                                          copyToClipboard(
                                            "Esthington Properties Ltd",
                                            e
                                          )
                                        }
                                      >
                                        <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-violet-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy to clipboard</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Account Number:
                              </span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">
                                  0123456789
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button" // Explicitly set type to button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 ml-1"
                                        onClick={(e) =>
                                          copyToClipboard("0123456789", e)
                                        }
                                      >
                                        <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-violet-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy to clipboard</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Reference:
                              </span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">
                                  EST-{localStorage.getItem("userId") || "USER"}
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button" // Explicitly set type to button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 ml-1"
                                        onClick={(e) =>
                                          copyToClipboard(
                                            `EST-${
                                              localStorage.getItem("userId") ||
                                              "USER"
                                            }`,
                                            e
                                          )
                                        }
                                      >
                                        <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-violet-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy to clipboard</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-violet-200 dark:border-violet-800/30">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                After making the transfer, click the button
                                below to record your payment. Your wallet will
                                be credited once the payment is confirmed by our
                                team.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
                      disabled={isButtonDisabled}
                    >
                      {isLoading || processingPayment ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="h-5 w-5 mr-2" />
                          {paymentMethod === "card"
                            ? "Pay Now"
                            : "Record Bank Transfer"}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <BanknoteIcon className="h-5 w-5 mr-2 text-emerald-500" />
                    Payment Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Amount:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ₦
                        {amount
                          ? Number.parseInt(amount).toLocaleString()
                          : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Transaction Fee:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ₦0
                      </span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between">
                      <span className="text-slate-900 dark:text-white font-medium">
                        Total:
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        ₦
                        {amount
                          ? Number.parseInt(amount).toLocaleString()
                          : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start">
                        <div className="relative mr-3 mt-0.5">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                            <ShieldCheck className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            Secure Payment
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            All transactions are secure and encrypted. By
                            funding your wallet, you agree to our Terms of
                            Service and Privacy Policy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800 mt-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <BadgePercent className="h-5 w-5 mr-2 text-violet-500" />
                    Benefits
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                          <ArrowDownLeft className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Instant Funding
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Card payments are processed instantly, giving you
                          immediate access to your funds.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          No Hidden Fees
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          We don't charge any additional fees for funding your
                          wallet.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                          <ArrowUpRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Easy Withdrawals
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Withdraw your funds to your bank account anytime with
                          no restrictions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                  onClick={() => router.push("/dashboard/my-wallet")}
                >
                  <ArrowRight className="mr-2 h-4 w-4" /> Return to My Wallet
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
