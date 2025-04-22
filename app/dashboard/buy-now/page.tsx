"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Info,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NotificationToast } from "@/components/ui/notification-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FadeIn from "@/components/animations/fade-in";
import Image from "next/image";
import { useWallet } from "@/contexts/wallet-context";

interface Land {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  size: string;
  features: string[];
  image: string;
  description: string;
}

export default function BuyNowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const landId = searchParams.get("landId");

  const { balance, fundWallet } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [land, setLand] = useState<Land | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success"
  );
  const [showFundWalletPrompt, setShowFundWalletPrompt] = useState(false);

  useEffect(() => {
    // Simulate loading land data
    const timer = setTimeout(() => {
      // Mock land data
      if (landId) {
        setLand({
          id: landId,
          title: "Premium Land in Lekki Phase 1",
          location: "Lekki Phase 1, Lagos",
          price: 75000000,
          type: "Residential",
          size: "1000 sqm",
          features: ["Dry Land", "C of O", "Gated Community", "24/7 Security"],
          image:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D",
          description:
            "This premium residential land is located in the heart of Lekki Phase 1, one of Lagos' most prestigious neighborhoods. The property offers excellent investment potential with its prime location, secure environment, and complete documentation. Perfect for building your dream home or as a long-term investment.",
        });
      }
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [landId]);

  // Check if wallet balance is sufficient
  useEffect(() => {
    if (land) {
      setShowFundWalletPrompt(land.price > balance);
    }
  }, [land, balance]);

  const handleFundWallet = () => {
    router.push("/dashboard/fund-wallet");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate payment
    if (!land) return;

    if (land.price > balance) {
      setToastMessage("Insufficient funds in your wallet.");
      setToastVariant("error");
      setShowToast(true);
      setShowFundWalletPrompt(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call to process purchase
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success toast
      setToastMessage("Purchase successful! You are now a land owner.");
      setToastVariant("success");
      setShowToast(true);

      // Redirect to my purchases page after a delay
      setTimeout(() => {
        router.push("/dashboard/my-purchases");
      }, 2000);
    } catch (error) {
      // Show error toast
      setToastMessage("Failed to process purchase. Please try again.");
      setToastVariant("error");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Land Not Found</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          The land you're looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={() => router.push("/dashboard/marketplace")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <>
      <NotificationToast
        open={showToast}
        onClose={() => setShowToast(false)}
        title={toastMessage}
        variant={toastVariant}
        icon={
          toastVariant === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )
        }
      />

      <div className="space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Buy Land</h1>
              <p className="text-gray-400 mt-1">Complete your land purchase</p>
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
                  <BreadcrumbLink href="/dashboard/marketplace">
                    Marketplace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Buy Now</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="relative md:w-1/3 h-48 md:h-auto rounded-lg overflow-hidden">
                    <Image
                      src={land.image || "/placeholder.svg"}
                      alt={land.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {land.title}
                    </h2>
                    <p className="text-gray-400 mb-4">{land.location}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-400">Land Type</div>
                        <div className="text-white font-medium">
                          {land.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Land Size</div>
                        <div className="text-white font-medium flex items-center">
                          <Map className="h-3.5 w-3.5 mr-1 text-blue-400" />
                          {land.size}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          Documentation
                        </div>
                        <div className="text-white font-medium flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-purple-400" />
                          C of O
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Location</div>
                        <div className="text-white font-medium flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-green-400" />
                          Prime Area
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {land.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#1F1F23] text-gray-300 text-xs rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-300">{land.description}</p>
                  </div>
                </div>

                <div className="border-t border-[#1F1F23] pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Wallet Balance Display */}
                    <div className="bg-[#1F1F23]/50 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-blue-400" />
                        <div>
                          <div className="text-sm text-gray-400">
                            Your Wallet Balance
                          </div>
                          <div className="text-white font-semibold">
                            {formatCurrency(balance)}
                          </div>
                        </div>
                      </div>
                      {showFundWalletPrompt && (
                        <Button
                          type="button"
                          onClick={handleFundWallet}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Fund Wallet
                        </Button>
                      )}
                    </div>

                    <div className="bg-[#1F1F23]/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Property Price:</span>
                        <span className="text-white font-bold">
                          {formatCurrency(land.price)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Payment will be made directly from your wallet balance.
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      disabled={isProcessing || land.price > balance}
                    >
                      {isProcessing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>Complete Purchase</>
                      )}
                    </Button>
                  </form>
                </div>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Purchase Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Land Price:</span>
                    <span className="font-medium text-white">
                      {formatCurrency(land.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Land Size:</span>
                    <span className="font-medium text-white">{land.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Documentation:</span>
                    <span className="font-medium text-white">C of O</span>
                  </div>
                  <div className="border-t border-[#1F1F23] pt-4 flex justify-between">
                    <span className="text-white font-medium">
                      Total Amount:
                    </span>
                    <span className="text-green-400 font-bold">
                      {formatCurrency(land.price)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#1F1F23]">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Purchase Benefits
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Full ownership with complete documentation
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Potential for capital appreciation
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Prime location with excellent amenities
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Secure environment with 24/7 security
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#1F1F23]">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                    Important Information
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1F1F23] border-[#2B2B30] text-white">
                          <p>Read our purchase terms and conditions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="space-y-2 text-xs text-gray-400">
                    <p>All land purchases come with verified documentation.</p>
                    <p>Physical inspection is recommended before purchase.</p>
                    <p>Transfer of ownership takes 7-14 business days.</p>
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-[#1F1F23]/50 border-[#2B2B30] hover:bg-[#2B2B30]"
                  onClick={() => router.push("/dashboard/marketplace")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-[#1F1F23]/50 border-[#2B2B30] hover:bg-[#2B2B30]"
                  onClick={() => router.push("/dashboard/my-purchases")}
                >
                  My Purchases <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
