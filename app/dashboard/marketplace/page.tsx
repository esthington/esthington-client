"use client";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ArrowUpDown,
  Grid3X3,
  List,
  Star,
  Map,
  Filter,
  X,
  AlertCircle,
  Loader2,
  Wallet,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import Image from "next/image";
import { useMarketplace } from "@/contexts/marketplace-context";
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/contexts/wallet-context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

// Add CSS for the description container to handle HTML content properly
const descriptionStyles = `
  .description-container {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .description-container p {
    margin: 0;
  }
  
  .description-container * {
    display: inline;
  }
`;

export default function MarketplacePage() {
  const router = useRouter();
  const {
    listings,
    filteredListings,
    filters,
    setFilters,
    isLoading,
    deleteListing,
  } = useMarketplace();
  const { hasPermission } = useMarketplacePermissions("buyer");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();
  const isMobile = useIsMobile();
  const {
    wallet,
    fundWallet,
    refreshWalletData,
    isLoading: walletLoading,
  } = useWallet();
  const balance = wallet?.balance || 0;

  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [landToDelete, setLandToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug user role
  console.log("Current user role:", user?.role);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  console.log("Is admin:", isAdmin);

  // Extract unique locations, types, and sort options from listings
  const { locations, types, sortOptions } = useMemo(() => {
    // Get unique locations
    const uniqueLocations = Array.from(
      new Set(listings.map((item) => item.location.split(",")[0]))
    )
      .filter(Boolean)
      .sort();

    // Get unique types
    const uniqueTypes = Array.from(new Set(listings.map((item) => item.type)))
      .filter(Boolean)
      .sort();

    // Define sort options
    const sortOpts = [
      { value: "trending", label: "Trending" },
      { value: "featured", label: "Featured" },
      { value: "price-high", label: "Price: High to Low" },
      { value: "price-low", label: "Price: Low to High" },
      { value: "newest", label: "Newest" },
    ];

    return {
      locations: uniqueLocations,
      types: uniqueTypes,
      sortOptions: sortOpts,
    };
  }, [listings]);

  const handleBuyNow = async (land: any) => {
    if (!user) {
      toast.error("Please login to continue", {
        description: "You need to be logged in to make a purchase.",
      });
      return;
    }

    setSelectedLand(land);
    setIsPaymentOpen(true);
  };

  const handleEditListing = (id: string) => {
    router.push(`/dashboard/marketplace/edit/${id}`);
  };

  const handleDeleteListing = (land: any) => {
    setLandToDelete(land);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!landToDelete) return;

    setIsDeleting(true);
    try {
      await deleteListing(landToDelete.id);
      toast.success("Listing deleted successfully", {
        description: `${landToDelete.title} has been removed from the marketplace.`,
      });
      setIsDeleteDialogOpen(false);
      setLandToDelete(null);
    } catch (error) {
      toast.error("Failed to delete listing", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const processPayment = async () => {
    if (!selectedLand) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create a payment reference
      const reference = `LAND-${selectedLand.id}-${Date.now()}`;
      const amount = selectedLand.price;
      const hasInsufficientFunds = amount > balance;

      if (hasInsufficientFunds) {
        setError("Insufficient funds in your wallet");
        setIsProcessing(false);
        return;
      }

      // Process payment using wallet
      const success = await fundWallet(
        amount * -1, // Negative amount for payment
        "marketplace_purchase",
        {
          reference,
          listingId: selectedLand.id,
          description: `Purchase of ${selectedLand.title}`,
        }
      );

      if (success) {
        toast.success("Payment successful", {
          description: `You have successfully purchased ${selectedLand.title}`,
        });

        // Close payment dialog/drawer and reset selection
        setIsPaymentOpen(false);
        setSelectedLand(null);

        // Refresh wallet data
        await refreshWalletData();

        // Navigate to purchases page
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

          {selectedLand && (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Purchase Details</p>
                <div className="flex gap-3 bg-muted/50 p-3 rounded-lg">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        selectedLand.images[0] ||
                        "/placeholder.svg?height=64&width=64&query=land" ||
                        "/placeholder.svg"
                      }
                      alt={selectedLand.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">
                      {selectedLand.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {selectedLand.location}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(selectedLand.price)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {formatCurrency(selectedLand.price)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Processing Fee</p>
                  <p className="font-medium">{formatCurrency(0)}</p>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <p>Total</p>
                  <p>{formatCurrency(selectedLand.price)}</p>
                </div>
              </div>

              {selectedLand.price > balance && (
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
              disabled={
                isProcessing ||
                (selectedLand && selectedLand.price > balance) ||
                !selectedLand
              }
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {selectedLand ? formatCurrency(selectedLand.price) : ""}
                </>
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
              disabled={
                isProcessing ||
                (selectedLand && selectedLand.price > balance) ||
                !selectedLand
              }
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {selectedLand ? formatCurrency(selectedLand.price) : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Delete Confirmation Dialog
  const DeleteConfirmationDialog = () => (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this listing? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {landToDelete && (
            <div className="flex gap-3 bg-muted/50 p-3 rounded-lg">
              <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={
                    landToDelete.images[0] ||
                    "/placeholder.svg?height=64&width=64&query=land" ||
                    "/placeholder.svg"
                  }
                  alt={landToDelete.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium line-clamp-1">{landToDelete.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {landToDelete.location}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(landToDelete.price)}
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-8">
      <style dangerouslySetInnerHTML={{ __html: descriptionStyles }} />
      <PaymentUI />
      <DeleteConfirmationDialog />
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Land Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and purchase premium land properties
            </p>
            {/* Debug info - remove in production */}
            <p className="text-xs text-muted-foreground mt-1">
              User role: {user?.role || "Not logged in"} (Admin:{" "}
              {isAdmin ? "Yes" : "No"})
            </p>
          </div>

          {hasPermission("addListing") && (
            <Button
              onClick={() => router.push("/dashboard/marketplace/add")}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-md transition-all duration-300 hover:shadow-lg"
            >
              Add Listing
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-primary hover:text-primary/80"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Marketplace</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="p-6 bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lands..."
                className="pl-10 bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
              />
            </div>
            <div className="hidden md:flex flex-wrap gap-2">
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ location: value })}
              >
                <SelectTrigger className="w-[140px] bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300">
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ type: value })}
              >
                <SelectTrigger className="w-[140px] bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300">
                  <Map className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Land Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters({ sortBy: value })}
              >
                <SelectTrigger className="w-[140px] bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs
                defaultValue={filters.viewMode}
                onValueChange={(value) =>
                  setFilters({ viewMode: value as "grid" | "list" })
                }
              >
                <TabsList className="h-10 bg-background/50 border border-input/50">
                  <TabsTrigger
                    value="grid"
                    className="px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="md:hidden">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Adjust your search parameters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Select
                        value={filters.location}
                        onValueChange={(value) =>
                          setFilters({ location: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <MapPin className="mr-2 h-4 w-4 text-primary" />
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Land Type</label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters({ type: value })}
                      >
                        <SelectTrigger className="w-full">
                          <Map className="mr-2 h-4 w-4 text-primary" />
                          <SelectValue placeholder="Land Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value) => setFilters({ sortBy: value })}
                      >
                        <SelectTrigger className="w-full">
                          <ArrowUpDown className="mr-2 h-4 w-4 text-primary" />
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">View Mode</label>
                      <Tabs
                        defaultValue={filters.viewMode}
                        onValueChange={(value) =>
                          setFilters({ viewMode: value as "grid" | "list" })
                        }
                        className="w-full"
                      >
                        <TabsList className="w-full">
                          <TabsTrigger value="grid" className="flex-1">
                            <Grid3X3 className="h-4 w-4 mr-2" /> Grid
                          </TabsTrigger>
                          <TabsTrigger value="list" className="flex-1">
                            <List className="h-4 w-4 mr-2" /> List
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Price Range
                        </label>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(filters.priceRange[0])} -{" "}
                          {formatCurrency(filters.priceRange[1])}
                        </span>
                      </div>
                      <Slider
                        value={filters.priceRange}
                        min={5000000}
                        max={300000000}
                        step={5000000}
                        onValueChange={(value) =>
                          setFilters({ priceRange: value as [number, number] })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setFilters({
                            searchQuery: "",
                            location: "all",
                            type: "all",
                            sortBy: "trending",
                            priceRange: [5000000, 300000000],
                            viewMode: filters.viewMode, // Preserve the current view mode
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" /> Clear Filters
                      </Button>
                      <Button
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="mt-6 hidden md:block">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Price Range:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(filters.priceRange[0])} -{" "}
                  {formatCurrency(filters.priceRange[1])}
                </span>
              </div>
              <div className="w-full sm:w-1/2">
                <Slider
                  value={filters.priceRange}
                  min={5000000}
                  max={300000000}
                  step={5000000}
                  onValueChange={(value) =>
                    setFilters({ priceRange: value as [number, number] })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setFilters({
                  searchQuery: "",
                  location: "all",
                  type: "all",
                  sortBy: "trending",
                  priceRange: [5000000, 300000000],
                  viewMode: filters.viewMode, // Preserve the current view mode
                });
              }}
            >
              <X className="h-3.5 w-3.5 mr-1.5" /> Clear Filters
            </Button>
          </div>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" className="text-primary" />
            <p className="mt-4 text-muted-foreground">Loading properties...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Map className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              No lands found
            </h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any lands matching your search criteria. Try
              adjusting your filters or search query.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilters({
                  searchQuery: "",
                  location: "all",
                  type: "all",
                  sortBy: "trending",
                  priceRange: [5000000, 300000000],
                  viewMode: filters.viewMode, // Preserve the current view mode
                });
              }}
            >
              <X className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
          </div>
        ) : filters.viewMode === "grid" ? (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((land) => (
              <StaggerItem key={land.id}>
                <AnimatedCard className="group overflow-hidden bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 hover:border-primary/30">
                  <div className="relative">
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={
                          land.images[0] ||
                          "/placeholder.svg?height=400&width=600&query=beautiful land property"
                        }
                        alt={land.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {land.featured && (
                        <Badge
                          variant="default"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md"
                        >
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      )}
                      {land.trending && (
                        <Badge
                          variant="default"
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0 shadow-md"
                        >
                          <Map className="h-3 w-3 mr-1" /> Hot
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className="bg-black/50 backdrop-blur-md border-white/20 text-white shadow-sm"
                        >
                          {land.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-primary/80 backdrop-blur-md border-primary/30 text-white shadow-sm"
                        >
                          <MapPin className="h-3 w-3 mr-1" />{" "}
                          {land.location.split(",")[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                      {land.title}
                    </h3>
                    <div
                      className="text-sm text-muted-foreground mb-4 line-clamp-2 description-container"
                      dangerouslySetInnerHTML={{
                        __html:
                          land.description ||
                          `Premium ${land.type.toLowerCase()} land located in ${
                            land.location
                          } with ${land.size} of space.`,
                      }}
                    />

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Price
                        </div>
                        <div className="text-foreground font-semibold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(land.price)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() =>
                          router.push(`/dashboard/marketplace/${land.id}`)
                        }
                      >
                        View More
                      </Button>
                    </div>

                    {isAdmin ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditListing(land.id)}
                          className="flex-1 bg-primary text-white"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteListing(land)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleBuyNow(land)}
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                        disabled={!hasPermission("buyProperty")}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    )}
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <StaggerChildren className="space-y-5">
            {filteredListings.map((land) => (
              <StaggerItem key={land.id}>
                <AnimatedCard className="group overflow-hidden bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 hover:border-primary/30">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-72 h-56 sm:h-auto flex-shrink-0 overflow-hidden">
                      <Image
                        src={
                          land.images[0] ||
                          "/placeholder.svg?height=400&width=600&query=beautiful land property"
                        }
                        alt={land.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {land.featured && (
                          <Badge
                            variant="default"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md"
                          >
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {land.trending && (
                          <Badge
                            variant="default"
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0 shadow-md"
                          >
                            <Map className="h-3 w-3 mr-1" /> Hot
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {land.title}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-primary/70" />
                            <span>{land.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className="bg-black/50 backdrop-blur-md border-white/20 text-white shadow-sm"
                          >
                            {land.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-primary/80 backdrop-blur-md border-primary/30 text-white shadow-sm"
                          >
                            {land.size}
                          </Badge>
                        </div>
                      </div>

                      <div
                        className="text-sm text-muted-foreground mb-4 line-clamp-2 description-container"
                        dangerouslySetInnerHTML={{
                          __html:
                            land.description ||
                            `Premium ${land.type.toLowerCase()} land located in ${
                              land.location
                            } with ${land.size} of space.`,
                        }}
                      />

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {land.features.slice(0, 3).map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-muted/70 text-muted-foreground hover:bg-muted transition-colors duration-300"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {land.features.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-muted/70 text-muted-foreground"
                          >
                            +{land.features.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Price
                          </div>
                          <div className="text-foreground font-semibold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            {formatCurrency(land.price)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() =>
                              router.push(`/dashboard/marketplace/${land.id}`)
                            }
                          >
                            View More
                          </Button>

                          {isAdmin ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditListing(land.id)}
                                  className="primary/10 text-white"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteListing(land)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              onClick={() => handleBuyNow(land)}
                              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                              disabled={!hasPermission("buyProperty")}
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              Buy Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </FadeIn>
    </div>
  );
}
