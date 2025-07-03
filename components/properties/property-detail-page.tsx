"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  SquareStack,
  Tag,
  Check,
  FileText,
  ArrowLeft,
  Home,
  Calendar,
  Clock,
  Wallet,
  Download,
  Share2,
  Star,
  Info,
  Loader2,
  AlertCircle,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  MessageCircle,
  X,
} from "lucide-react";
import { useProperty } from "@/contexts/property-context";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { useWallet } from "@/contexts/wallet-context";

// Get property status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Sold Out":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "Coming Soon":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

// Get plot status badge color
const getPlotStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Reserved":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "Sold":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { getPropertyById, initiatePropertyPurchase, isPurchasing } =
    useProperty();
  const { user } = useAuth();
  const {
    wallet,
    fundWallet,
    refreshWalletData,
    isLoading: walletLoading,
  } = useWallet();
  const balance = wallet?.balance || 0;

  const [property, setProperty] = useState<any>(null);
  const [selectedPlots, setSelectedPlots] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const propertyId = params?.id as string;
  const totalAmount = selectedPlots.reduce(
    (sum, plot) => sum + Number(plot.price),
    0
  );
  const hasInsufficientFunds = totalAmount > balance;

  // Check if user is admin or super_admin
  const isAdminUser = user?.role === "admin" || user?.role === "super_admin";

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const data = await getPropertyById(propertyId);

        if (data) {
          setProperty(data);
        } else {
          toast.error("Property not found");
          router.push("/properties");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property details");
        router.push("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, getPropertyById, router]);

  // Handle plot selection - use plotId instead of _id
  const handlePlotSelection = useCallback((plot: any) => {
    if (plot.status !== "Available") return;

    setSelectedPlots((prev) => {
      const isSelected = prev.some((p) => p.plotId === plot.plotId);
      if (isSelected) {
        return prev.filter((p) => p.plotId !== plot.plotId);
      } else {
        return [...prev, plot];
      }
    });
  }, []);

  // Handle payment
  const handlePayment = useCallback(() => {
    if (selectedPlots.length === 0) {
      toast.error("Please select at least one plot");
      return;
    }

    setIsPaymentOpen(true);
  }, [selectedPlots.length]);

  // Process payment - use plotId instead of _id
  const processPropertyPayment = useCallback(async () => {
    if (selectedPlots.length === 0) return;

    setError(null);

    try {
      // Use plotId instead of _id for the API call
      const plotIds = selectedPlots.map((plot) => plot.plotId);

      console.log("Sending plot IDs:", plotIds);

      const success = await initiatePropertyPurchase(propertyId, plotIds);

      if (success) {
        toast.success("Payment successful", {
          description: `You have successfully purchased ${selectedPlots.length} plot(s)`,
        });

        // Close payment dialog/drawer and reset selection
        setIsPaymentOpen(false);
        setSelectedPlots([]);

        // Refresh property data to update plot status
        const updatedProperty = await getPropertyById(propertyId);
        if (updatedProperty) {
          setProperty(updatedProperty);
        }

        // Refresh wallet data
        await refreshWalletData();

        setTimeout(() => {
          router.push("/dashboard/myproperties");
        }, 1500);
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during payment");
    }
  }, [
    selectedPlots,
    propertyId,
    initiatePropertyPurchase,
    getPropertyById,
    refreshWalletData,
  ]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push("/dashboard/properties");
  }, [router]);

  // Handle share functionality
  const handleShare = useCallback(
    (platform: string) => {
      const shareUrl = window.location.href;
      const shareTitle = property?.title || "Check out this property";
      const shareDescription = property?.description
        ? stripHtmlTags(property.description).substring(0, 150) + "..."
        : "Check out this amazing property listing!";

      let shareLink = "";

      switch (platform) {
        case "facebook":
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}&quote=${encodeURIComponent(shareTitle)}`;
          break;
        case "twitter":
          shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            shareUrl
          )}&text=${encodeURIComponent(shareTitle)}`;
          break;
        case "linkedin":
          shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
          )}`;
          break;
        case "whatsapp":
          shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            shareTitle + " " + shareUrl
          )}`;
          break;
        case "email":
          shareLink = `mailto:?subject=${encodeURIComponent(
            shareTitle
          )}&body=${encodeURIComponent(shareDescription + "\n\n" + shareUrl)}`;
          break;
        case "copy":
          navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard");
          setShareDialogOpen(false);
          return;
        case "native":
          if (navigator.share) {
            navigator
              .share({
                title: shareTitle,
                text: shareDescription,
                url: shareUrl,
              })
              .catch((err) => {
                console.error("Error sharing:", err);
              })
              .finally(() => {
                setShareDialogOpen(false);
              });
            return;
          } else {
            // Fallback to copy if Web Share API is not available
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
            setShareDialogOpen(false);
            return;
          }
      }

      // Open share link in a new window
      if (shareLink) {
        window.open(shareLink, "_blank", "noopener,noreferrer");
        setShareDialogOpen(false);
      }
    },
    [property]
  );

  const stripHtmlTags = useCallback((html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }, []);

  const setActiveTabCallback = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  if (isLoading || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading property details...</p>
      </div>
    );
  }

  // Payment UI - Dialog for desktop, Drawer for mobile
  const PaymentUI = () => {
    const PaymentContent = () => (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Wallet Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/fund-wallet")}
            >
              Top Up
            </Button>
          </div>

          <Separator />

          <div>
            <p className="font-medium mb-2">Selected Plots</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {selectedPlots.map((plot) => (
                <div
                  key={plot.plotId}
                  className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                >
                  <div>
                    <p className="font-medium">{plot.plotId}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {plot.size}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(Number(plot.price))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="font-medium">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Processing Fee</p>
              <p className="font-medium">{formatCurrency(0)}</p>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p>{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {hasInsufficientFunds && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Insufficient funds</p>
                <p className="text-sm">
                  Please top up your wallet to complete this purchase.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>
      </>
    );

    return isMobile ? (
      <Drawer open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Complete Purchase</DrawerTitle>
            <DrawerDescription>Pay with your wallet balance</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <PaymentContent />
          </div>
          <DrawerFooter>
            <Button
              onClick={processPropertyPayment}
              disabled={
                isPurchasing ||
                hasInsufficientFunds ||
                selectedPlots.length === 0
              }
              className="w-full"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay {formatCurrency(totalAmount)}</>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>Pay with your wallet balance</DialogDescription>
          </DialogHeader>
          <PaymentContent />
          <DialogFooter>
            <Button
              onClick={processPropertyPayment}
              disabled={
                isPurchasing ||
                hasInsufficientFunds ||
                selectedPlots.length === 0
              }
              className="w-full"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay {formatCurrency(totalAmount)}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PaymentUI />

      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>

        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex flex-row items-center gap-2"
              >
                <Home className="h-3.5 w-3.5 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/properties">
                Properties
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{property.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
              <span className="text-muted-foreground">•</span>
              <Badge className={getStatusColor(property.status)}>
                {property.status}
              </Badge>
              {property.featured && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  >
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share this property</DialogTitle>
                  <DialogDescription>
                    Share this property with your friends and network
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2 py-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {property.thumbnail ? (
                      <img
                        src={property.thumbnail || "/placeholder.svg"}
                        alt={property.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 m-3 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="truncate text-sm font-medium">
                      {property.title}
                    </h4>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {stripHtmlTags(property.description).substring(0, 100)}...
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-1 p-3"
                    onClick={() => handleShare("facebook")}
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-1 p-3"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="h-5 w-5 text-sky-500" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-1 p-3"
                    onClick={() => handleShare("linkedin")}
                  >
                    <Linkedin className="h-5 w-5 text-blue-700" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-1 p-3"
                    onClick={() => handleShare("whatsapp")}
                  >
                    <MessageCircle className="h-5 w-5 text-green-500" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-1 p-3"
                    onClick={() => handleShare("email")}
                  >
                    <Mail className="h-5 w-5 text-red-500" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-1 p-3"
                    onClick={() => handleShare("copy")}
                  >
                    <Copy className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>

                {typeof navigator.share === "function" && (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => handleShare("native")}
                  >
                    Use device sharing
                  </Button>
                )}

                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2 w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            {/* Only show Pay button if user is not admin or super_admin */}
            {user && !isAdminUser && (
              <Button
                onClick={handlePayment}
                disabled={selectedPlots.length === 0}
                className="h-9 bg-gradient-to-r from-primary to-primary/80"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Pay for Selected Plots
                {selectedPlots.length > 0 && ` (${selectedPlots.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardContent className="p-0">
              <Carousel className="w-full">
                <CarouselContent>
                  {property.thumbnail ? (
                    <CarouselItem>
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
                        <img
                          src={property.thumbnail || "/placeholder.svg"}
                          alt={property.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </CarouselItem>
                  ) : (
                    <CarouselItem>
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl bg-muted flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground/40" />
                      </div>
                    </CarouselItem>
                  )}

                  {property.gallery &&
                    property.gallery.map((image: string, index: number) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${property.title} - Image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </CardContent>
          </Card>

          {/* Property Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTabCallback}
                className="w-full"
              >
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 font-medium"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="plots"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 font-medium"
                  >
                    Available Plots
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 font-medium"
                  >
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        Property Description
                      </h2>
                      <div
                        className="text-muted-foreground space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: property.description,
                        }}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        Property Details
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Property Type
                            </p>
                            <p className="font-medium">{property.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <SquareStack className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Plot Size
                            </p>
                            <p className="font-medium">
                              {property.plotSize} SQM
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Tag className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Plots
                            </p>
                            <p className="font-medium">{property.totalPlots}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Available Plots
                            </p>
                            <p className="font-medium">
                              {property.availablePlots}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Listed Date
                            </p>
                            <p className="font-medium">
                              {formatDate(property.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Last Updated
                            </p>
                            <p className="font-medium">
                              {formatDate(property.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {property.amenities.map((amenity: string) => (
                          <div
                            key={amenity}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="plots" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Available Plots</h2>
                      {selectedPlots.length > 0 && (
                        <Badge variant="outline" className="px-3 py-1">
                          {selectedPlots.length} plot
                          {selectedPlots.length !== 1 ? "s" : ""} selected
                        </Badge>
                      )}
                    </div>

                    {property.plots && property.plots.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {property.plots.map((plot: any) => (
                          <div
                            key={plot.plotId}
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer transition-all",
                              plot.status === "Available"
                                ? "hover:border-primary hover:shadow-md"
                                : "opacity-70 cursor-not-allowed",
                              selectedPlots.some(
                                (p) => p.plotId === plot.plotId
                              ) && "border-primary bg-primary/5"
                            )}
                            onClick={() => handlePlotSelection(plot)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{plot.plotId}</h3>
                              <Badge
                                className={getPlotStatusColor(plot.status)}
                              >
                                {plot.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Size:
                                </span>
                                <span className="font-medium">{plot.size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Price:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(Number(plot.price))}
                                </span>
                              </div>
                            </div>

                            {plot.status === "Available" && (
                              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  {selectedPlots.some(
                                    (p) => p.plotId === plot.plotId
                                  )
                                    ? "Selected"
                                    : "Select plot"}
                                </span>
                                {selectedPlots.some(
                                  (p) => p.plotId === plot.plotId
                                ) ? (
                                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30"></div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed rounded-lg">
                        <Info className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          No plots available for this property.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="p-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      Property Documents
                    </h2>

                    {property.documents && property.documents.length > 0 ? (
                      <div className="space-y-3">
                        {property.documents.map(
                          (doc: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    Document {index + 1}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    PDF Document
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed rounded-lg">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          No documents available for this property.
                        </p>
                      </div>
                    )}

                    {property.planFile && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">
                          Property Plan
                        </h3>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium">Master Plan</p>
                              <p className="text-sm text-muted-foreground">
                                Property Layout
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={property.planFile}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View Plan
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Property Price Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {formatCurrency(property.price)}
              </CardTitle>
              <CardDescription>Starting price per plot</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{property.type}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Plot Size</p>
                    <p className="font-medium">{property.plotSize} SQM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Availability
                    </p>
                    <p className="font-medium">
                      {property.availablePlots} of {property.totalPlots} plots
                    </p>
                  </div>
                  <div className="w-16 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${
                          (property.availablePlots / property.totalPlots) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => setActiveTabCallback("plots")}
                className="w-full"
              >
                View Available Plots
              </Button>

              {/* Only show Pay button if user is not admin or super_admin */}
              {selectedPlots.length > 0 && !isAdminUser && (
                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Pay for {selectedPlots.length} Plot
                  {selectedPlots.length !== 1 ? "s" : ""}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Company Card */}
          {property.companyId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Developer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage
                      src={
                        property.companyLogo ||
                        "/placeholder.svg?height=48&width=48&query=company" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {property.companyName?.substring(0, 2).toUpperCase() ||
                        "CO"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {property.companyName || "Company Name"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Property Developer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
