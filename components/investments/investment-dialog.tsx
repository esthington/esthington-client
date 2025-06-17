"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
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
      toast.error("Please select a plan and duration");
      return;
    }

    if (investmentAmount < (investment?.minimumInvestment || 0)) {
      toast.error(
        `Minimum investment amount is ${formatCurrency(
          investment?.minimumInvestment || 0
        )}`
      );
      return;
    }

    if (!wallet || wallet.balance < investmentAmount) {
      toast.error("Insufficient balance. Please fund your wallet to continue");
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
      toast.error("Investment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedPlan,
    selectedDuration,
    investmentAmount,
    investment?._id,
    wallet,
    formatCurrency,
    investInProperty,
    notes,
    calculatedReturns,
    setDirection,
    setCurrentStep,
    onClose,
    router,
  ]);

  // Memoized dialog content component
  const DialogContentComponent = useMemo(() => {
    const Component = ({ children }: { children: React.ReactNode }) => {
      if (isMobile) {
        return (
          <DrawerContent className="max-h-[95vh] overflow-hidden bg-background/95 backdrop-blur-xl border-border">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Invest in {investment?.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
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
        <DialogContent className="max-w-4xl p-0 overflow-y-auto bg-background/95 backdrop-blur-xl border-border rounded-lg shadow-2xl md:h-[80%] md:w-[90%] lg:h-[80%] lg:w-[50%]">
          <div className="flex justify-between items-center px-8 py-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Invest in {investment?.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
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
      <div className="px-8 py-6 border-b border-border">
        <div className="relative">
          <div className="absolute top-[15px] left-0 w-full h-1 bg-muted rounded-full" />
          <div
            className="absolute top-[15px] left-0 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-in-out"
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
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        : isCurrent
                        ? "border-2 border-primary bg-background text-primary"
                        : "bg-muted border-2 border-border text-muted-foreground"
                    }
                  `}
                  >
                    {isActive ? <CheckCircle className="h-4 w-4" /> : step.icon}
                  </div>
                  <span
                    className={`
                    text-xs font-medium mt-2 transition-all duration-300
                    ${
                      isActive || isCurrent
                        ? "text-primary"
                        : "text-muted-foreground"
                    }
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
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "hover:shadow-lg hover:shadow-primary/10"
          }
        `}
        >
          <Card
            className={`
            relative h-full transition-all duration-300
            ${
              isSelected
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }
          `}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-3">
                    Investment Plan
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Minimum Investment
                      </p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(Number.parseFloat(plan.minAmount))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Percent className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Return Rate
                      </p>
                      <p className="font-semibold text-foreground">
                        {plan.returnRate}%{" "}
                        <span className="text-green-600 dark:text-green-400">
                          APY
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div
                    className={`
                py-2 px-4 rounded-lg text-center text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "hover:shadow-lg hover:shadow-primary/10"
          }
        `}
        >
          <Card
            className={`
            relative h-full transition-all duration-300
            ${
              isSelected
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }
          `}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <Badge
                    variant="outline"
                    className="mb-3 border-purple-500/30 text-purple-600 dark:text-purple-400"
                  >
                    Duration
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground">
                    {duration.name}
                  </h3>
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Investment Period
                      </p>
                      <p className="font-semibold text-foreground">
                        {duration.months} months
                      </p>
                    </div>
                  </div>

                  {hasBonusRate && (
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bonus Rate
                        </p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +{duration.bonusRate}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div
                    className={`
                py-2 px-4 rounded-lg text-center text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
                  >
                    {isSelected ? "Selected" : "Select Duration"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Select your investment plan
            </h3>
            <p className="text-muted-foreground">
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Choose investment duration
            </h3>
            <p className="text-muted-foreground">
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
          <Button
            onClick={handleNextStep}
            disabled={!canProceedToStep2}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
          >
            Continue to Amount
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Investment amount
            </h3>
            <p className="text-muted-foreground">
              Choose your investment amount and add any notes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card
                onClick={() => handleCustomAmountToggle(false)}
                className={`
              cursor-pointer transition-all duration-300
              ${
                !useCustomAmount
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5"
                  : "hover:border-primary/50"
              }
            `}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-foreground">
                      Minimum Amount
                    </h4>
                    {!useCustomAmount && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(
                        Number.parseFloat(selectedPlan?.minAmount || "0")
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      minimum investment
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => handleCustomAmountToggle(true)}
                className={`
              cursor-pointer transition-all duration-300
              ${
                useCustomAmount
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5"
                  : "hover:border-primary/50"
              }
            `}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-foreground">
                      Custom Amount
                    </h4>
                    {useCustomAmount && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {useCustomAmount && (
                    <div className="mt-4">
                      <Label
                        htmlFor="custom-amount"
                        className="text-sm font-medium text-foreground"
                      >
                        Enter your investment amount
                      </Label>
                      <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-muted-foreground">₦</span>
                        </div>
                        <Input
                          id="custom-amount"
                          type="number"
                          value={customAmount}
                          onChange={(e) =>
                            handleCustomAmountChange(e.target.value)
                          }
                          placeholder="Enter amount"
                          className="pl-8"
                          min={selectedPlan?.minAmount || 0}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum:{" "}
                        {formatCurrency(
                          Number.parseFloat(selectedPlan?.minAmount || "0")
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="pt-4">
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-foreground"
                >
                  Investment Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add any notes about your investment goals or preferences..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Card className="sticky top-6 bg-gradient-to-b from-background to-muted/30 shadow-md dark:shadow-primary/5">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Investment Summary
                  </CardTitle>
                  <p className="text-primary-foreground/80 text-sm">
                    Based on your selected options
                  </p>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium text-foreground">
                        {selectedPlan?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">
                        {selectedDuration?.months} months
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Investment Amount
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Return Rate</span>
                      <div className="flex items-center">
                        <span className="font-medium text-foreground">
                          {selectedPlan?.returnRate}%
                        </span>
                        {Number.parseFloat(selectedDuration?.bonusRate || "0") >
                          0 && (
                          <span className="ml-1 text-green-600 dark:text-green-400">
                            +{selectedDuration?.bonusRate}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Monthly Returns
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(calculatedReturns.monthlyReturn)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Total Returns
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(calculatedReturns.totalReturn)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Total Value
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(calculatedReturns.totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevStep}>
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Plans
          </Button>

          <Button
            onClick={handleNextStep}
            disabled={!canProceedToStep2}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
          >
            Continue to Payment
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Complete your investment
            </h3>
            <p className="text-muted-foreground">
              Review your investment details and complete payment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Wallet Payment
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Pay directly from your wallet balance
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <span className="text-muted-foreground">
                      Available Balance
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrency(wallet?.balance || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {!canProceedToStep3 && (
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-600 dark:text-red-400">
                          {wallet && wallet.balance < investmentAmount
                            ? "Insufficient Wallet Balance"
                            : "Payment Error"}
                        </h4>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                          {wallet && wallet.balance < investmentAmount
                            ? `You need ${formatCurrency(
                                investmentAmount - wallet.balance
                              )} more in your wallet to complete this investment.`
                            : "Please check your payment details and try again."}
                        </p>

                        <Button
                          onClick={handleFundWallet}
                          variant="outline"
                          className="mt-3 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                        >
                          Fund Wallet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Investment Amount
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(investmentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Processing Fee
                    </span>
                    <span className="font-medium text-foreground">₦0.00</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Total to Pay
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(investmentAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6 bg-gradient-to-b from-background to-muted/30 shadow-md dark:shadow-primary/5">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                    Investment Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Investment Plan
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedPlan?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">
                        {selectedDuration?.months} months
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Return Rate</span>
                      <div className="flex items-center">
                        <span className="font-medium text-foreground">
                          {selectedPlan?.returnRate}%
                        </span>
                        {Number.parseFloat(selectedDuration?.bonusRate || "0") >
                          0 && (
                          <span className="ml-1 text-green-600 dark:text-green-400">
                            +{selectedDuration?.bonusRate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Investment Amount
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Expected Returns
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(calculatedReturns.totalReturn)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Monthly Returns
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(calculatedReturns.monthlyReturn)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Total Value
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(calculatedReturns.totalAmount)}
                    </span>
                  </div>

                  {notes && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground italic">
                        "{notes}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevStep}>
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Amount
          </Button>

          <Button
            onClick={handleInvest}
            disabled={!canProceedToStep3 || isProcessing || isSubmitting}
            className={`
          ${
            canProceedToStep3 && !isProcessing && !isSubmitting
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              : ""
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
                Confirm Investment
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    ),
    [
      direction,
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
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-foreground text-center mb-3">
            Investment Successful!
          </h3>
          <p className="text-muted-foreground text-center text-lg max-w-md">
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
          <Card className="bg-gradient-to-b from-background to-muted/30 shadow-md border-green-500/20">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="text-lg font-semibold">
                Investment Summary
              </CardTitle>
              <p className="text-green-100 text-sm">
                Transaction completed successfully
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Investment ID</span>
                <span className="font-medium text-foreground">
                  {investment?._id?.substring(0, 8) || "INV12345678"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Investment Amount</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(investmentAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Expected Returns</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(calculatedReturns.totalReturn)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Investment Duration
                </span>
                <span className="font-medium text-foreground">
                  {selectedDuration?.months} months
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Monthly Returns</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(calculatedReturns.monthlyReturn)}
                </span>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  Total Value
                </span>
                <span className="font-bold text-primary">
                  {formatCurrency(calculatedReturns.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 flex items-center justify-center space-x-2 text-muted-foreground"
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
