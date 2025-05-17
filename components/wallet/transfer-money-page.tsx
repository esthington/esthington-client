"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Wallet,
  Search,
  ArrowRight,
  LayoutDashboard,
  Repeat,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/animations/fade-in";
import Image from "next/image";
import { useWallet } from "@/contexts/wallet-context";
import { toast } from "sonner";
import type { WalletUser } from "@/contexts/wallet-context";

export default function TransferMoneyPage() {
  const router = useRouter();
  const { wallet, recentRecipients, searchUsers, transferMoney, isLoading } =
    useWallet();
  const [amount, setAmount] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [note, setNote] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<WalletUser | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<WalletUser[]>([]);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const handleSearchRecipient = async () => {
    if (!recipientUsername.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedRecipient(null);

    try {
      const results = await searchUsers(recipientUsername);
      setSearchResults(results);

      if (results.length === 0) {
        toast.info("No users found", {
          description:
            "We couldn't find any users with that username. Please try another username.",
        });
      }
    } catch (error) {
      console.error("Error searching for recipient:", error);
      toast.error("Search failed", {
        description:
          "There was a problem searching for users. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipient = (recipient: WalletUser) => {
    setSelectedRecipient(recipient);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = Number.parseInt(amount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount",
      });
      return;
    }

    if (amountValue < 100) {
      toast.error("Invalid Amount", {
        description: "Amount must be at least ₦100",
      });
      return;
    }

    if (!selectedRecipient) {
      toast.error("No Recipient Selected", {
        description: "Please select a recipient for this transfer",
      });
      return;
    }

    try {
      const success = await transferMoney(
        amountValue,
        selectedRecipient._id,
        note
      );

      if (success) {
        toast.success("Transfer Successful", {
          description: `You have successfully transferred ₦${amountValue.toLocaleString()} to ${
            selectedRecipient.firstName
          } ${selectedRecipient.lastName}`,
        });

        // Redirect to wallet page after a delay
        setTimeout(() => {
          router.push("/dashboard/my-wallet");
        }, 2000);
      }
    } catch (error) {
      toast.error("Transfer Failed", {
        description:
          "There was a problem processing your transfer. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="space-y-8 pb-10">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                <div className="mr-3 bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg shadow-md">
                  <Repeat className="h-6 w-6 text-white" />
                </div>
                Transfer Money
              </h1>
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
                  <BreadcrumbPage className="font-medium flex items-center">
                    <Repeat className="h-3.5 w-3.5 mr-1" />
                    Transfer Money
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <Label
                        htmlFor="recipient"
                        className="text-base font-medium"
                      >
                        Recipient
                      </Label>
                      {selectedRecipient ? (
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                              <Image
                                src={
                                  selectedRecipient.avatar ||
                                  "/placeholder.svg?height=40&width=40&query=user"
                                }
                                alt={selectedRecipient.userName}
                                width={40}
                                height={40}
                                className="rounded-full relative"
                              />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                                {selectedRecipient.firstName}{" "}
                                {selectedRecipient.lastName}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                @{selectedRecipient.userName}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRecipient(null)}
                            className="rounded-lg border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                              <Input
                                id="recipient"
                                placeholder="Enter username"
                                className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                                value={recipientUsername}
                                onChange={(e) =>
                                  setRecipientUsername(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={handleSearchRecipient}
                              disabled={
                                isSearching || !recipientUsername.trim()
                              }
                              className="h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
                            >
                              {isSearching ? (
                                <LoadingSpinner
                                  size="sm"
                                  className="text-white"
                                />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {searchResults.length > 0 && (
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                              {searchResults.map((recipient) => (
                                <div
                                  key={recipient._id}
                                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-colors"
                                  onClick={() =>
                                    handleSelectRecipient(recipient)
                                  }
                                >
                                  <Image
                                    src={
                                      recipient.avatar ||
                                      "/placeholder.svg?height=32&width=32&query=user"
                                    }
                                    alt={recipient.userName}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                  <div>
                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                                      {recipient.firstName} {recipient.lastName}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      @{recipient.userName}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {recentRecipients.length > 0 &&
                            !searchResults.length &&
                            !isSearching && (
                              <div className="mt-4">
                                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center">
                                  <Users className="h-4 w-4 mr-1.5 text-violet-500" />
                                  Recent Recipients
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {recentRecipients.map((recipient) => (
                                    <Button
                                      key={recipient._id}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2 rounded-lg border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                      onClick={() =>
                                        handleSelectRecipient(recipient)
                                      }
                                    >
                                      <Image
                                        src={
                                          recipient.avatar ||
                                          "/placeholder.svg?height=20&width=20&query=user"
                                        }
                                        alt={recipient.firstName}
                                        width={20}
                                        height={20}
                                        className="rounded-full"
                                      />
                                      <span>
                                        {recipient.firstName}{" "}
                                        {recipient.lastName}
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="amount"
                          className="text-base font-medium"
                        >
                          Amount (₦)
                        </Label>
                        <Badge
                          variant="outline"
                          className="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 border-violet-200 dark:border-violet-800/50"
                        >
                          Min: ₦100
                        </Badge>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            ₦
                          </span>
                        </div>
                        <Input
                          id="amount"
                          type="text"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          className="pl-8 h-12 text-lg font-medium rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                          required
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("1000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 ${
                            amount === "1000"
                              ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                              : ""
                          }`}
                        >
                          ₦1,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("2000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 ${
                            amount === "2000"
                              ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                              : ""
                          }`}
                        >
                          ₦2,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("5000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 ${
                            amount === "5000"
                              ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                              : ""
                          }`}
                        >
                          ₦5,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("10000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 ${
                            amount === "10000"
                              ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                              : ""
                          }`}
                        >
                          ₦10,000
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-base font-medium">
                        Note (Optional)
                      </Label>
                      <Input
                        id="note"
                        placeholder="Add a note for this transfer"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    </div>

                    <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-100 dark:border-violet-800/30">
                      <div className="flex items-start">
                        <div className="relative mr-3 mt-0.5">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                            <AlertCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Please verify the recipient details before
                            proceeding. All transfers are instant and cannot be
                            reversed once completed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
                      disabled={isLoading || !selectedRecipient || !amount}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-5 w-5 mr-2" />
                          Send Money
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </AnimatedCard>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.3}>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Repeat className="h-5 w-5 mr-2 text-violet-500" />
                    Transfer Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Available Balance:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ₦{wallet?.balance?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Transfer Amount:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ₦
                        {amount
                          ? Number.parseInt(amount).toLocaleString()
                          : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Transaction Fee:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ₦0
                      </span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between">
                      <span className="text-slate-900 dark:text-white font-medium">
                        Total:
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        ₦
                        {amount
                          ? Number.parseInt(amount).toLocaleString()
                          : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start">
                        <div className="relative mr-3 mt-0.5">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                            <ShieldCheck className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            Transfer Information
                          </h3>
                          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                            <p>
                              Transfers between users are instant and free of
                              charge.
                            </p>
                            <p>
                              The minimum transfer amount is ₦100 and the
                              maximum is ₦500,000 per transaction.
                            </p>
                            <p>
                              For security reasons, you may be required to
                              verify your identity for large transfers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800 mt-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-violet-500" />
                    Transfer Status
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Instant Transfers
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Transfers to other users are processed instantly and
                          will be available in their wallet immediately.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-2 rounded-full">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Transfer Limits
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Daily transfer limit is ₦1,000,000. Contact support if
                          you need to increase your limit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                  onClick={() => router.push("/dashboard/my-wallet")}
                >
                  <ArrowRight className="mr-2 h-4 w-4" /> Return to My Wallet
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
