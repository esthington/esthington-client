"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileText,
  Info,
  LayoutDashboard,
  Loader2,
  Share2,
  Wallet,
  XCircle,
  Home,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FadeIn from "@/components/animations/fade-in";
import { useWallet } from "@/contexts/wallet-context";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function TransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const transactionId = params.id as string;
  const { getTransactionById } = useWallet();
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    console.log("Transaction ID:", transactionId);
    const fetchTransaction = async () => {
      setIsLoading(true);
      try {
        const data = await getTransactionById(transactionId);
        if (data) {
          setTransaction(data);
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to load transaction details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, getTransactionById, toast]);

  // Handle transaction approval (admin only)
  const handleApproveTransaction = async () => {
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: "Approved by admin" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction approved successfully",
        });

        // Refresh transaction data
        const updatedTransaction = await getTransactionById(transactionId);
        if (updatedTransaction) {
          setTransaction(updatedTransaction);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve transaction");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transaction rejection (admin only)
  const handleRejectTransaction = async () => {
    if (!isAdmin || !rejectionReason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction rejected successfully",
        });

        // Refresh transaction data
        const updatedTransaction = await getTransactionById(transactionId);
        if (updatedTransaction) {
          setTransaction(updatedTransaction);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject transaction");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setRejectionReason("");
    }
  };

  // Generate PDF receipt
  const generateReceipt = async () => {
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/receipt`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        // Create a blob from the PDF Stream
        const blob = await response.blob();
        // Create a link element, use it to download the blob, then remove it
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `receipt-${transaction.reference}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate receipt");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-slate-400 mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Loading transaction details...
        </p>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Transaction Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The transaction you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button
          onClick={() => router.push("/dashboard/my-transactions")}
          className="rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Transactions
        </Button>
      </div>
    );
  }

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          textColor: "text-emerald-700 dark:text-emerald-300",
          borderColor: "border-emerald-200 dark:border-emerald-800/50",
          message: "This transaction has been completed successfully.",
        };
      case "pending":
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          textColor: "text-amber-700 dark:text-amber-300",
          borderColor: "border-amber-200 dark:border-amber-800/50",
          message: "This transaction is currently being processed.",
        };
      case "failed":
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: "text-rose-500",
          bgColor: "bg-rose-50 dark:bg-rose-900/20",
          textColor: "text-rose-700 dark:text-rose-300",
          borderColor: "border-rose-200 dark:border-rose-800/50",
          message: "This transaction has failed to process.",
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          color: "text-slate-500",
          bgColor: "bg-slate-100 dark:bg-slate-800",
          textColor: "text-slate-700 dark:text-slate-300",
          borderColor: "border-slate-200 dark:border-slate-700",
          message: "Transaction status unknown.",
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Wallet className="h-5 w-5 text-emerald-500" />;
      case "withdrawal":
        return <CreditCard className="h-5 w-5 text-rose-500" />;
      case "transfer":
        return <Share2 className="h-5 w-5 text-violet-500" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "refund":
        return <CreditCard className="h-5 w-5 text-amber-500" />;
      case "investment":
        return <BarChart3 className="h-5 w-5 text-cyan-500" />;
      case "property_purchase":
        return <Home className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  const statusDetails = getStatusDetails(transaction.status);

  return (
    <div className="space-y-8 pb-10">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <div className="mr-3 bg-gradient-to-br from-slate-500 to-slate-600 p-2 rounded-lg shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Transaction Details
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              onClick={() => router.push("/dashboard/my-transactions")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              onClick={generateReceipt}
            >
              <Download className="h-4 w-4 mr-2" /> Receipt
            </Button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/my-wallet"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <Wallet className="h-3.5 w-3.5 mr-1" />
                  My Wallet
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/my-transactions"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Transactions
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  {transaction.reference.substring(0, 8)}...
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                  {getTypeIcon(transaction.type)}
                  <span className="ml-2">
                    {transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1).replace("_", " ")}
                  </span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {transaction.description}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    transaction.type === "deposit" ||
                    transaction.type === "refund"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {transaction.type === "deposit" ||
                  transaction.type === "refund"
                    ? "+"
                    : "-"}
                  ₦{transaction.amount.toLocaleString()}
                </div>
                <Badge
                  variant="outline"
                  className={`mt-2 ${statusDetails.bgColor} ${statusDetails.textColor} ${statusDetails.borderColor}`}
                >
                  <span className={`mr-1 ${statusDetails.color}`}>
                    {statusDetails.icon}
                  </span>
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl mb-6 ${statusDetails.bgColor} border ${statusDetails.borderColor}`}
            >
              <div className="flex items-start">
                <div className={`${statusDetails.color} mr-3 mt-0.5`}>
                  {statusDetails.icon}
                </div>
                <div>
                  <p className={`${statusDetails.textColor}`}>
                    {statusDetails.message}
                  </p>
                  {isAdmin && transaction.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleApproveTransaction}
                        disabled={isSubmitting}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve Transaction
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 hover:bg-rose-50 text-rose-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Transaction
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Reject Transaction</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this
                              transaction. This will be visible to the user.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Textarea
                              placeholder="Reason for rejection"
                              value={rejectionReason}
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                              className="min-h-[100px]"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={handleRejectTransaction}
                              disabled={!rejectionReason.trim() || isSubmitting}
                              className="bg-rose-500 hover:bg-rose-600 text-white"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Reject Transaction
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                  Transaction Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Reference
                    </span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      {transaction.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Date
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(transaction.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Type
                    </span>
                    <span className="text-slate-900 dark:text-white capitalize">
                      {transaction.type.replace("_", " ")}
                    </span>
                  </div>
                  {transaction.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Payment Method
                      </span>
                      <span className="text-slate-900 dark:text-white capitalize">
                        {transaction.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {(transaction.recipient || transaction.sender) && (
                  <>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                      {transaction.type === "transfer"
                        ? "Transfer Details"
                        : "Payment Details"}
                    </h3>
                    <div className="space-y-4">
                      {transaction.recipient && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Recipient
                          </span>
                          <span className="text-slate-900 dark:text-white">
                            {transaction.recipient}
                          </span>
                        </div>
                      )}
                      {transaction.sender && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Sender
                          </span>
                          <span className="text-slate-900 dark:text-white">
                            {transaction.sender}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {transaction.property && (
                  <>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                      Property Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Property ID
                        </span>
                        <span className="text-slate-900 dark:text-white font-mono">
                          {transaction.property}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {transaction.investment && (
                  <>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                      Investment Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Investment ID
                        </span>
                        <span className="text-slate-900 dark:text-white font-mono">
                          {transaction.investment}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {transaction.metadata &&
                  Object.keys(transaction.metadata).length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                        Additional Information
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(transaction.metadata).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400 capitalize">
                                {key.replace("_", " ")}
                              </span>
                              <span className="text-slate-900 dark:text-white">
                                {String(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            onClick={() => router.push("/dashboard/my-transactions")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Transactions
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            onClick={() => router.push("/dashboard/my-wallet")}
          >
            <Wallet className="h-4 w-4 mr-2" /> Go to Wallet
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
