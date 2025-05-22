"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Mail,
  Phone,
  Trash2,
  Users,
  XCircle,
  Calendar,
  FileText,
  BarChart3,
  ExternalLink,
  AlertCircle,
  Info,
  User,
  ArrowUpRight,
  Building2,
  Share2,
  Download,
  MoreHorizontal,
  ChevronRight,
  Link,
  Wallet,
  Activity,
  Eye,
  UserPlus,
  Shield,
  TrendingUp,
  Sparkles,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageTransition from "@/components/animations/page-transition";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import { cn } from "@/lib/utils";
import { useReferrals, ReferralStatus } from "@/contexts/referrals-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReferralDetailPageClient() {
  const { id } = useParams();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [referral, setReferral] = useState<any | null>(null);
  const [refereeList, setRefereeList] = useState<any[]>([]);
  const [commissionHistory, setCommissionHistory] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  const {
    getReferralById,
    getRefereesByReferrerId,
    getReferralCommissionHistory,
    getReferralActivityLog,
    updateReferralStatus,
    deleteReferral,
    isLoading: contextLoading,
  } = useReferrals();

  useEffect(() => {
    const loadReferralData = async () => {
      setIsLoading(true);
      try {
        // Ensure id is a string
        const stringId =
          typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
        if (!stringId) {
          toast.error("Invalid referral ID");
          router.push("/dashboard/referrals");
          return;
        }

        // Fetch the referral details
        const referralData = await getReferralById(stringId);
        if (referralData) {
          setReferral(referralData);

          // Fetch referees (people referred by this referrer)
          const refereesData = await getRefereesByReferrerId(stringId);
          setRefereeList(refereesData || []);

          // Fetch commission history
          const commissionData = await getReferralCommissionHistory(stringId);
          setCommissionHistory(commissionData || []);

          // Fetch activity log
          const activityData = await getReferralActivityLog(stringId);
          setActivityLog(activityData || []);
        } else {
          toast.error("Referral not found");
          router.push("/dashboard/referrals");
        }
      } catch (error) {
        console.error("Error loading referral data:", error);
        toast.error("Failed to load referral data");
      } finally {
        setIsLoading(false);
      }
    };

    loadReferralData();
  }, [
    id,
    // getReferralById,
    // getRefereesByReferrerId,
    // getReferralCommissionHistory,
    // getReferralActivityLog,
    // router,
  ]);

  const handleStatusChange = async (newStatus: ReferralStatus) => {
    if (!referral) return;

    try {
      await updateReferralStatus(referral._id, newStatus);
      setReferral({
        ...referral,
        status: newStatus,
      });
      toast.success(`Referral status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update referral status");
    }
  };

  const handleDeleteReferral = async () => {
    if (!referral) return;

    try {
      await deleteReferral(referral._id);
      setShowDeleteDialog(false);
      toast.success("Referral deleted successfully");

      // Navigate back to referrals list after a short delay
      setTimeout(() => {
        router.push("/dashboard/referrals");
      }, 1500);
    } catch (error) {
      console.error("Error deleting referral:", error);
      toast.error("Failed to delete referral");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || contextLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" className="text-purple-600" />
          <p className="text-muted-foreground animate-pulse">
            Loading referral details...
          </p>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="border-none shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
              <AlertCircle className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Referral Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The referral you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push("/dashboard/referrals")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Return to Referrals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total, pending, and paid commissions
  const totalCommission = refereeList.reduce(
    (sum, referee) => sum + referee.earnings,
    0
  );
  const pendingCommission = refereeList
    .filter((referee) => referee.status === ReferralStatus.PENDING)
    .reduce((sum, referee) => sum + referee.earnings, 0);
  const paidCommission = totalCommission - pendingCommission;

  // Status colors
  const getStatusColor = (status: ReferralStatus) => {
    switch (status) {
      case ReferralStatus.ACTIVE:
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20";
      case ReferralStatus.PENDING:
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
      case ReferralStatus.INACTIVE:
        return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  // Calculate conversion rate
  const activeReferees = refereeList.filter(
    (referee) => referee.status === ReferralStatus.ACTIVE
  ).length;
  const conversionRate =
    refereeList.length > 0
      ? Math.round((activeReferees / refereeList.length) * 100)
      : 0;

  return (
    <TooltipProvider>
      <PageTransition>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <StaggerChildren>
            <StaggerItem>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <Breadcrumb className="mb-2">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">
                          Dashboard
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard/referrals">
                          Referrals
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Referral Details</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Referral Details
                  </h1>
                  <p className="text-muted-foreground">
                    View and manage referral information
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        Actions
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Manage Referral</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/referrals/edit/${id}`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Referral
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Referral Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                      >
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Referral
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Referral</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this referral?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                            <Avatar className="h-10 w-10 border border-red-200 dark:border-red-800">
                              <AvatarImage
                                src={
                                  referral.referrer?.avatar ||
                                  `/placeholder.svg?height=40&width=40&query=${
                                    referral.referrer.firstName ||
                                    "/placeholder.svg"
                                  }+${referral.referrer.lastName}`
                                }
                                alt={`${referral.referrer.firstName} ${referral.referrer.lastName}`}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
                                {referral.referrer.firstName?.[0]}
                                {referral.referrer.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {referral.referrer.firstName}{" "}
                                {referral.referrer.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {referral.referrer.email}
                              </div>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteReferral}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader className="pb-2 pt-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      Total Referees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {refereeList.length}
                      </div>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <UserPlus className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center">
                      <span>
                        {activeReferees} active,{" "}
                        {refereeList.length - activeReferees} pending/inactive
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader className="pb-2 pt-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-emerald-500" />
                      Conversion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {conversionRate}%
                      </div>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={conversionRate} className="h-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader className="pb-2 pt-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-indigo-500" />
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {formatCurrency(totalCommission)}
                      </div>
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                        <Wallet className="h-5 w-5 text-indigo-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center">
                      <span>
                        {formatCurrency(paidCommission)} paid,{" "}
                        {formatCurrency(pendingCommission)} pending
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                      <div className="flex items-center">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                          <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle>Referrer Profile</CardTitle>
                          <CardDescription>
                            Details about the referrer
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="p-6 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4 border-4 border-white dark:border-slate-800 shadow-md">
                            <AvatarImage
                              src={
                                referral.referrer.avatar ||
                                `/placeholder.svg?height=80&width=80&query=${
                                  referral.referrer.firstName ||
                                  "/placeholder.svg"
                                }+${referral.referrer.lastName}`
                              }
                              alt={`${referral.referrer.firstName} ${referral.referrer.lastName}`}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xl">
                              {referral.referrer.firstName?.[0]}
                              {referral.referrer.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-semibold">
                            {referral.referrer.firstName}{" "}
                            {referral.referrer.lastName}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1",
                              getStatusColor(referral.status)
                            )}
                          >
                            {referral.status.charAt(0).toUpperCase() +
                              referral.status.slice(1)}
                          </Badge>
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                              Agent
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              <Shield className="h-3 w-3 mr-1 text-purple-500" />
                              Bronze Tier
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Email
                            </p>
                            <p className="font-medium">
                              {referral.referrer.email}
                            </p>
                          </div>
                        </div>
                        {referral.referrer.phone && (
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Phone
                              </p>
                              <p className="font-medium">
                                {referral.referrer.phone}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Joined
                            </p>
                            <p className="font-medium">
                              {new Date(
                                referral.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Last Updated
                            </p>
                            <p className="font-medium">
                              {new Date(
                                referral.updatedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Link className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Referral Code
                            </p>
                            <div className="flex items-center">
                              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono">
                                {referral.referrer.userName ||
                                  referral._id.substring(0, 8)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-1"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    referral.referrer.userName ||
                                      referral._id.substring(0, 8)
                                  );
                                  toast.success("Referral code copied!");
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="p-6">
                        <h4 className="font-medium mb-4">Change Status</h4>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant={
                              referral.status === ReferralStatus.ACTIVE
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleStatusChange(ReferralStatus.ACTIVE)
                            }
                            className={
                              referral.status === ReferralStatus.ACTIVE
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : ""
                            }
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Active
                          </Button>
                          <Button
                            variant={
                              referral.status === ReferralStatus.PENDING
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleStatusChange(ReferralStatus.PENDING)
                            }
                            className={
                              referral.status === ReferralStatus.PENDING
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : ""
                            }
                          >
                            <Clock className="mr-1 h-4 w-4" />
                            Pending
                          </Button>
                          <Button
                            variant={
                              referral.status === ReferralStatus.INACTIVE
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleStatusChange(ReferralStatus.INACTIVE)
                            }
                            className={
                              referral.status === ReferralStatus.INACTIVE
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : ""
                            }
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Inactive
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md overflow-hidden mt-6">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                          <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <CardTitle>Earnings Summary</CardTitle>
                          <CardDescription>Financial overview</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">
                              Total Earnings
                            </h4>
                            <span className="text-xl font-bold">
                              {formatCurrency(totalCommission)}
                            </span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">
                              Paid Commission
                            </h4>
                            <span className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(paidCommission)}
                            </span>
                          </div>
                          <Progress
                            value={
                              totalCommission > 0
                                ? (paidCommission / totalCommission) * 100
                                : 0
                            }
                            className="h-2 bg-slate-200 dark:bg-slate-700"
                          >
                            <div className="h-full bg-emerald-500" />
                          </Progress>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">
                              Pending Commission
                            </h4>
                            <span className="text-lg font-medium text-amber-600 dark:text-amber-400">
                              {formatCurrency(pendingCommission)}
                            </span>
                          </div>
                          <Progress
                            value={
                              totalCommission > 0
                                ? (pendingCommission / totalCommission) * 100
                                : 0
                            }
                            className="h-2 bg-slate-200 dark:bg-slate-700"
                          >
                            <div className="h-full bg-amber-500" />
                          </Progress>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6">
                      <div className="flex items-center">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle>Referral Details</CardTitle>
                          <CardDescription>
                            Manage referral information and commissions
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Tabs defaultValue="referees" className="w-full">
                        <div className="px-6 pt-6">
                          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full grid grid-cols-3">
                            <TabsTrigger
                              value="referees"
                              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Referees
                            </TabsTrigger>
                            <TabsTrigger
                              value="commissions"
                              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Commissions
                            </TabsTrigger>
                            <TabsTrigger
                              value="activity"
                              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
                            >
                              <Activity className="h-4 w-4 mr-2" />
                              Activity
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value="referees" className="p-6 pt-4">
                          {refereeList.length > 0 ? (
                            <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                              <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                  <TableRow>
                                    <TableHead className="w-[40%]">
                                      Name
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                      Status
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                      Date
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                      Commission
                                    </TableHead>
                                    <TableHead className="w-[15%] text-right">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {refereeList.map((referee) => (
                                    <TableRow
                                      key={referee._id}
                                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                    >
                                      <TableCell>
                                        <HoverCard>
                                          <HoverCardTrigger asChild>
                                            <div className="flex items-center cursor-pointer">
                                              <Avatar className="h-8 w-8 mr-2 border border-slate-200 dark:border-slate-700">
                                                <AvatarImage
                                                  src={
                                                    referee.referred.avatar ||
                                                    `/placeholder.svg?height=32&width=32&query=${
                                                      referee.referred
                                                        .firstName ||
                                                      "/placeholder.svg"
                                                    }+${
                                                      referee.referred.lastName
                                                    }`
                                                  }
                                                  alt={`${referee.referred.firstName} ${referee.referred.lastName}`}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                                  {
                                                    referee.referred
                                                      .firstName?.[0]
                                                  }
                                                  {
                                                    referee.referred
                                                      .lastName?.[0]
                                                  }
                                                </AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <div className="font-medium">
                                                  {referee.referred.firstName}{" "}
                                                  {referee.referred.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                  {referee.referred.email}
                                                </div>
                                              </div>
                                            </div>
                                          </HoverCardTrigger>
                                          <HoverCardContent className="w-80">
                                            <div className="flex justify-between space-x-4">
                                              <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                  src={
                                                    referee.referred.avatar ||
                                                    `/placeholder.svg?height=48&width=48&query=${
                                                      referee.referred
                                                        .firstName ||
                                                      "/placeholder.svg"
                                                    }+${
                                                      referee.referred.lastName
                                                    }`
                                                  }
                                                  alt={`${referee.referred.firstName} ${referee.referred.lastName}`}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                                  {
                                                    referee.referred
                                                      .firstName?.[0]
                                                  }
                                                  {
                                                    referee.referred
                                                      .lastName?.[0]
                                                  }
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="space-y-1">
                                                <h4 className="text-sm font-semibold">
                                                  {referee.referred.firstName}{" "}
                                                  {referee.referred.lastName}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {referee.referred.email}
                                                </p>
                                                <div className="flex items-center pt-1">
                                                  <span className="text-xs text-muted-foreground mr-2">
                                                    Joined:
                                                  </span>
                                                  <span className="text-xs">
                                                    {new Date(
                                                      referee.createdAt
                                                    ).toLocaleDateString()}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </HoverCardContent>
                                        </HoverCard>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={getStatusColor(
                                            referee.status
                                          )}
                                        >
                                          {referee.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            referee.status.slice(1)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          referee.createdAt
                                        ).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(referee.earnings)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">
                                                  Open menu
                                                </span>
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                              align="end"
                                              className="w-[180px]"
                                            >
                                              <DropdownMenuLabel>
                                                Actions
                                              </DropdownMenuLabel>
                                              <DropdownMenuItem asChild>
                                                <button
                                                  className="flex items-center cursor-pointer w-full"
                                                  onClick={() =>
                                                    router.push(
                                                      `/dashboard/referrals/${referee._id}`
                                                    )
                                                  }
                                                >
                                                  <Eye className="h-4 w-4 mr-2" />
                                                  View Details
                                                </button>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <button
                                                  className="flex items-center cursor-pointer w-full"
                                                  onClick={() =>
                                                    router.push(
                                                      `/dashboard/referrals/edit/${referee._id}`
                                                    )
                                                  }
                                                >
                                                  <Edit className="h-4 w-4 mr-2" />
                                                  Edit Referee
                                                </button>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                className="text-red-500 focus:text-red-500"
                                                onClick={() => {
                                                  toast.error(
                                                    "Delete functionality not implemented"
                                                  );
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Referee
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-transparent">
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
                                  <Users className="h-10 w-10 text-slate-400" />
                                </div>
                                <CardTitle className="text-xl mb-2">
                                  No Referees Found
                                </CardTitle>
                                <p className="text-muted-foreground text-center max-w-md mb-6">
                                  This referrer hasn't referred any users yet.
                                </p>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                  <ArrowUpRight className="mr-2 h-4 w-4" />
                                  View Referral Link
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="commissions" className="p-6 pt-4">
                          {commissionHistory && commissionHistory.length > 0 ? (
                            <div className="space-y-4">
                              {commissionHistory.map((commission, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                      <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">
                                        {commission.description}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {commission.details}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">
                                      {formatCurrency(commission.amount)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(
                                        commission.date
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-transparent">
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
                                  <DollarSign className="h-10 w-10 text-slate-400" />
                                </div>
                                <CardTitle className="text-xl mb-2">
                                  No Commission History
                                </CardTitle>
                                <p className="text-muted-foreground text-center max-w-md mb-6">
                                  No commission transactions have been recorded
                                  for this referral yet.
                                </p>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  View Commission Settings
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="activity" className="p-6 pt-4">
                          {activityLog && activityLog.length > 0 ? (
                            <div className="space-y-4">
                              {activityLog.map((activity, index) => (
                                <div
                                  key={index}
                                  className="relative pl-6 pb-6 last:pb-0 before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-purple-200 dark:before:bg-purple-800/50 after:absolute after:left-[-4px] after:top-1 after:h-3 after:w-3 after:rounded-full after:border-2 after:border-purple-500 after:bg-white dark:after:bg-slate-900"
                                >
                                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(
                                        activity.date
                                      ).toLocaleDateString()}{" "}
                                      at{" "}
                                      {new Date(
                                        activity.date
                                      ).toLocaleTimeString()}
                                    </p>
                                    <p className="font-medium mt-1">
                                      {activity.title}
                                    </p>
                                    <p className="text-sm mt-1">
                                      {activity.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-transparent">
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
                                  <Clock className="h-10 w-10 text-slate-400" />
                                </div>
                                <CardTitle className="text-xl mb-2">
                                  No Activity Log
                                </CardTitle>
                                <p className="text-muted-foreground text-center max-w-md mb-6">
                                  No activity has been recorded for this
                                  referral yet.
                                </p>
                                <Button variant="outline">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View System Logs
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          About Referral Management
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          You can manage the status of this referral, view
                          referred users, and track commission history. Changes
                          to the referral status will affect commission
                          calculations and payouts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </PageTransition>
    </TooltipProvider>
  );
}
