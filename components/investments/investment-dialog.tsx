"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "../ui/use-mobile";
import { useWallet } from "@/contexts/wallet-context";
import { useInvestment } from "@/contexts/investments-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  DollarSign,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Percent,
  BarChart3,
  TrendingUp,
  Info,
  X,
  ArrowRight,
  Calculator,
} from "lucide-react";

interface InvestmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
}

interface InvestmentPlan {
  name: string;
  minAmount: string;
  returnRate: string;
}

interface InvestmentDuration {
  name: string;
  months: string;
  bonusRate: string;
}

export function InvestmentDialog({
  isOpen,
  onClose,
  investment,
}: InvestmentDialogProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const router = useRouter();
  const { wallet, isLoading: walletLoading } = useWallet();
  const { investInProperty, isSubmitting } = useInvestment();
  const containerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [selectedDuration, setSelectedDuration] =
    useState<InvestmentDuration | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [notes, setNotes] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState(0);

  // Memoized calculations to prevent re-renders
  const calculatedReturns = useMemo(() => {
    if (!selectedPlan || !selectedDuration) {
      return { totalReturn: 0, monthlyReturn: 0, totalAmount: 0 };
    }

    const amount = useCustomAmount
      ? Number.parseFloat(customAmount) || 0
      : Number.parseFloat(selectedPlan.minAmount) || 0;

    const baseReturnRate = Number.parseFloat(selectedPlan.returnRate) || 0;
    const bonusRate = Number.parseFloat(selectedDuration.bonusRate) || 0;
    const totalReturnRate = baseReturnRate + bonusRate;
    const months = Number.parseFloat(selectedDuration.months) || 0;

    const totalReturn = (amount * totalReturnRate) / 100;
    const monthlyReturn = months > 0 ? totalReturn / months : 0;
    const totalAmount = amount + totalReturn;

    return { totalReturn, monthlyReturn, totalAmount };
  }, [selectedPlan, selectedDuration, customAmount, useCustomAmount]);

  // Memoized format currency function
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Memoized investment amount calculation
  const investmentAmount = useMemo(() => {
    if (useCustomAmount) {
      return Number.parseFloat(customAmount) || 0;
    }
    return Number.parseFloat(selectedPlan?.minAmount || "0");
  }, [useCustomAmount, customAmount, selectedPlan?.minAmount]);

  // Memoized validation checks
  const canProceedToStep2 = useMemo(() => {
    return (
      selectedPlan &&
      selectedDuration &&
      (useCustomAmount
        ? Number.parseFloat(customAmount) >=
          Number.parseFloat(selectedPlan.minAmount)
        : true)
    );
  }, [selectedPlan, selectedDuration, useCustomAmount, customAmount]);

  const canProceedToStep3 = useMemo(() => {
    return (
      investmentAmount >= (investment?.minimumInvestment || 0) &&
      wallet &&
      wallet.balance >= investmentAmount
    );
  }, [investmentAmount, investment?.minimumInvestment, wallet]);

  // Reset form when dialog opens/closes - optimized with useCallback
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setSelectedPlan(null);
    setSelectedDuration(null);
    setCustomAmount("");
    setUseCustomAmount(false);
    setNotes("");
    setIsProcessing(false);
    setDirection(0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();

      // Auto-select first plan and duration if available
      if (investment?.investmentPlans?.length > 0) {
        setSelectedPlan(investment.investmentPlans[0]);
      }
      if (investment?.durations?.length > 0) {
        setSelectedDuration(investment.durations[0]);
      }
    }
  }, [isOpen, investment?.investmentPlans, investment?.durations, resetForm]);

  // Optimized event handlers with useCallback
  const handleNextStep = useCallback(() => {
    setDirection(1);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 50);
  }, []);

  const handlePrevStep = useCallback(() => {
    setDirection(-1);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
    }, 50);
  }, []);

  const handlePlanSelect = useCallback((plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setUseCustomAmount(false);
    setCustomAmount("");
  }, []);

  const handleDurationSelect = useCallback((duration: InvestmentDuration) => {
    setSelectedDuration(duration);
  }, []);

  const handleCustomAmountToggle = useCallback((useCustom: boolean) => {
    setUseCustomAmount(useCustom);
    if (!useCustom) {
      setCustomAmount("");
    }
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setCustomAmount(value);
  }, []);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
  }, []);

  const handleFundWallet = useCallback(() => {
    onClose();
    router.push("/dashboard/fund-wallet");
  }, [onClose, router]);



  // Wrap handleInvest in useCallback
