"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Share2,
  MapPin,
  Package,
  Truck,
  ShieldCheck,
  Star,
  Minus,
  Plus,
  Tag,
  Clock,
  BarChart,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Mail,
  MessageCircle,
  X,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
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
import PageTransition from "@/components/animations/page-transition";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import { useMarketplace } from "@/contexts/marketplace-context";
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions";
import { useWallet } from "@/contexts/wallet-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function ViewMarketplaceListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const {
    wallet,
    fundWallet,
    refreshWalletData,
    isLoading: walletLoading,
  } = useWallet();
  const balance = wallet?.balance || 0;

  const { getListing, isLoading, buyProperty } = useMarketplace();
  const { hasPermission } = useMarketplacePermissions();
  const [listing, setListing] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const totalAmount = listing
    ? (listing.discountedPrice || listing.price) * quantity
    : 0;
  const hasInsufficientFunds = totalAmount > balance;

  // Check if user is admin or super_admin
  const isAdminUser = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        toast.error("Invalid listing ID");
        router.push("/marketplace");
        return;
      }

      try {
        const data = await getListing(listingId);
        if (data) {
          setListing(data);
        } else {
          toast.error("Product not found");
          router.push("/marketplace");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        router.push("/marketplace");
      }
    };

    fetchListing();
  }, [listingId]);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= (listing?.quantity || 1)) {
      setQuantity(value);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to continue", {
        description: "You need to be logged in to make a purchase",
      });
      return;
    }

    setIsPaymentOpen(true);
  };

  const processPayment = async () => {
    if (!listing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const success = await buyProperty(listingId);

      if (success) {
        toast.success("Payment successful", {
          description: `You have successfully purchased ${quantity} ${
            quantity > 1 ? "items" : "item"
          }`,
        });

        // Close payment dialog/drawer
        setIsPaymentOpen(false);

        // Refresh wallet data
        await refreshWalletData();

        // Redirect to success page or dashboard
        setTimeout(() => {
          router.push("/dashboard/purchases");
        }, 1500);
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareTitle = listing?.title || "Check out this product";
    const shareDescription = listing?.description
      ? stripHtmlTags(listing.description).substring(0, 150) + "..."
      : "Check out this amazing product on our marketplace!";
    const shareImage =
      listing?.images?.[0] || "/diverse-products-still-life.png";

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
  };

  const stripHtmlTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
            <p className="font-medium mb-2">Purchase Summary</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md flex-shrink-0">
                    <Image
                      src={
                        listing?.images?.[0] ||
                        "/diverse-products-still-life.png"
                      }
                      alt={listing?.title || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{listing?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {formatCurrency(
                    (listing?.discountedPrice || listing?.price) * quantity
                  )}
                </p>
              </div>
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
              onClick={processPayment}
              disabled={isProcessing || hasInsufficientFunds}
              className="w-full"
            >
              {isProcessing ? (
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
              onClick={processPayment}
              disabled={isProcessing || hasInsufficientFunds}
              className="w-full"
            >
              {isProcessing ? (
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

  if (isLoading || !listing) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const discount = listing.discountedPrice
    ? Math.round(
        ((listing.price - listing.discountedPrice) / listing.price) * 100
      )
    : 0;

  // Get the first image for sharing
  const mainImage =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : "/diverse-products-still-life.png";

  return (
    <PageTransition>
      {/* Add Open Graph meta tags for sharing */}
      <head>
        <meta property="og:title" content={listing.title} />
        <meta
          property="og:description"
          content={stripHtmlTags(listing.description).substring(0, 150) + "..."}
        />
        <meta property="og:image" content={mainImage} />
        <meta
          property="og:url"
          content={typeof window !== "undefined" ? window.location.href : ""}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </head>

      <PaymentUI />

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/marketplace">Marketplace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {listing.categories && listing.categories[0] && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/marketplace?category=${listing.categories[0]}`}
                    >
                      {listing.categories[0]}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{listing.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <FadeIn className="order-2 lg:order-1">
            <div className="sticky top-24 space-y-4">
              <Carousel className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <CarouselContent>
                  {listing.images && listing.images.length > 0 ? (
                    listing.images.map((image: string, index: number) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square w-full overflow-hidden">
                          <Image
                            src={
                              image ||
                              "/placeholder.svg?height=600&width=600&query=product"
                            }
                            alt={`${listing.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                          {discount > 0 && index === 0 && (
                            <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                              {discount}% OFF
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                          src="/diverse-products-still-life.png"
                          alt={listing.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>

              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {listing.images
                    .slice(0, 5)
                    .map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-md border border-border hover:border-primary"
                        onClick={() => {
                          const carousel = document.querySelector(
                            '[data-carousel-container="true"]'
                          );
                          if (carousel) {
                            const items = carousel.querySelectorAll(
                              '[data-carousel-item="true"]'
                            );
                            if (items && items[index]) {
                              items[index].scrollIntoView({
                                behavior: "smooth",
                                block: "nearest",
                              });
                            }
                          }
                        }}
                      >
                        <Image
                          src={
                            image ||
                            "/placeholder.svg?height=100&width=100&query=product"
                          }
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Product Info */}
          <div className="order-1 lg:order-2">
            <StaggerChildren>
              <StaggerItem>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    {listing.featured && (
                      <Badge className="bg-violet-500 text-white hover:bg-violet-600">
                        Featured
                      </Badge>
                    )}
                    {listing.trending && (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                        Trending
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-muted-foreground">
                      {listing.type}
                    </Badge>
                  </div>
                  <h1 className="mt-2 text-3xl font-bold text-foreground">
                    {listing.title}
                  </h1>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= 4
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        (24 reviews)
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-5" />
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="mr-1 h-4 w-4" />
                      <span>SKU: {listing.sku || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {listing.discountedPrice ? (
                      <>
                        <span className="text-3xl font-bold text-foreground">
                          {formatCurrency(listing.discountedPrice)}
                        </span>
                        <span className="text-xl text-muted-foreground line-through">
                          {formatCurrency(listing.price)}
                        </span>
                        <Badge className="ml-2 bg-green-500 text-white hover:bg-green-600">
                          Save{" "}
                          {formatCurrency(
                            listing.price - listing.discountedPrice
                          )}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-foreground">
                        {formatCurrency(listing.price)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      Listed on{" "}
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{listing.location}</span>
                  </div>

                  {listing.companyId && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4 text-primary" />
                      <span>Sold by {listing.companyId.name || "Company"}</span>
                    </div>
                  )}
                </div>
              </StaggerItem>

              <StaggerItem>
                <AnimatedCard className="mb-6 overflow-hidden border-border bg-card/50 p-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex flex-col items-center justify-center text-center">
                      <ShieldCheck className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Authentic Product
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <Truck className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Fast Delivery
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <Package className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Secure Packaging
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <BarChart className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Quality Checked
                      </span>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>

              {listing.variations && listing.variations.length > 0 && (
                <StaggerItem>
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-medium text-foreground">
                      Options
                    </h3>
                    {listing.variations.map((variation: any) => (
                      <div key={variation.id} className="mb-4">
                        <h4 className="mb-2 text-sm text-muted-foreground">
                          {variation.name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {variation.options.map((option: any) => (
                            <Button
                              key={option.id}
                              variant="outline"
                              className="h-9 border-primary/30 hover:border-primary hover:bg-primary/10"
                            >
                              {option.name}
                              {option.price > 0 &&
                                ` (+${formatCurrency(option.price)})`}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </StaggerItem>
              )}

              <StaggerItem>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">
                      Quantity
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {listing.quantity > 10
                        ? "In Stock"
                        : listing.quantity > 0
                        ? `Only ${listing.quantity} left`
                        : "Out of Stock"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-r-none"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || listing.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          Number.parseInt(e.target.value) || 1
                        )
                      }
                      min={1}
                      max={listing.quantity}
                      className="h-10 w-16 rounded-none border-x-0 text-center"
                      disabled={listing.quantity <= 0}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-l-none"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        quantity >= listing.quantity || listing.quantity <= 0
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  {/* Only show Buy Now button if user is not admin or super_admin */}
                  {!isAdminUser && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-md"
                      size="lg"
                      onClick={handleBuyNow}
                      disabled={listing.quantity <= 0}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Buy Now
                    </Button>
                  )}

                  <Dialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={`flex-1 border-primary/50 hover:bg-primary/10 ${
                          isAdminUser ? "w-full" : ""
                        }`}
                        size="lg"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share this product</DialogTitle>
                        <DialogDescription>
                          Share this product with your friends and network
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex items-center space-x-2 py-4">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={mainImage || "/placeholder.svg"}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="truncate text-sm font-medium">
                            {listing.title}
                          </h4>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {stripHtmlTags(listing.description).substring(
                              0,
                              100
                            )}
                            ...
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
                </div>
              </StaggerItem>

              {listing.tags && listing.tags.length > 0 && (
                <StaggerItem>
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-1">
                      {listing.tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-muted text-muted-foreground hover:bg-muted/80"
                          onClick={() => router.push(`/marketplace?tag=${tag}`)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              )}
            </StaggerChildren>
          </div>
        </div>

        {/* Product Details Tabs */}
        <FadeIn delay={0.3}>
          <div className="mt-12">
            <Tabs defaultValue="description" onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Specifications
                </TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="description" className="mt-0">
                  <AnimatedCard className="border-border bg-card/50 p-6">
                    <div
                      ref={descriptionRef}
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: listing.description }}
                    />
                  </AnimatedCard>
                </TabsContent>
                <TabsContent value="specifications" className="mt-0">
                  <AnimatedCard className="border-border bg-card/50 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="mb-4 text-lg font-medium text-foreground">
                          Product Details
                        </h3>
                        <div className="space-y-2">
                          {listing.sku && (
                            <div className="flex justify-between border-b border-border pb-2">
                              <span className="text-muted-foreground">SKU</span>
                              <span className="font-medium text-foreground">
                                {listing.sku}
                              </span>
                            </div>
                          )}
                          {listing.barcode && (
                            <div className="flex justify-between border-b border-border pb-2">
                              <span className="text-muted-foreground">
                                Barcode
                              </span>
                              <span className="font-medium text-foreground">
                                {listing.barcode}
                              </span>
                            </div>
                          )}
                          {listing.weight && (
                            <div className="flex justify-between border-b border-border pb-2">
                              <span className="text-muted-foreground">
                                Weight
                              </span>
                              <span className="font-medium text-foreground">
                                {listing.weight} kg
                              </span>
                            </div>
                          )}
                          {listing.dimensions && (
                            <div className="flex justify-between border-b border-border pb-2">
                              <span className="text-muted-foreground">
                                Dimensions
                              </span>
                              <span className="font-medium text-foreground">
                                {listing.dimensions.length || 0} ×{" "}
                                {listing.dimensions.width || 0} ×{" "}
                                {listing.dimensions.height || 0} cm
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium text-foreground">
                              {listing.type}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span className="font-medium text-foreground capitalize">
                              {listing.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-4 text-lg font-medium text-foreground">
                          Features
                        </h3>
                        <ul className="space-y-2">
                          {listing.features && listing.features.length > 0 ? (
                            listing.features.map(
                              (feature: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <Check className="mr-2 h-5 w-5 text-green-500" />
                                  <span>{feature}</span>
                                </li>
                              )
                            )
                          ) : (
                            <li className="text-muted-foreground">
                              No features specified
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </AnimatedCard>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}

function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
