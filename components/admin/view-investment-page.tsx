"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Star,
  TrendingUp,
  Edit,
  Trash2,
  ChevronRight,
  FileText,
  Download,
  Users,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FadeIn from "@/components/animations/fade-in";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import {
  InvestmentCategory,
  InvestmentStatus,
  PayoutFrequency,
  ReturnType,
  useInvestment,
} from "@/contexts/investments-context";
import { InvestmentDialog } from "@/components/investments/investment-dialog";

interface InvestmentDetailPageProps {
  id: string;
}

export default function InvestmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const {
    getInvestmentById,
    selectedInvestment,
    isLoading,
    toggleFeatured,
    toggleTrending,
    deleteInvestment,
    changeInvestmentStatus,
  } = useInvestment();
  const [activeTab, setActiveTab] = useState("overview");
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (id) {
      getInvestmentById(id);
    }
  }, [id]);

  const handleInvestNow = () => {
    setIsInvestmentDialogOpen(true);
  };

  const handleEditInvestment = () => {
    router.push(`/dashboard/investments/edit/${id}`);
  };

  const handleDeleteInvestment = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this investment? This action cannot be undone."
      )
    ) {
      const success = await deleteInvestment(id);
      if (success) {
        router.push("/dashboard/investments");
      }
    }
  };

  const handleToggleFeatured = async () => {
    await toggleFeatured(id);
  };

  const handleToggleTrending = async () => {
    await toggleTrending(id);
  };

  const handleViewProperty = () => {
    if (
      typeof selectedInvestment?.propertyId === "object" &&
      selectedInvestment?.propertyId?._id
    ) {
      router.push(`/dashboard/properties/${selectedInvestment.propertyId._id}`);
    } else if (typeof selectedInvestment?.propertyId === "string") {
      router.push(`/dashboard/properties/${selectedInvestment.propertyId}`);
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInvestmentTypeLabel = (type: InvestmentCategory): string => {
    switch (type) {
      case InvestmentCategory.REAL_ESTATE:
        return "Real Estate";
      default:
        return "Real Estate";
    }
  };

  const getReturnTypeLabel = (type: ReturnType): string => {
    switch (type) {
      case ReturnType.FIXED:
        return "Fixed Return";
      case ReturnType.VARIABLE:
        return "Variable Return";
      case ReturnType.PROFIT_SHARING:
        return "Profit Sharing";
      default:
        return "Fixed Return";
    }
  };

  const getPayoutFrequencyLabel = (frequency: PayoutFrequency): string => {
    switch (frequency) {
      case PayoutFrequency.MONTHLY:
        return "Monthly";
      case PayoutFrequency.QUARTERLY:
        return "Quarterly";
      case PayoutFrequency.SEMI_ANNUALLY:
        return "Semi-Annually";
      case PayoutFrequency.ANNUALLY:
        return "Annually";
      case PayoutFrequency.END_OF_TERM:
        return "End of Term";
      default:
        return "Monthly";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedInvestment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Investment not found
        </h3>
        <p className="text-gray-400 max-w-md">
          We couldn't find the investment you're looking for. It may have been
          removed or you may not have permission to view it.
        </p>
        <Button
          onClick={() => router.push("/dashboard/investments")}
          className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Investments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {selectedInvestment.title}
            </h1>
            <div className="flex items-center text-gray-400 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {typeof selectedInvestment.propertyId === "object"
                  ? selectedInvestment.propertyId?.location || "Nigeria"
                  : "Nigeria"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.push("/dashboard/investments")}
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {isAdmin ? (
              <>
                <Button
                  onClick={handleToggleFeatured}
                  variant="outline"
                  className={
                    selectedInvestment.featured
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : ""
                  }
                >
                  <Star className="mr-2 h-4 w-4" />{" "}
                  {selectedInvestment.featured ? "Featured" : "Mark Featured"}
                </Button>
                <Button
                  onClick={handleToggleTrending}
                  variant="outline"
                  className={
                    selectedInvestment.trending
                      ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                      : ""
                  }
                >
                  <TrendingUp className="mr-2 h-4 w-4" />{" "}
                  {selectedInvestment.trending ? "Trending" : "Mark Trending"}
                </Button>
                <Button
                  onClick={handleEditInvestment}
                  variant="outline"
                  className="border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  onClick={handleDeleteInvestment}
                  variant="outline"
                  className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </>
            ) : (
              <Button
                onClick={handleInvestNow}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                Invest Now
              </Button>
            )}
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
                <BreadcrumbLink href="/dashboard/investments">
                  Investments
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedInvestment.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FadeIn delay={0.2}>
            <AnimatedCard className="overflow-hidden bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
              <div className="relative h-64 md:h-80 w-full">
                {typeof selectedInvestment.propertyId === "object" &&
                selectedInvestment.propertyId.thumbnail ? (
                  <Image
                    src={
                      selectedInvestment.propertyId.thumbnail ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={selectedInvestment.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={`/placeholder.svg?height=800&width=1200&query=real estate investment ${selectedInvestment.type}`}
                    alt={selectedInvestment.title}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  {selectedInvestment.featured && (
                    <Badge
                      variant="default"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                  {selectedInvestment.trending && (
                    <Badge
                      variant="default"
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" /> Trending
                    </Badge>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Investment Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="investors">Investors</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      About This Investment
                    </h3>
                    <p className="text-gray-400">
                      {selectedInvestment.description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Investment Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-[#1F1F23] border-[#2B2B30]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <Percent className="h-4 w-4 mr-2 text-blue-400" />{" "}
                            Return Rate
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-white">
                            {selectedInvestment.returnRate}%
                          </p>
                          <p className="text-sm text-gray-400">
                            {getReturnTypeLabel(selectedInvestment.returnType)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-[#1F1F23] border-[#2B2B30]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-purple-400" />{" "}
                            Duration
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-white">
                            {selectedInvestment.investmentPeriod} Months
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(selectedInvestment.startDate)} -{" "}
                            {formatDate(selectedInvestment.endDate)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-[#1F1F23] border-[#2B2B30]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-400" />{" "}
                            Minimum Investment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(
                              selectedInvestment.minimumInvestment
                            )}
                          </p>
                          <p className="text-sm text-gray-400">
                            Get started with this amount
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-[#1F1F23] border-[#2B2B30]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-amber-400" />{" "}
                            Payout Frequency
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-white">
                            {getPayoutFrequencyLabel(
                              selectedInvestment.payoutFrequency
                            )}
                          </p>
                          <p className="text-sm text-gray-400">
                            Regular returns on your investment
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Property Details
                    </h3>
                    <Card className="bg-[#1F1F23] border-[#2B2B30]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">
                              {typeof selectedInvestment.propertyId === "object"
                                ? selectedInvestment.propertyId?.title ||
                                  "Property"
                                : "Property"}
                            </h4>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {typeof selectedInvestment.propertyId ===
                                "object"
                                  ? selectedInvestment.propertyId?.location ||
                                    "Nigeria"
                                  : "Nigeria"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <Building className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {typeof selectedInvestment.propertyId ===
                                "object"
                                  ? selectedInvestment.propertyId?.type ||
                                    "Real Estate"
                                  : "Real Estate"}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={handleViewProperty}
                            variant="outline"
                            className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
                          >
                            View Property{" "}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Frequently Asked Questions
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="item-1"
                        className="border-[#2B2B30]"
                      >
                        <AccordionTrigger className="text-white hover:text-blue-400">
                          How does this investment work?
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                          This investment allows you to own a stake in premium
                          real estate property. You'll earn returns based on the
                          property's performance, with payouts made{" "}
                          {getPayoutFrequencyLabel(
                            selectedInvestment.payoutFrequency
                          ).toLowerCase()}
                          .
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-2"
                        className="border-[#2B2B30]"
                      >
                        <AccordionTrigger className="text-white hover:text-blue-400">
                          What returns can I expect?
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                          This investment offers a{" "}
                          {selectedInvestment.returnRate}%{" "}
                          {selectedInvestment.returnType.toLowerCase()} return
                          rate over the {selectedInvestment.investmentPeriod}
                          -month investment period.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-3"
                        className="border-[#2B2B30]"
                      >
                        <AccordionTrigger className="text-white hover:text-blue-400">
                          How do I withdraw my investment?
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                          Your investment will be locked for the duration of{" "}
                          {selectedInvestment.investmentPeriod} months. After
                          this period, you can withdraw your principal plus
                          returns through your dashboard.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-4"
                        className="border-[#2B2B30]"
                      >
                        <AccordionTrigger className="text-white hover:text-blue-400">
                          Is my investment secure?
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400">
                          Yes, your investment is backed by real estate assets.
                          We also implement strict due diligence processes and
                          maintain transparency in all our operations.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </AnimatedCard>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Investment Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Basic Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Investment ID
                              </span>
                              <span className="text-white">
                                {selectedInvestment._id.substring(0, 8)}...
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status</span>
                              <Badge>
                                {selectedInvestment.status
                                  .charAt(0)
                                  .toUpperCase() +
                                  selectedInvestment.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Created</span>
                              <span className="text-white">
                                {formatDate(selectedInvestment.createdAt)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Last Updated
                              </span>
                              <span className="text-white">
                                {formatDate(selectedInvestment.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Financial Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Minimum Investment
                              </span>
                              <span className="text-white">
                                {formatCurrency(
                                  selectedInvestment.minimumInvestment
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Target Amount
                              </span>
                              <span className="text-white">
                                {formatCurrency(
                                  selectedInvestment.targetAmount
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Raised Amount
                              </span>
                              <span className="text-white">
                                {formatCurrency(
                                  selectedInvestment.raisedAmount
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Remaining Amount
                              </span>
                              <span className="text-white">
                                {formatCurrency(
                                  selectedInvestment.targetAmount -
                                    selectedInvestment.raisedAmount
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Return Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Return Rate</span>
                              <span className="text-white">
                                {selectedInvestment.returnRate}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Return Type</span>
                              <span className="text-white">
                                {getReturnTypeLabel(
                                  selectedInvestment.returnType
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Payout Frequency
                              </span>
                              <span className="text-white">
                                {getPayoutFrequencyLabel(
                                  selectedInvestment.payoutFrequency
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Timeline
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Duration</span>
                              <span className="text-white">
                                {selectedInvestment.investmentPeriod} months
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Start Date</span>
                              <span className="text-white">
                                {formatDate(selectedInvestment.startDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">End Date</span>
                              <span className="text-white">
                                {formatDate(selectedInvestment.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="pt-4 border-t border-[#2B2B30]">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Admin Actions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              changeInvestmentStatus(
                                selectedInvestment._id,
                                InvestmentStatus.ACTIVE
                              )
                            }
                            disabled={
                              selectedInvestment.status ===
                              InvestmentStatus.ACTIVE
                            }
                            className={
                              selectedInvestment.status ===
                              InvestmentStatus.ACTIVE
                                ? "bg-green-500/20 border-green-500/50 text-green-400"
                                : ""
                            }
                          >
                            Activate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              changeInvestmentStatus(
                                selectedInvestment._id,
                                InvestmentStatus.PENDING
                              )
                            }
                            disabled={
                              selectedInvestment.status ===
                              InvestmentStatus.PENDING
                            }
                            className={
                              selectedInvestment.status ===
                              InvestmentStatus.PENDING
                                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                                : ""
                            }
                          >
                            Set to Pending
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              changeInvestmentStatus(
                                selectedInvestment._id,
                                InvestmentStatus.COMPLETED
                              )
                            }
                            disabled={
                              selectedInvestment.status ===
                              InvestmentStatus.COMPLETED
                            }
                            className={
                              selectedInvestment.status ===
                              InvestmentStatus.COMPLETED
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                : ""
                            }
                          >
                            Mark as Completed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              changeInvestmentStatus(
                                selectedInvestment._id,
                                InvestmentStatus.CANCELLED
                              )
                            }
                            disabled={
                              selectedInvestment.status ===
                              InvestmentStatus.CANCELLED
                            }
                            className={
                              selectedInvestment.status ===
                              InvestmentStatus.CANCELLED
                                ? "bg-red-500/20 border-red-500/50 text-red-400"
                                : ""
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Investment Documents
                    </h3>

                    {selectedInvestment.documents &&
                    selectedInvestment.documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedInvestment.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center p-4 bg-[#1F1F23]/50 rounded-lg border border-[#2B2B30] hover:border-blue-500/50 transition-all"
                          >
                            <FileText className="h-8 w-8 text-blue-400 mr-3" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">
                                Document {index + 1}
                              </h4>
                              <p className="text-gray-400 text-sm truncate">
                                {doc.split("/").pop()}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-white mb-2">
                          No documents available
                        </h4>
                        <p className="text-gray-400 max-w-md">
                          There are no documents attached to this investment
                          opportunity.
                        </p>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </TabsContent>

              <TabsContent value="investors" className="space-y-6">
                <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Investors
                    </h3>

                    {selectedInvestment.investors &&
                    selectedInvestment.investors.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#2B2B30]">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Investor
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Amount
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedInvestment.investors.map(
                              (investor, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-[#2B2B30] last:border-0"
                                >
                                  <td className="py-3 px-4 text-white">
                                    {investor.userId.substring(0, 8)}...
                                  </td>
                                  <td className="py-3 px-4 text-white">
                                    {formatCurrency(investor.amount)}
                                  </td>
                                  <td className="py-3 px-4 text-gray-400">
                                    {formatDate(investor.date)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-white mb-2">
                          No investors yet
                        </h4>
                        <p className="text-gray-400 max-w-md">
                          Be the first to invest in this opportunity!
                        </p>
                        {!isAdmin && (
                          <Button
                            onClick={handleInvestNow}
                            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                          >
                            Invest Now
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>

        <div className="space-y-6">
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Investment Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Minimum Investment
                  </div>
                  <div className="text-white text-xl font-semibold">
                    {formatCurrency(selectedInvestment.minimumInvestment)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Funding Progress</span>
                    <span className="text-white font-medium">
                      {selectedInvestment.percentageFunded}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{
                        width: `${selectedInvestment.percentageFunded}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      Raised: {formatCurrency(selectedInvestment.raisedAmount)}
                    </span>
                    <span>
                      Target: {formatCurrency(selectedInvestment.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2B2B30] space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Return Rate</span>
                    <span className="text-white font-medium">
                      {selectedInvestment.returnRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Return Type</span>
                    <span className="text-white">
                      {getReturnTypeLabel(selectedInvestment.returnType)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payout Frequency</span>
                    <span className="text-white">
                      {getPayoutFrequencyLabel(
                        selectedInvestment.payoutFrequency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">
                      {selectedInvestment.investmentPeriod} months
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2B2B30] space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Date</span>
                    <span className="text-white">
                      {formatDate(selectedInvestment.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">End Date</span>
                    <span className="text-white">
                      {formatDate(selectedInvestment.endDate)}
                    </span>
                  </div>
                </div>

                {!isAdmin && (
                  <div className="pt-4">
                    <Button
                      onClick={handleInvestNow}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    >
                      Invest Now
                    </Button>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Property Details
              </h3>

              {typeof selectedInvestment.propertyId === "object" ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">
                      Property Name
                    </div>
                    <div className="text-white font-medium">
                      {selectedInvestment.propertyId.title}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Location</div>
                    <div className="text-white font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {selectedInvestment.propertyId.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">
                      Property Type
                    </div>
                    <div className="text-white font-medium">
                      {selectedInvestment.propertyId.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">
                      Property Value
                    </div>
                    <div className="text-white font-medium">
                      {formatCurrency(selectedInvestment.propertyId.price)}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    onClick={handleViewProperty}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View Property Details
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Building className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-gray-400">
                    Property details are not available
                  </p>
                </div>
              )}
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.4}>
            <AnimatedCard className="p-6 bg-[#0F0F12]/80 backdrop-blur-xl border-[#1F1F23]">
              <h3 className="text-lg font-semibold text-white mb-4">FAQ</h3>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-1"
                  className="border-b border-[#2B2B30]"
                >
                  <AccordionTrigger className="text-white hover:no-underline text-sm">
                    What is the min investment amount?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    The minimum investment amount for this opportunity is{" "}
                    {formatCurrency(selectedInvestment.minimumInvestment)}.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="border-b border-[#2B2B30]"
                >
                  <AccordionTrigger className="text-white hover:no-underline text-sm">
                    How are returns calculated and paid?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    This investment offers a {selectedInvestment.returnRate}%{" "}
                    {getReturnTypeLabel(selectedInvestment.returnType)} return,
                    with payouts made{" "}
                    {getPayoutFrequencyLabel(
                      selectedInvestment.payoutFrequency
                    ).toLowerCase()}
                    .
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="border-b border-[#2B2B30]"
                >
                  <AccordionTrigger className="text-white hover:no-underline text-sm">
                    What is the investment duration?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    The investment period is{" "}
                    {selectedInvestment.investmentPeriod} months, starting from{" "}
                    {formatDate(selectedInvestment.startDate)} and ending on{" "}
                    {formatDate(selectedInvestment.endDate)}.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="border-b border-[#2B2B30]"
                >
                  <AccordionTrigger className="text-white hover:no-underline text-sm">
                    Can I withdraw my investment early?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Early withdrawals may be subject to penalties and are
                    evaluated on a case-by-case basis. Please contact our
                    support team for more information about early withdrawal
                    options.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-white hover:no-underline text-sm">
                    How do I track my investment?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Once you've invested, you can track your investment
                    performance, returns, and payouts through your personal
                    dashboard in the "My Investments" section.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AnimatedCard>
          </FadeIn>
        </div>
      </div>

      {/* Investment Dialog */}
      <InvestmentDialog
        isOpen={isInvestmentDialogOpen}
        onClose={() => setIsInvestmentDialogOpen(false)}
        investment={selectedInvestment}
      />
    </div>
  );
}