const handleInvest = useCallback(async () => {
  if (!selectedPlan || !selectedDuration) {
    toast({
      title: "Error",
      description: "Please select a plan and duration",
      variant: "destructive",
    });
    return;
  }

  if (investmentAmount < (investment?.minimumInvestment || 0)) {
    toast({
      title: "Error",
      description: `Minimum investment amount is ${formatCurrency(
        investment?.minimumInvestment || 0
      )}`,
      variant: "destructive",
    });
    return;
  }

  if (!wallet || wallet.balance < investmentAmount) {
    toast({
      title: "Insufficient Balance",
      description: "Please fund your wallet to continue",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);

  try {
    const success = await investInProperty(
      investment._id,
      investmentAmount,
      selectedPlan.name,
      selectedDuration.name,
      notes,
      calculatedReturns
    );

    if (success) {
      setDirection(1);
      setTimeout(() => {
        setCurrentStep(4);
      }, 50);

      setTimeout(() => {
        onClose();
      }, 3000);
      router.push("/dashboard/investments/my-investments");
    }
  } catch (error) {
    console.error("Investment failed:", error);
    toast({
      title: "Investment Failed",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } 
  
}, [
  selectedPlan,
  selectedDuration,
  investmentAmount,
  investment?._id,
  wallet,
  formatCurrency,
  toast,
  investInProperty,
  notes,
  calculatedReturns,
  setDirection,
  setCurrentStep,
  onClose,
  router
]);
  
  // Memoized dialog content component
  const DialogContentComponent = useMemo(() => {
    const Component = ({ children }: { children: React.ReactNode }) => {
      if (isMobile) {
        return (
          <DrawerContent className="max-h-[95vh] overflow-hidden bg-[#0F0F12]/95 backdrop-blur-xl border-[#1F1F23]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#1F1F23]">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Invest in {investment?.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Complete your investment in a few steps
                </p>
              </div>
            </div>
            <div className="overflow-y-auto h-full" ref={containerRef}>
              {children}
            </div>
          </DrawerContent>
        );
      }

      return (
        <DialogContent className="max-w-4xl p-0 overflow-y-auto bg-[#0F0F12]/95 backdrop-blur-xl border-[#1F1F23] rounded-lg shadow-2xl md:h-[80%] md:w-[90%] lg:h-[80%] lg:w-[50%]">
          <div className="flex justify-between items-center px-8 py-6 border-b border-[#1F1F23]">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Invest in {investment?.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Complete your investment in a few steps
              </p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1" ref={containerRef}>
            {children}
          </div>
        </DialogContent>
      );
    };
    return Component;
  }, [isMobile, investment?.title, onClose]);

  // Memoized progress bar component
  const ProgressBar = useMemo(() => {
    const steps = [
      { label: "Plan", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Amount", icon: <DollarSign className="h-4 w-4" /> },
      { label: "Payment", icon: <Wallet className="h-4 w-4" /> },
      { label: "Complete", icon: <CheckCircle className="h-4 w-4" /> },
    ];

    return (
      <div className="px-8 py-6 border-b border-[#1F1F23]">
        <div className="relative">
          <div className="absolute top-[15px] left-0 w-full h-1 bg-[#1F1F23] rounded-full" />
          <div
            className="absolute top-[15px] left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
          <div className="flex justify-between relative z-10 text-sm">
            {steps.map((step, index) => {
              const isActive = currentStep > index;
              const isCurrent = currentStep === index + 1;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : isCurrent
                        ? "border-2 border-blue-600 bg-[#0F0F12] text-blue-400"
                        : "bg-[#1F1F23] border-2 border-[#2B2B30] text-gray-500"
                    }
                  `}
                  >
                    {isActive ? <CheckCircle className="h-4 w-4" /> : step.icon}
                  </div>
                  <span
                    className={`
                    text-xs font-medium mt-2 transition-all duration-300
                    ${isActive || isCurrent ? "text-blue-400" : "text-gray-500"}
                  `}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [currentStep]);

  // Memoized plan card component
  const PlanCard = useMemo(() => {
    return ({ plan, index }: { plan: InvestmentPlan; index: number }) => {
      const isSelected = selectedPlan?.name === plan.name;

      return (
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePlanSelect(plan)}
          className={`
          relative cursor-pointer rounded-lg overflow-y-auto transition-all duration-300
          ${
            isSelected
              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0F0F12]"
              : "hover:shadow-lg hover:shadow-blue-500/10"
          }
        `}
        >
          <div className="relative p-6 bg-[#1F1F23]/80 backdrop-blur-xl border border-[#2B2B30] rounded-lg h-full hover:border-blue-500/50 transition-all duration-300">
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="flex flex-col h-full">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 mb-3">
                  Investment Plan
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Minimum Investment</p>
                    <p className="font-semibold text-white">
                      {formatCurrency(Number.parseFloat(plan.minAmount))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Return Rate</p>
                    <p className="font-semibold text-white">
                      {plan.returnRate}%{" "}
                      <span className="text-green-400">APY</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2B2B30]">
                <div
                  className={`
                py-2 px-4 rounded-lg text-center text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-[#2B2B30] text-gray-300 hover:bg-[#3B3B40]"
                }
              `}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    };
  }, [selectedPlan?.name, handlePlanSelect, formatCurrency]);

  // Memoized duration card component
  const DurationCard = useMemo(() => {
    return ({
      duration,
      index,
    }: {
      duration: InvestmentDuration;
      index: number;
    }) => {
      const isSelected = selectedDuration?.name === duration.name;
      const hasBonusRate = Number.parseFloat(duration.bonusRate) > 0;

      return (
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDurationSelect(duration)}
          className={`
          relative cursor-pointer rounded-lg overflow-y-auto transition-all duration-300
          ${
            isSelected
              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0F0F12]"
              : "hover:shadow-lg hover:shadow-blue-500/10"
          }
        `}
        >
          <div className="relative p-6 bg-[#1F1F23]/80 backdrop-blur-xl border border-[#2B2B30] rounded-lg h-full hover:border-blue-500/50 transition-all duration-300">
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="flex flex-col h-full">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 mb-3">
                  Duration
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {duration.name}
                </h3>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Investment Period</p>
                    <p className="font-semibold text-white">
                      {duration.months} months
                    </p>
                  </div>
                </div>

                {hasBonusRate && (
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Bonus Rate</p>
                      <p className="font-semibold text-green-400">
                        +{duration.bonusRate}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#2B2B30]">
                <div
                  className={`
                py-2 px-4 rounded-lg text-center text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-[#2B2B30] text-gray-300 hover:bg-[#3B3B40]"
                }
              `}
                >
                  {isSelected ? "Selected" : "Select Duration"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    };
  }, [selectedDuration?.name, handleDurationSelect]);

  const Step1Content = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, x: direction * 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -50 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="px-8 py-6 space-y-8"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Select your investment plan
            </h3>
            <p className="text-gray-400">
              Choose the plan that best fits your investment goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investment?.investmentPlans?.map(
              (plan: InvestmentPlan, index: number) => (
                <PlanCard
                  key={`${plan.name}-${index}`}
                  plan={plan}
                  index={index}
                />
              )
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Choose investment duration
            </h3>
            <p className="text-gray-400">
              Longer durations may offer bonus returns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {investment?.durations?.map(
              (duration: InvestmentDuration, index: number) => (
                <DurationCard
                  key={`${duration.name}-${index}`}
                  duration={duration}
                  index={index}
                />
              )
            )}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextStep}
            disabled={!canProceedToStep2}
            className={`
          flex items-center px-8 py-2.5 rounded-lg font-medium text-white
          transition-all duration-300 relative overflow-y-auto
          ${
            canProceedToStep2
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              : "bg-[#2B2B30] cursor-not-allowed text-gray-500"
          }
        `}
          >
            <span className="relative z-10 text-sm">Continue to Amount</span>
            <ChevronRight className="ml-2 h-5 w-5 relative z-10 text-sm" />
          </motion.button>
        </div>
      </motion.div>
    ),
    [
      direction,
      investment?.investmentPlans,
      investment?.durations,
      PlanCard,
      DurationCard,
      handleNextStep,
      canProceedToStep2,
    ]
  );

  const Step2Content = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, x: direction * 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -50 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="px-8 py-6 space-y-8"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Investment amount
            </h3>
            <p className="text-gray-400">
              Choose your investment amount and add any notes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div
                onClick={() => handleCustomAmountToggle(false)}
                className={`
              p-6 border rounded-lg cursor-pointer transition-all duration-300 bg-[#1F1F23]/80 backdrop-blur-xl
              ${
                !useCustomAmount
                  ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0F0F12]"
                  : "border-[#2B2B30] hover:border-blue-500/50"
              }
            `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-white">Minimum Amount</h4>
                  {!useCustomAmount && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(
                      Number.parseFloat(selectedPlan?.minAmount || "0")
                    )}
                  </span>
                  <span className="text-sm text-gray-400">
                    minimum investment
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleCustomAmountToggle(true)}
                className={`
              p-6 border rounded-lg cursor-pointer transition-all duration-300 bg-[#1F1F23]/80 backdrop-blur-xl
              ${
                useCustomAmount
                  ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0F0F12]"
                  : "border-[#2B2B30] hover:border-blue-500/50"
              }
            `}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-white">Custom Amount</h4>
                  {useCustomAmount && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {useCustomAmount && (
                  <div className="mt-4">
                    <Label
                      htmlFor="custom-amount"
                      className="text-sm font-medium text-gray-300"
                    >
                      Enter your investment amount
                    </Label>
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-400">₦</span>
                      </div>
                      <Input
                        id="custom-amount"
                        type="number"
                        value={customAmount}
                        onChange={(e) =>
                          handleCustomAmountChange(e.target.value)
                        }
                        placeholder="Enter amount"
                        className="pl-8 bg-[#2B2B30] border-[#3B3B40] text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        min={selectedPlan?.minAmount || 0}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum:{" "}
                      {formatCurrency(
                        Number.parseFloat(selectedPlan?.minAmount || "0")
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-300"
                >
                  Investment Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add any notes about your investment goals or preferences..."
                  className="mt-2 bg-[#2B2B30] border-[#3B3B40] text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <div className="sticky top-6 bg-[#1F1F23]/80 backdrop-blur-xl rounded-lg border border-[#2B2B30] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h4 className="text-lg font-semibold flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Investment Summary
                  </h4>
                  <p className="text-blue-100 text-sm mt-1">
                    Based on your selected options
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Plan</span>
                      <span className="font-medium text-white">
                        {selectedPlan?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-medium text-white">
                        {selectedDuration?.months} months
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Investment Amount</span>
                      <span className="font-medium text-white">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#2B2B30]" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Return Rate</span>
                      <div className="flex items-center">
                        <span className="font-medium text-white">
                          {selectedPlan?.returnRate}%
                        </span>
                        {Number.parseFloat(selectedDuration?.bonusRate || "0") >
                          0 && (
                          <span className="ml-1 text-green-400">
                            +{selectedDuration?.bonusRate}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Monthly Returns</span>
                      <span className="font-medium text-white">
                        {formatCurrency(calculatedReturns.monthlyReturn)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Returns</span>
                      <span className="font-medium text-green-400">
                        {formatCurrency(calculatedReturns.totalReturn)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#2B2B30]" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total Value
                    </span>
                    <span className="text-xl font-bold text-blue-400">
                      {formatCurrency(calculatedReturns.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrevStep}
            className="flex items-center px-6 py-2 text-sm rounded-lg font-medium text-gray-300 border border-[#2B2B30] hover:bg-[#1F1F23] transition-all duration-300"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Plans
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextStep}
            disabled={!canProceedToStep2}
            className={`
          flex items-center px-8 py-2.5 rounded-lg font-medium text-white
          transition-all duration-300 relative overflow-y-auto
          ${
            canProceedToStep2
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              : "bg-[#2B2B30] cursor-not-allowed text-gray-500"
          }
        `}
          >
            <span className="relative z-10 text-sm">Continue to Payment</span>
            <ChevronRight className="ml-2 h-5 w-5 relative z-10 text-sm" />
          </motion.button>
        </div>
      </motion.div>
    ),
    [
      direction,
      useCustomAmount,
      customAmount,
      notes,
      selectedPlan,
      selectedDuration,
      investmentAmount,
      calculatedReturns,
      canProceedToStep2,
      handleCustomAmountToggle,
      handleCustomAmountChange,
      handleNotesChange,
      handlePrevStep,
      handleNextStep,
      formatCurrency,
    ]
  );

  const Step3Content = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, x: direction * 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -50 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="px-8 py-6 space-y-8"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Complete your investment
            </h3>
            <p className="text-gray-400">
              Review your investment details and complete payment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Wallet Payment</h4>
                    <p className="text-sm text-gray-400">
                      Pay directly from your wallet balance
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 p-4 bg-[#1F1F23]/50 rounded-lg border border-[#2B2B30]">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(wallet?.balance || 0)}
                  </span>
                </div>
              </div>

              {!canProceedToStep3 && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-400">
                        {wallet && wallet.balance < investmentAmount
                          ? "Insufficient Wallet Balance"
                          : "Payment Error"}
                      </h4>
                      <p className="text-sm text-red-300 mt-1">
                        {wallet && wallet.balance < investmentAmount
                          ? `You need ${formatCurrency(
                              investmentAmount - wallet.balance
                            )} more in your wallet to complete this investment.`
                          : "Please check your payment details and try again."}
                      </p>

                      <button
                        onClick={handleFundWallet}
                        className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                      >
                        Fund Wallet
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-[#1F1F23]/80 border border-[#2B2B30] rounded-lg backdrop-blur-xl">
                <h4 className="font-semibold text-white mb-4">
                  Payment Summary
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Investment Amount</span>
                    <span className="font-medium text-white">
                      {formatCurrency(investmentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="font-medium text-white">₦0.00</span>
                  </div>
                  <div className="h-px bg-[#2B2B30] my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">
                      Total to Pay
                    </span>
                    <span className="font-bold text-blue-400">
                      {formatCurrency(investmentAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-6 bg-[#1F1F23]/80 backdrop-blur-xl rounded-lg border border-[#2B2B30] overflow-y-auto">
                <div className="bg-[#2B2B30]/50 p-6">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <Info className="h-5 w-5 mr-2 text-gray-400" />
                    Investment Details
                  </h4>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Investment Plan</span>
                      <span className="font-medium text-white">
                        {selectedPlan?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-medium text-white">
                        {selectedDuration?.months} months
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Return Rate</span>
                      <div className="flex items-center">
                        <span className="font-medium text-white">
                          {selectedPlan?.returnRate}%
                        </span>
                        {Number.parseFloat(selectedDuration?.bonusRate || "0") >
                          0 && (
                          <span className="ml-1 text-green-400">
                            +{selectedDuration?.bonusRate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[#2B2B30]" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Investment Amount</span>
                      <span className="font-medium text-white">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Expected Returns</span>
                      <span className="font-medium text-green-400">
                        {formatCurrency(calculatedReturns.totalReturn)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Monthly Returns</span>
                      <span className="font-medium text-white">
                        {formatCurrency(calculatedReturns.monthlyReturn)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#2B2B30]" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total Value
                    </span>
                    <span className="text-xl font-bold text-blue-400">
                      {formatCurrency(calculatedReturns.totalAmount)}
                    </span>
                  </div>

                  {notes && (
                    <div className="mt-4 p-4 bg-[#2B2B30]/50 rounded-lg">
                      <p className="text-sm text-gray-400 italic">"{notes}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrevStep}
            className="flex items-center px-6 py-2 text-sm rounded-lg font-medium text-gray-300 border border-[#2B2B30] hover:bg-[#1F1F23] transition-all duration-300"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Amount
          </motion.button>

          <button
            onClick={handleInvest}
            disabled={!canProceedToStep3 || isProcessing || isSubmitting}
            className={`
          flex items-center px-8 py-2.5 rounded-lg font-medium text-white
          transition-all duration-300 relative overflow-y-auto
          ${
            canProceedToStep3 && !isProcessing && !isSubmitting
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              : "bg-[#2B2B30] cursor-not-allowed text-gray-500"
          }
        `}
          >
            {isProcessing || isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="relative z-10 text-sm">
                  Confirm Investment
                </span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10 text-sm" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    ),
    [
      direction,
      wallet?.balance,
      investmentAmount,
      canProceedToStep3,
      isProcessing,
      isSubmitting,
      selectedPlan,
      selectedDuration,
      calculatedReturns,
      notes,
      formatCurrency,
      handleFundWallet,
      handlePrevStep,
      handleInvest,
    ]
  );

  const Step4Content = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="px-8 py-12 flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-3">
            Investment Successful!
          </h3>
          <p className="text-gray-400 text-center text-lg max-w-md">
            Your investment of {formatCurrency(investmentAmount)} has been
            processed successfully.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 w-full max-w-md"
        >
          <div className="bg-[#1F1F23]/80 backdrop-blur-xl border border-green-500/20 rounded-lg overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <h4 className="text-lg font-semibold">Investment Summary</h4>
              <p className="text-green-100 text-sm">
                Transaction completed successfully
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Investment ID</span>
                <span className="font-medium text-white">
                  {investment?._id?.substring(0, 8) || "INV12345678"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Investment Amount</span>
                <span className="font-medium text-white">
                  {formatCurrency(investmentAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Expected Returns</span>
                <span className="font-medium text-green-400">
                  {formatCurrency(calculatedReturns.totalReturn)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Investment Duration</span>
                <span className="font-medium text-white">
                  {selectedDuration?.months} months
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Monthly Returns</span>
                <span className="font-medium text-white">
                  {formatCurrency(calculatedReturns.monthlyReturn)}
                </span>
              </div>

              <div className="h-px bg-[#2B2B30] my-2" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Total Value</span>
                <span className="font-bold text-blue-400">
                  {formatCurrency(calculatedReturns.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 flex items-center justify-center space-x-2 text-gray-400"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm">
            Redirecting to your investments dashboard...
          </p>
        </motion.div>
      </motion.div>
    ),
    [
      investmentAmount,
      calculatedReturns,
      selectedDuration,
      investment?._id,
      formatCurrency,
    ]
  );

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return Step1Content;
      case 2:
        return Step2Content;
      case 3:
        return Step3Content;
      case 4:
        return Step4Content;
      default:
        return Step1Content;
    }
  }, [currentStep, Step1Content, Step2Content, Step3Content, Step4Content]);

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DialogContentComponent>
          {currentStep < 4 && ProgressBar}
          <AnimatePresence mode="wait" initial={false}>
            {renderStepContent()}
          </AnimatePresence>
        </DialogContentComponent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContentComponent>
        {currentStep < 4 && ProgressBar}
        <AnimatePresence mode="wait" initial={false}>
          {renderStepContent()}
        </AnimatePresence>
      </DialogContentComponent>
    </Dialog>
  );
}
