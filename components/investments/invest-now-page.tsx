"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  AlertCircle,
  Users,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Info,
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useWallet } from "@/contexts/wallet-context";
import { useInvestment, PayoutFrequency } from "@/contexts/investments-context";

// Animation components
const FadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const SlideIn = ({
  children,
  direction = "left",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
}) => (
  <motion.div
    initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

export default function InvestNowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const { wallet, refreshWalletData } = useWallet();
  const balance = wallet?.balance ?? 0;

  const {
    selectedInvestment,
    getInvestmentById,
    investInProperty,
    isLoading: investmentLoading,
    isSubmitting,
  } = useInvestment();

  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedROIPlan, setSelectedROIPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFundWalletPrompt, setShowFundWalletPrompt] = useState(false);

  // Get dynamic data from investment context
  type InvestmentPlan = {
    name: string;
    minAmount: number;
    returnRate: number;
    [key: string]: any;
  };
  type Duration = {
    name: string;
    months: number;
    bonusRate: number;
    [key: string]: any;
  };

  const investmentPlans: InvestmentPlan[] = selectedInvestment?.investmentPlans || [];
  const durations: Duration[] = selectedInvestment?.durations || [];

  // ROI plans based on PayoutFrequency enum
  const roiPlans = [
    {
      id: PayoutFrequency.MONTHLY,
      name: "Monthly Payout",
      description: "Receive your returns every month",
      frequency: "Monthly",
    },
    {
      id: PayoutFrequency.QUARTERLY,
      name: "Quarterly Payout",
      description: "Receive your returns every 3 months",
      frequency: "Quarterly",
    },
    {
      id: PayoutFrequency.SEMI_ANNUALLY,
      name: "Semi-Annual Payout",
      description: "Receive your returns every 6 months",
      frequency: "Semi-Annually",
    },
    {
      id: PayoutFrequency.ANNUALLY,
      name: "Annual Payout",
      description: "Receive your returns once a year",
      frequency: "Annually",
    },
    {
      id: PayoutFrequency.END_OF_TERM,
      name: "End of Term",
      description: "Receive all returns at the end of investment period",
      frequency: "End of Term",
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
  }, [propertyId]);

  useEffect(() => {
    // Set default values when investment is loaded
    if (selectedInvestment) {
      if (investmentPlans.length > 0) {
        setSelectedPlan("0"); // First plan index
      }
      if (durations.length > 0) {
        setSelectedDuration("0"); // First duration index
      }
      setSelectedROIPlan(PayoutFrequency.MONTHLY);
      if (selectedInvestment.minimumInvestment) {
        setAmount(selectedInvestment.minimumInvestment.toString());
      }
    }
  }, [selectedInvestment, investmentPlans, durations]);
  const getCurrentPlan = (): InvestmentPlan | null => {
    if (!selectedPlan || !investmentPlans.length) return null;
    return investmentPlans[Number.parseInt(selectedPlan)];
  };

  const getCurrentDuration = (): Duration | null => {
    if (!selectedDuration || !durations.length) return null;
    return durations[Number.parseInt(selectedDuration)];
  };
  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const calculateTotalReturn = (): number => {
    const investAmount = Number(amount) || 0;
    const plan = getCurrentPlan();
    const duration = getCurrentDuration();

    if (!plan || !duration || !selectedInvestment) return 0;

    const baseRate = selectedInvestment.returnRate;
    const planRate = plan.returnRate || 0;
    const bonusRate = duration.bonusRate || 0;
    const totalRate = Math.max(baseRate, planRate) + bonusRate;
    const months = duration.months || selectedInvestment.investmentPeriod || 12;

    return (Number(investAmount) * (Number(totalRate) / 100) * Number(months)) / 12;
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
      return;
    }

    const investAmount = Number(amount);
    const plan = getCurrentPlan();

    if (!plan) {
      return;
    }

    const minAmount = plan.minAmount || selectedInvestment.minimumInvestment;
    if (investAmount < minAmount) {
      return;
    }

    if (investAmount > balance) {
      setShowFundWalletPrompt(true);
      return;
    }

    setIsProcessing(true);

    try {
      const success = await investInProperty(
        selectedInvestment._id,
        investAmount
      );

      if (success) {
        // Refresh wallet data
        await refreshWalletData();

        // Redirect to my investments page after a delay
        setTimeout(() => {
          router.push("/dashboard/my-investments");
        }, 2000);
      }
    } catch (error) {
      console.error("Investment failed:", error);
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading || investmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (!selectedInvestment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Investment Not Found
        </h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          The investment opportunity you're looking for doesn't exist or has
          been removed.
        </p>
        <Button
          onClick={() => router.push("/dashboard/marketplace")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invest in Property
              </h1>
              <p className="text-gray-600 mt-1">
                Secure your financial future with real estate investment
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/marketplace")}
                className="border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/marketplace"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Marketplace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  Invest Now
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Investment Form */}
          <div className="lg:col-span-2">
            <SlideIn direction="left">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedInvestment.title}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{selectedInvestment.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {selectedInvestment.returnRate}% Returns
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`border ${getRiskColor(
                            selectedInvestment.riskLevel
                          )}`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {selectedInvestment.riskLevel} Risk
                        </Badge>
                        {selectedInvestment.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Investment Progress */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        Funding Progress
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedInvestment.percentageFunded}%
                      </span>
                    </div>
                    <Progress
                      value={selectedInvestment.percentageFunded}
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Raised:{" "}
                        {formatCurrency(selectedInvestment.raisedAmount || 0)}
                      </span>
                      <span>
                        Target:{" "}
                        {formatCurrency(selectedInvestment.targetAmount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <div className="text-lg font-semibold text-gray-900">
                          {selectedInvestment.totalInvestors}
                        </div>
                        <div className="text-xs text-gray-600">Investors</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <div className="text-lg font-semibold text-gray-900">
                          {selectedInvestment.investmentPeriod}
                        </div>
                        <div className="text-xs text-gray-600">Months</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Wallet Balance */}
                  <Alert
                    className={`border-2 ${
                      showFundWalletPrompt
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <Wallet
                      className={`h-5 w-5 ${
                        showFundWalletPrompt ? "text-red-600" : "text-blue-600"
                      }`}
                    />
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Wallet Balance</div>
                        <div className="text-lg font-bold">
                          {formatCurrency(balance)}
                        </div>
                      </div>
                      {showFundWalletPrompt && (
                        <Button
                          onClick={handleFundWallet}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Fund Wallet
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Investment Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Investment Plans */}
                    {investmentPlans.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-900">
                          Select Investment Plan
                        </Label>
                        <Select
                          value={selectedPlan}
                          onValueChange={setSelectedPlan}
                        >
                          <SelectTrigger className="h-12 border-gray-200">
                            <SelectValue placeholder="Choose an investment plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {investmentPlans.map((plan: any, index: number) => (
                              <SelectItem key={index} value={index.toString()}>
                                <div className="flex flex-col py-1">
                                  <span className="font-medium">
                                    {plan.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Min: {formatCurrency(plan.minAmount)} •{" "}
                                    {plan.returnRate}% Returns
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Investment Duration */}
                    {durations.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-900">
                          Investment Duration
                        </Label>
                        <Select
                          value={selectedDuration}
                          onValueChange={setSelectedDuration}
                        >
                          <SelectTrigger className="h-12 border-gray-200">
                            <SelectValue placeholder="Choose investment duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {durations.map((duration: any, index: number) => (
                              <SelectItem key={index} value={index.toString()}>
                                <div className="flex flex-col py-1">
                                  <span className="font-medium">
                                    {duration.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {duration.months} months
                                    {duration.bonusRate > 0 &&
                                      ` • +${duration.bonusRate}% bonus`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ROI Payment Plan */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900">
                        Return Payment Schedule
                      </Label>
                      <Select
                        value={selectedROIPlan}
                        onValueChange={setSelectedROIPlan}
                      >
                        <SelectTrigger className="h-12 border-gray-200">
                          <SelectValue placeholder="How would you like to receive returns?" />
                        </SelectTrigger>
                        <SelectContent>
                          {roiPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium">{plan.name}</span>
                                <span className="text-sm text-gray-500">
                                  {plan.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Investment Amount */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold text-gray-900">
                          Investment Amount
                        </Label>
                        <span className="text-sm text-gray-500">
                          Min:{" "}
                          {formatCurrency(
                            getCurrentPlan()?.minAmount ||
                              selectedInvestment.minimumInvestment
                          )}
                        </span>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          className="pl-10 h-12 text-lg border-gray-200"
                          required
                        />
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {investmentPlans.map((plan: any, index: number) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuickAmount(String(plan.minAmount))
                            }
                            className={`border-gray-200 hover:border-blue-300 hover:bg-blue-50 ${
                              amount === String(plan.minAmount)
                                ? "border-blue-500 bg-blue-50"
                                : ""
                            }`}
                          >
                            {formatCurrency(plan.minAmount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={
                        isProcessing ||
                        isSubmitting ||
                        !amount ||
                        Number(amount) <
                          (getCurrentPlan()?.minAmount ||
                            selectedInvestment.minimumInvestment) ||
                        Number(amount) > balance
                      }
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg"
                    >
                      {isProcessing || isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Processing Investment...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Confirm Investment
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </SlideIn>
          </div>

          {/* Investment Summary Sidebar */}
          <div className="lg:col-span-1">
            <SlideIn direction="right">
              <div className="sticky top-6 space-y-6">
                {/* Investment Summary */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Info className="mr-2 h-5 w-5 text-blue-600" />
                      Investment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property:</span>
                        <span className="font-medium text-gray-900 text-right max-w-[150px] truncate">
                          {selectedInvestment.title}
                        </span>
                      </div>

                      {getCurrentPlan() && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-medium text-gray-900">
                            {getCurrentPlan()?.name}
                          </span>
                        </div>
                      )}

                      {getCurrentDuration() && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">
                            {getCurrentDuration()?.name}
                          </span>
                        </div>
                      )}

                      {selectedROIPlan && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payout:</span>
                          <span className="font-medium text-gray-900">
                            {
                              roiPlans.find((p) => p.id === selectedROIPlan)
                                ?.frequency
                            }
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(Number(amount) || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Return Rate:</span>
                        <span className="font-medium text-gray-900">
                          {getCurrentPlan() && getCurrentDuration()
                            ? `${
                                Math.max(
                                  selectedInvestment.returnRate,
                                  getCurrentPlan()?.returnRate || 0
                                ) + (getCurrentDuration()?.bonusRate || 0)
                              }% p.a.`
                            : `${selectedInvestment.returnRate}% p.a.`}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800">
                          Estimated Returns:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(calculateTotalReturn())}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Based on selected plan and duration
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Benefits */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Investment Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        "Ownership stake in premium real estate",
                        "Regular returns based on your payment plan",
                        "Capital appreciation over time",
                        "Professional property management",
                        "Transparent reporting and updates",
                        "Flexible investment options",
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Disclaimer */}
                <Card className="shadow-lg border-0 bg-amber-50/80 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-amber-800">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Important Notice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-amber-700">
                      <p>• Returns are projections and not guaranteed</p>
                      <p>• Investment is secured by underlying property</p>
                      <p>• Early withdrawal may incur fees</p>
                      <p>• Please read terms and conditions</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                    onClick={() => router.push("/dashboard/marketplace")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                    onClick={() => router.push("/dashboard/my-investments")}
                  >
                    My Investments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </div>
    </div>
  );
}
