"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BanknoteIcon,
  Wallet,
  ArrowUpRight,
  LayoutDashboard,
  CircleDollarSign,
  ShieldCheck,
  Building2,
  ArrowRight,
  Plus,
  AlertCircle,
  BadgePercent,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useWallet } from "@/contexts/wallet-context";
import { toast } from "sonner";

export default function WithdrawMoneyPage() {
  const router = useRouter();
  const { wallet, bankAccounts, withdrawMoney, isLoading } = useWallet();
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    // Set default account if available
    const defaultAccount = bankAccounts.find((account) => account.isDefault);
    if (defaultAccount) {
      setSelectedAccountId(defaultAccount._id);
    } else if (bankAccounts.length > 0) {
      setSelectedAccountId(bankAccounts[0]._id);
    }
  }, [bankAccounts]);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
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

    if (amountValue < 1000) {
      toast.error("Invalid Amount", {
        description: "Amount must be at least ₦1,000",
      });
      return;
    }

    if (!selectedAccountId) {
      toast.error("No Bank Account", {
        description: "Please select a bank account",
      });
      return;
    }

    const success = await withdrawMoney(amountValue, selectedAccountId, note);

    if (success) {
      toast.success("Withdrawal Initiated", {
        description: "Your withdrawal request has been submitted successfully",
      });

      // Redirect to wallet page after a delay
      setTimeout(() => {
        router.push("/dashboard/my-wallet");
      }, 2000);
    }
  };

  const handleAddBankAccount = () => {
    router.push("/dashboard/my-bank-account");
  };

  return (
    <>
      <div className="space-y-8 pb-10">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                <div className="mr-3 bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-lg shadow-md">
                  <ArrowUpRight className="h-6 w-6 text-white" />
                </div>
                Withdraw Money
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
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    Withdraw Money
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
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="amount"
                          className="text-base font-medium"
                        >
                          Amount (₦)
                        </Label>
                        <Badge
                          variant="outline"
                          className="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-800/50"
                        >
                          Min: ₦1,000
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
                          onClick={() => handleQuickAmount("5000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 ${
                            amount === "5000"
                              ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                              : ""
                          }`}
                        >
                          ₦5,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("10000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 ${
                            amount === "10000"
                              ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                              : ""
                          }`}
                        >
                          ₦10,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("20000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 ${
                            amount === "20000"
                              ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                              : ""
                          }`}
                        >
                          ₦20,000
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickAmount("50000")}
                          className={`rounded-xl border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 ${
                            amount === "50000"
                              ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                              : ""
                          }`}
                        >
                          ₦50,000
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label
                          htmlFor="bankAccount"
                          className="text-base font-medium"
                        >
                          Bank Account
                        </Label>
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleAddBankAccount}
                          className="text-xs p-0 h-auto text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add New Account
                        </Button>
                      </div>

                      {bankAccounts.length === 0 ? (
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-xl border border-rose-100 dark:border-rose-800/30">
                          <div className="flex items-start">
                            <div className="relative mr-3 mt-0.5">
                              <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px]"></div>
                              <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-rose-700 dark:text-rose-300">
                                No Bank Accounts Found
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-3">
                                You don't have any bank accounts linked to your
                                wallet. Add a bank account to withdraw funds.
                              </p>
                              <Button
                                type="button"
                                onClick={handleAddBankAccount}
                                className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md text-white"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Bank Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Select
                          value={selectedAccountId}
                          onValueChange={setSelectedAccountId}
                          required
                        >
                          <SelectTrigger
                            id="bankAccount"
                            className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                            <SelectValue placeholder="Select bank account" />
                          </SelectTrigger>
                          <SelectContent>
                            {bankAccounts.map((account) => (
                              <SelectItem key={account._id} value={account._id}>
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2 text-slate-500" />
                                  <span>
                                    {account.bankName} - {account.accountNumber}
                                    {account.isDefault && " (Default)"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-base font-medium">
                        Note (Optional)
                      </Label>
                      <Input
                        id="note"
                        placeholder="Add a note for this withdrawal"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800/30">
                      <div className="flex items-start">
                        <div className="relative mr-3 mt-0.5">
                          <div className="absolute inset-0 bg-rose-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-rose-700 dark:text-rose-300">
                            Processing Time
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Withdrawals typically take 1-2 business days to
                            process and appear in your bank account.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md text-white"
                      disabled={
                        isLoading || bankAccounts.length === 0 || !amount
                      }
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-5 w-5 mr-2" />
                          Withdraw Funds
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
                    <BanknoteIcon className="h-5 w-5 mr-2 text-rose-500" />
                    Withdrawal Summary
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
                        Withdrawal Amount:
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
                        Total to Receive:
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
                            Secure Withdrawals
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            All withdrawals are secure and encrypted. For
                            security reasons, you can only withdraw to bank
                            accounts that are registered in your name.
                          </p>
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
                    <BadgePercent className="h-5 w-5 mr-2 text-rose-500" />
                    Withdrawal Limits
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-2 rounded-full">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Minimum Withdrawal
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          The minimum withdrawal amount is ₦1,000 per
                          transaction.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Maximum Withdrawal
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          The maximum withdrawal amount is ₦1,000,000 per
                          transaction.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                          <CircleDollarSign className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Daily Limit
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Your daily withdrawal limit is ₦5,000,000 across all
                          transactions.
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
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
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
