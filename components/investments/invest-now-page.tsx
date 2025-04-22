"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  AlertCircle,
  Percent,
  Users,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FadeIn from "@/components/animations/fade-in";
import Image from "next/image";
import { useWallet } from "@/contexts/wallet-context";
import { useInvestments } from "@/contexts/investments-context";

interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  returnRate: number;
}

interface InvestmentDuration {
  id: string;
  name: string;
  months: number;
  bonusRate: number;
}

interface ROIPlan {
  id: string;
  name: string;
  description: string;
}

export default function InvestNowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const { balance, fundWallet } = useWallet();
  const {
    selectedInvestment,
    getInvestmentById,
    investInProperty,
    isLoading: investmentLoading,
  } = useInvestments();

  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedROIPlan, setSelectedROIPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success"
  );
  const [showFundWalletPrompt, setShowFundWalletPrompt] = useState(false);

  // Investment plans
  const investmentPlans: InvestmentPlan[] = [
    {
      id: "basic",
      name: "Basic Plan",
      description: "Entry-level investment with standard returns",
      minAmount: 100000,
      returnRate: 10,
    },
    {
      id: "premium",
      name: "Premium Plan",
      description: "Higher investment with better returns",
      minAmount: 500000,
      returnRate: 12,
    },
    {
      id: "elite",
      name: "Elite Plan",
      description: "Maximum returns for serious investors",
      minAmount: 1000000,
      returnRate: 15,
    },
  ];

  // Investment durations
  const investmentDurations: InvestmentDuration[] = [
    {
      id: "short",
      name: "6 Months",
      months: 6,
      bonusRate: 0,
    },
    {
      id: "medium",
      name: "12 Months",
      months: 12,
      bonusRate: 1,
    },
    {
      id: "long",
      name: "24 Months",
      months: 24,
      bonusRate: 2,
    },
    {
      id: "extended",
      name: "36 Months",
      months: 36,
      bonusRate: 3,
    },
  ];

  // ROI payment plans
  const roiPlans: ROIPlan[] = [
    {
      id: "monthly",
      name: "Monthly Payout",
      description: "Receive your returns every month",
    },
    {
      id: "quarterly",
      name: "Quarterly Payout",
      description: "Receive your returns every 3 months",
    },
    {
      id: "end",
      name: "End of Term",
      description: "Receive all returns at the end of investment period",
    },
    {
      id: "reinvest",
      name: "Reinvest Returns",
      description: "Automatically reinvest returns for compound growth",
    },
  ];

  useEffect(() => {
    const loadInvestmentData = async () => {
      setIsLoading(true);
      if (propertyId) {
        await getInvestmentById(propertyId);
      }
      setIsLoading(false);
    };

    loadInvestmentData();
  }, [propertyId, getInvestmentById]);

  useEffect(() => {
    // Set default values when investment is loaded
    if (selectedInvestment) {
      setSelectedPlan("basic");
      setSelectedDuration("medium");
      setSelectedROIPlan("monthly");
      setAmount(investmentPlans[0].minAmount.toString());
    }
  }, [selectedInvestment]);

  // Check if wallet balance is sufficient whenever amount changes
  useEffect(() => {
    if (amount) {
      const investAmount = Number(amount);
      setShowFundWalletPrompt(investAmount > balance);
    }
  }, [amount, balance]);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const getCurrentPlan = (): InvestmentPlan | undefined => {
    return investmentPlans.find((plan) => plan.id === selectedPlan);
  };

  const getCurrentDuration = (): InvestmentDuration | undefined => {
    return investmentDurations.find(
      (duration) => duration.id === selectedDuration
    );
  };

  const calculateTotalReturn = (): number => {
    const investAmount = Number(amount) || 0;
    const plan = getCurrentPlan();
    const duration = getCurrentDuration();

    if (!plan || !duration) return 0;

    const baseRate = plan.returnRate;
    const bonusRate = duration.bonusRate;
    const totalRate = baseRate + bonusRate;
    const months = duration.months;

    return (investAmount * (totalRate / 100) * months) / 12;
  };

  const handleFundWallet = () => {
    router.push("/dashboard/fund-wallet");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (
      !selectedInvestment ||
      !selectedPlan ||
      !selectedDuration ||
      !selectedROIPlan ||
      !amount
    ) {
      setToastMessage("Please fill in all fields");
      setToastVariant("error");
      setShowToast(true);
      return;
    }

    const investAmount = Number(amount);
    const plan = getCurrentPlan();

    if (!plan) {
      setToastMessage("Invalid investment plan selected");
      setToastVariant("error");
      setShowToast(true);
      return;
    }

    if (investAmount < plan.minAmount) {
      setToastMessage(
        `Minimum investment for ${plan.name} is ${formatCurrency(
          plan.minAmount
        )}`
      );
      setToastVariant("error");
      setShowToast(true);
      return;
    }

    if (investAmount > balance) {
      setToastMessage("Insufficient funds in your wallet");
      setToastVariant("error");
      setShowToast(true);
      setShowFundWalletPrompt(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Process the investment
      const success = await investInProperty(
        selectedInvestment.id,
        investAmount
      );

      if (success) {
        // Show success toast
        setToastMessage(
          "Investment successful! You are now a property investor."
        );
        setToastVariant("success");
        setShowToast(true);

        // Redirect to my investments page after a delay
        setTimeout(() => {
          router.push("/dashboard/my-investments");
        }, 2000);
      } else {
        throw new Error("Investment failed");
      }
    } catch (error) {
      // Show error toast
      setToastMessage("Failed to process investment. Please try again.");
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

  if (isLoading || investmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedInvestment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Property Not Found
        </h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          The property you're looking for doesn't exist or has been removed.
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
              <h1 className="text-2xl font-bold text-white">
                Invest in Property
              </h1>
              <p className="text-gray-400 mt-1">
                Create your property investment portfolio
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
                  <BreadcrumbLink href="/dashboard/marketplace">
                    Marketplace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Invest Now</BreadcrumbPage>
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
                      src={selectedInvestment.images[0] || "/placeholder.svg"}
                      alt={selectedInvestment.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {selectedInvestment.title}
                    </h2>
                    <p className="text-gray-400 mb-4">
                      {selectedInvestment.location}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-400">
                          Property Type
                        </div>
                        <div className="text-white font-medium">
                          {selectedInvestment.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          Base Return Rate
                        </div>
                        <div className="text-white font-medium flex items-center">
                          <Percent className="h-3.5 w-3.5 mr-1 text-blue-400" />
                          {selectedInvestment.returnRate}% p.a.
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          Min Investment
                        </div>
                        <div className="text-white font-medium flex items-center">
                          <Wallet className="h-3.5 w-3.5 mr-1 text-purple-400" />
                          {formatCurrency(selectedInvestment.minInvestment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Investors</div>
                        <div className="text-white font-medium flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1 text-green-400" />
                          {selectedInvestment.totalInvestors}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Funding Progress</span>
                        <span className="text-white font-medium">
                          {selectedInvestment.funded}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${selectedInvestment.funded}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>
                          Target: {formatCurrency(selectedInvestment.target)}
                        </span>
                        <span>
                          Raised:{" "}
                          {formatCurrency(
                            (selectedInvestment.target *
                              selectedInvestment.funded) /
                              100
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300">
                      {selectedInvestment.description}
                    </p>
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

                    {/* Investment Plan Selection */}
                    <div className="space-y-4">
                      <Label htmlFor="plan">Select Investment Plan</Label>
                      <Select
                        value={selectedPlan}
                        onValueChange={setSelectedPlan}
                      >
                        <SelectTrigger
                          id="plan"
                          className="bg-[#1F1F23]/50 border-[#2B2B30]"
                        >
                          <SelectValue placeholder="Select Investment Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                          {investmentPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex flex-col">
                                <span>{plan.name}</span>
                                <span className="text-xs text-gray-400">
                                  {plan.description} - Min:{" "}
                                  {formatCurrency(plan.minAmount)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Investment Duration */}
                    <div className="space-y-4">
                      <Label htmlFor="duration">
                        Select Investment Duration
                      </Label>
                      <Select
                        value={selectedDuration}
                        onValueChange={setSelectedDuration}
                      >
                        <SelectTrigger
                          id="duration"
                          className="bg-[#1F1F23]/50 border-[#2B2B30]"
                        >
                          <SelectValue placeholder="Select Investment Duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                          {investmentDurations.map((duration) => (
                            <SelectItem key={duration.id} value={duration.id}>
                              <div className="flex flex-col">
                                <span>{duration.name}</span>
                                <span className="text-xs text-gray-400">
                                  {duration.bonusRate > 0
                                    ? `+${duration.bonusRate}% bonus rate`
                                    : "Standard rate"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ROI Payment Plan */}
                    <div className="space-y-4">
                      <Label htmlFor="roi-plan">
                        How do you want your ROI to be paid?
                      </Label>
                      <Select
                        value={selectedROIPlan}
                        onValueChange={setSelectedROIPlan}
                      >
                        <SelectTrigger
                          id="roi-plan"
                          className="bg-[#1F1F23]/50 border-[#2B2B30]"
                        >
                          <SelectValue placeholder="Select ROI Payment Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F1F23] border-[#2B2B30]">
                          {roiPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex flex-col">
                                <span>{plan.name}</span>
                                <span className="text-xs text-gray-400">
                                  {plan.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Investment Amount */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="amount">Investment Amount (₦)</Label>
                        <div className="text-xs text-gray-400">
                          Minimum:{" "}
                          {formatCurrency(
                            getCurrentPlan()?.minAmount ||
                              selectedInvestment.minInvestment
                          )}
                        </div>
                      </div>
                      <Input
                        id="amount"
                        type="text"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) =>
                          setAmount(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        className="bg-[#1F1F23]/50 border-[#2B2B30]"
                        required
                      />

                      <div className="flex flex-wrap gap-2">
                        {investmentPlans.map((plan) => (
                          <Button
                            key={plan.id}
                            type="button"
                            variant="outline"
                            onClick={() =>
                              handleQuickAmount(String(plan.minAmount))
                            }
                            className={
                              amount === String(plan.minAmount)
                                ? "border-blue-500 bg-blue-900/20"
                                : "bg-[#1F1F23]/50 border-[#2B2B30]"
                            }
                          >
                            {formatCurrency(plan.minAmount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      disabled={
                        isProcessing ||
                        !amount ||
                        Number(amount) <
                          (getCurrentPlan()?.minAmount ||
                            selectedInvestment.minInvestment) ||
                        Number(amount) > balance
                      }
                    >
                      {isProcessing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>Confirm Investment</>
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
                  Investment Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Property:</span>
                    <span className="font-medium text-white">
                      {selectedInvestment.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investment Plan:</span>
                    <span className="font-medium text-white">
                      {getCurrentPlan()?.name || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-medium text-white">
                      {getCurrentDuration()?.name || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ROI Payment:</span>
                    <span className="font-medium text-white">
                      {roiPlans.find((p) => p.id === selectedROIPlan)?.name ||
                        "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investment Amount:</span>
                    <span className="font-medium text-white">
                      {formatCurrency(Number(amount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Effective Rate:</span>
                    <span className="font-medium text-white">
                      {getCurrentPlan() && getCurrentDuration()
                        ? `${
                            getCurrentPlan()!.returnRate +
                            getCurrentDuration()!.bonusRate
                          }% p.a.`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="border-t border-[#1F1F23] pt-4 flex justify-between">
                    <span className="text-white font-medium">
                      Estimated Returns:
                    </span>
                    <span className="text-green-400 font-bold">
                      {formatCurrency(calculateTotalReturn())}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#1F1F23]">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Investment Benefits
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Ownership stake in premium real estate
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Regular returns based on your selected payment plan
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Capital appreciation over the investment period
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-gray-300">
                        Professional property management included
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
                          <p>Read our investment terms and conditions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="space-y-2 text-xs text-gray-400">
                    <p>
                      Returns are not guaranteed and may vary based on market
                      conditions.
                    </p>
                    <p>
                      Your investment is secured by the underlying property
                      asset.
                    </p>
                    <p>
                      Early withdrawal may be subject to fees and conditions.
                    </p>
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
                  onClick={() => router.push("/dashboard/my-investments")}
                >
                  My Investments <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
