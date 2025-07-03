"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  LayoutDashboard,
  Wallet,
  Building2,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CreditCard,
  X,
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FadeIn from "@/components/animations/fade-in";
import { useWallet } from "@/contexts/wallet-context";
import { toast } from "sonner";

// Bank data array new
const bankData = [
  { name: "9mobile 9Payment Service Bank", code: "120001" },
  { name: "Abbey Mortgage Bank", code: "404" },
  { name: "Above Only MFB", code: "51204" },
  { name: "Abulesoro MFB", code: "51312" },
  { name: "Access Bank", code: "044" },
  { name: "Access Bank (Diamond)", code: "063" },
  { name: "Accion Microfinance Bank", code: "602" },
  { name: "AG Mortgage Bank", code: "90077" },
  { name: "Ahmadu Bello University Microfinance Bank", code: "50036" },
  { name: "Airtel Smartcash PSB", code: "120004" },
  { name: "AKU Microfinance Bank", code: "51336" },
  { name: "Akuchukwu Microfinance Bank Limited", code: "090561" },
  { name: "ALAT by WEMA", code: "035" },
  { name: "Amegy Microfinance Bank", code: "090629" },
  { name: "Amju Unique MFB", code: "50926" },
  { name: "AMPERSAND MICROFINANCE BANK", code: "51341" },
  { name: "Aramoko MFB", code: "50083" },
  { name: "ASO Savings and Loans", code: "401" },
  { name: "Astrapolaris MFB LTD", code: "50094" },
  { name: "AVUENEGBE MICROFINANCE BANK", code: "090478" },
  { name: "AWACASH MICROFINANCE BANK", code: "51351" },
  { name: "Bainescredit MFB", code: "51229" },
  { name: "Banc Corp Microfinance Bank", code: "50117" },
  { name: "Baobab Microfinance Bank", code: "50992" },
  { name: "BellBank Microfinance Bank", code: "51100" },
  { name: "Benysta Microfinance Bank Limited", code: "51267" },
  { name: "Beststar Microfinance Bank", code: "50123" },
  { name: "Bowen Microfinance Bank", code: "50931" },
  { name: "Branch International Financial Services Limited", code: "40163" },
  { name: "Carbon", code: "565" },
  { name: "Cashbridge Microfinance Bank Limited", code: "51353" },
  { name: "CASHCONNECT MFB", code: "865" },
  { name: "CEMCS Microfinance Bank", code: "50823" },
  { name: "Chanelle Microfinance Bank Limited", code: "50171" },
  { name: "Chikum Microfinance bank", code: "312" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "CITYCODE MORTAGE BANK", code: "070027" },
  { name: "Consumer Microfinance Bank", code: "50910" },
  { name: "Corestep MFB", code: "50204" },
  { name: "Coronation Merchant Bank", code: "559" },
  { name: "County Finance Limited", code: "40128" },
  { name: "Crescent MFB", code: "51297" },
  { name: "Crust Microfinance Bank", code: "090560" },
  { name: "Davenport MICROFINANCE BANK", code: "51334" },
  { name: "Dot Microfinance Bank", code: "50162" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Ekimogun MFB", code: "50263" },
  { name: "Ekondo Microfinance Bank", code: "098" },
  { name: "EXCEL FINANCE BANK", code: "090678" },
  { name: "Eyowo", code: "50126" },
  { name: "Fairmoney Microfinance Bank", code: "51318" },
  { name: "Fedeth MFB", code: "50298" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Firmus MFB", code: "51314" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "FIRST ROYAL MICROFINANCE BANK", code: "090164" },
  { name: "FirstTrust Mortgage Bank Nigeria", code: "413" },
  { name: "FLOURISH MFB", code: "50315" },
  { name: "FSDH Merchant Bank Limited", code: "501" },
  { name: "FUTMINNA MICROFINANCE BANK", code: "832" },
  { name: "Gateway Mortgage Bank LTD", code: "812" },
  { name: "Globus Bank", code: "00103" },
  { name: "Goldman MFB", code: "090574" },
  { name: "GoMoney", code: "100022" },
  { name: "GOOD SHEPHERD MICROFINANCE BANK", code: "090664" },
  { name: "Goodnews Microfinance Bank", code: "50739" },
  { name: "Greenwich Merchant Bank", code: "562" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Hackman Microfinance Bank", code: "51251" },
  { name: "Hasal Microfinance Bank", code: "50383" },
  { name: "HopePSB", code: "120002" },
  { name: "Ibile Microfinance Bank", code: "51244" },
  { name: "Ikoyi Osun MFB", code: "50439" },
  { name: "Ilaro Poly Microfinance Bank", code: "50442" },
  { name: "Imowo MFB", code: "50453" },
  { name: "IMPERIAL HOMES MORTAGE BANK", code: "415" },
  { name: "Infinity MFB", code: "50457" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Kadpoly MFB", code: "50502" },
  { name: "KANOPOLY MFB", code: "51308" },
  { name: "Keystone Bank", code: "082" },
  {
    name: "KONGAPAY (Kongapay Technologies Limited)(formerly Zinternet)",
    code: "100025",
  },
  { name: "Kredi Money MFB LTD", code: "50200" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Lagos Building Investment Company Plc.", code: "90052" },
  { name: "Links MFB", code: "50549" },
  { name: "Living Trust Mortgage Bank", code: "031" },
  { name: "LOMA MFB", code: "50491" },
  { name: "Lotus Bank", code: "303" },
  { name: "MAINSTREET MICROFINANCE BANK", code: "090171" },
  { name: "Mayfair MFB", code: "50563" },
  { name: "Mint MFB", code: "50304" },
  { name: "Money Master PSB", code: "946" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "MTN Momo PSB", code: "120003" },
  { name: "MUTUAL BENEFITS MICROFINANCE BANK", code: "090190" },
  { name: "NDCC MICROFINANCE BANK", code: "090679" },
  { name: "NET MICROFINANCE BANK", code: "51361" },
  { name: "Nigerian Navy Microfinance Bank Limited", code: "51142" },
  { name: "NPF MICROFINANCE BANK", code: "50629" },
  { name: "OPay Digital Services Limited (OPay)", code: "999992" },
  { name: "Optimus Bank Limited", code: "107" },
  { name: "Paga", code: "100002" },
  { name: "PalmPay", code: "999991" },
  { name: "Parallex Bank", code: "104" },
  { name: "Parkway - ReadyCash", code: "311" },
  { name: "PATHFINDER MICROFINANCE BANK LIMITED", code: "090680" },
  { name: "Paystack-Titan", code: "100039" },
  { name: "Peace Microfinance Bank", code: "50743" },
  { name: "PECANTRUST MICROFINANCE BANK LIMITED", code: "51226" },
  { name: "Personal Trust MFB", code: "51146" },
  { name: "Petra Mircofinance Bank Plc", code: "50746" },
  { name: "PFI FINANCE COMPANY LIMITED", code: "050021" },
  { name: "Platinum Mortgage Bank", code: "268" },
  { name: "Pocket App", code: "00716" },
  { name: "Polaris Bank", code: "076" },
  { name: "Polyunwana MFB", code: "50864" },
  { name: "PremiumTrust Bank", code: "105" },
  { name: "PROSPERIS FINANCE LIMITED", code: "050023" },
  { name: "Providus Bank", code: "101" },
  { name: "QuickFund MFB", code: "51293" },
  { name: "Rand Merchant Bank", code: "502" },
  { name: "RANDALPHA MICROFINANCE BANK", code: "090496" },
  { name: "Refuge Mortgage Bank", code: "90067" },
  { name: "REHOBOTH MICROFINANCE BANK", code: "50761" },
  { name: "Rephidim Microfinance Bank", code: "50994" },
  { name: "Rigo Microfinance Bank Limited", code: "51286" },
  { name: "ROCKSHIELD MICROFINANCE BANK", code: "50767" },
  { name: "Rubies MFB", code: "125" },
  { name: "Safe Haven MFB", code: "51113" },
  { name: "Safe Haven Microfinance Bank Limited", code: "951113" },
  { name: "SAGE GREY FINANCE LIMITED", code: "40165" },
  { name: "Shield MFB", code: "50582" },
  { name: "Signature Bank Ltd", code: "106" },
  { name: "Solid Allianze MFB", code: "51062" },
  { name: "Solid Rock MFB", code: "50800" },
  { name: "Sparkle Microfinance Bank", code: "51310" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "STANFORD MICROFINANCE BANK", code: "090162" },
  { name: "STATESIDE MICROFINANCE BANK", code: "50809" },
  { name: "Stellas MFB", code: "51253" },
  { name: "Sterling Bank", code: "232" },
  { name: "Suntrust Bank", code: "100" },
  { name: "Supreme MFB", code: "50968" },
  { name: "TAJ Bank", code: "302" },
  { name: "Tangerine Money", code: "51269" },
  { name: "TCF MFB", code: "51211" },
  { name: "Titan Bank", code: "102" },
  { name: "U&C Microfinance Bank Ltd (U AND C MFB)", code: "50840" },
  { name: "Uhuru MFB", code: "51322" },
  { name: "Unaab Microfinance Bank Limited", code: "50870" },
  { name: "Unical MFB", code: "50871" },
  { name: "Unilag Microfinance Bank", code: "51316" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Uzondu Microfinance Bank Awka Anambra State", code: "50894" },
  { name: "Vale Finance Limited", code: "050020" },
  { name: "VFD Microfinance Bank Limited", code: "566" },
  { name: "Waya Microfinance Bank", code: "51355" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

// Define the type for the bank account form
interface BankAccountForm {
  bankName: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
}

export default function MyBankAccountPage() {
  const router = useRouter();
  const {
    bankAccounts,
    addBankAccount,
    removeBankAccount,
    setDefaultBankAccount,
    isLoading,
    updateBankAccount, // We'll need to add this to the wallet context
  } = useWallet();

  // State for adding accounts
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<BankAccountForm>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    isDefault: false,
  });

  // State for editing accounts
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<string | null>(null);
  const [editedAccount, setEditedAccount] = useState<BankAccountForm>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    isDefault: false,
  });

  // State for deleting accounts
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const handleAddAccount = () => {
    setIsAddingAccount(true);
    setIsEditingAccount(false); // Close editing form if open
  };

  const handleCancelAdd = () => {
    setIsAddingAccount(false);
    setNewAccount({
      bankName: "",
      accountName: "",
      accountNumber: "",
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.accountNumber.length !== 10) {
      toast.error("Invalid Account Number", {
        description: "Please enter a valid 10-digit account number",
      });
      return;
    }

    try {
      const success = await addBankAccount(newAccount);
      if (success) {
        toast.success("Bank Account Added", {
          description: "Your bank account has been added successfully",
        });
        // Reset form and close add account section
        setNewAccount({
          bankName: "",
          accountName: "",
          accountNumber: "",
          isDefault: false,
        });
        setIsAddingAccount(false);
      }
    } catch (error) {
      toast.error("Error Adding Account", {
        description:
          "There was a problem adding your bank account. Please try again.",
      });
    }
  };

  // New function to handle edit button click
  const handleEditAccount = (accountId: string) => {
    // Find the account to edit
    const account = bankAccounts.find((acc) => acc._id === accountId);
    if (!account) return;

    // Set up editing state
    setAccountToEdit(accountId);
    setEditedAccount({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      isDefault: account.isDefault,
    });

    // Show editing form and hide adding form
    setIsEditingAccount(true);
    setIsAddingAccount(false);
  };

  // New function to cancel editing
  const handleCancelEdit = () => {
    setIsEditingAccount(false);
    setAccountToEdit(null);
    setEditedAccount({
      bankName: "",
      accountName: "",
      accountNumber: "",
      isDefault: false,
    });
  };

  // New function to submit edited account
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountToEdit) return;

    if (editedAccount.accountNumber.length !== 10) {
      toast.error("Invalid Account Number", {
        description: "Please enter a valid 10-digit account number",
      });
      return;
    }

    try {
      // Call the updateBankAccount function from the wallet context
      // This function needs to be added to the wallet context
      const success = await updateBankAccount(accountToEdit, editedAccount);
      if (success) {
        toast.success("Bank Account Updated", {
          description: "Your bank account has been updated successfully",
        });
        // Reset form and close edit account section
        setEditedAccount({
          bankName: "",
          accountName: "",
          accountNumber: "",
          isDefault: false,
        });
        setIsEditingAccount(false);
        setAccountToEdit(null);
      }
    } catch (error) {
      toast.error("Error Updating Account", {
        description:
          "There was a problem updating your bank account. Please try again.",
      });
    }
  };

  const confirmDeleteAccount = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      await removeBankAccount(accountToDelete);
      toast.success("Bank Account Removed", {
        description: "Your bank account has been removed successfully",
      });
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      toast.error("Error Removing Account", {
        description:
          "There was a problem removing your bank account. Please try again.",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultBankAccount(id);
      toast.success("Default Account Updated", {
        description: "Your default bank account has been updated successfully",
      });
    } catch (error) {
      toast.error("Error Setting Default", {
        description:
          "There was a problem setting your default bank account. Please try again.",
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
                <div className="mr-3 bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                My Bank Accounts
              </h1>
            </div>
            <Button
              onClick={handleAddAccount}
              className="h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md"
              disabled={isAddingAccount || isEditingAccount}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Bank Account
            </Button>
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
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    Bank Accounts
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        {isAddingAccount && (
          <FadeIn delay={0.2}>
            <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="relative mr-2">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                    <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-1.5 rounded-full">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  Add Bank Account
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-base font-medium">
                      Bank Name
                    </Label>
                    <Select
                      value={newAccount.bankName}
                      onValueChange={(value) =>
                        setNewAccount({ ...newAccount, bankName: value })
                      }
                      required
                    >
                      <SelectTrigger
                        id="bankName"
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {bankData.map((bank) => (
                          <SelectItem key={bank.code} value={bank.name}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="accountName"
                      className="text-base font-medium"
                    >
                      Account Name
                    </Label>
                    <Input
                      id="accountName"
                      value={newAccount.accountName}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          accountName: e.target.value,
                        })
                      }
                      placeholder="Enter account name"
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="accountNumber"
                      className="text-base font-medium"
                    >
                      Account Number
                    </Label>
                    <Input
                      id="accountNumber"
                      value={newAccount.accountNumber}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          accountNumber: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="Enter 10-digit account number"
                      maxLength={10}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Please enter a valid 10-digit account number without
                      spaces or special characters.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDefault"
                        checked={newAccount.isDefault}
                        onCheckedChange={(checked) =>
                          setNewAccount({ ...newAccount, isDefault: checked })
                        }
                      />
                      <Label
                        htmlFor="isDefault"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Set as default account
                      </Label>
                    </div>
                  </div>

                  <div className="bg-cyan-50 dark:bg-cyan-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                    <div className="flex items-start">
                      <div className="relative mr-3 mt-0.5">
                        <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          For security reasons, please ensure that the account
                          name matches the name on your profile. Withdrawals can
                          only be made to accounts registered in your name.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelAdd}
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Adding...
                        </>
                      ) : (
                        <>Add Account</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </AnimatedCard>
          </FadeIn>
        )}

        {/* Edit Account Form */}
        {isEditingAccount && accountToEdit && (
          <FadeIn delay={0.2}>
            <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <div className="relative mr-2">
                      <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[2px]"></div>
                      <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-1.5 rounded-full">
                        <Edit2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    Edit Bank Account
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <form onSubmit={handleSubmitEdit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-bankName"
                      className="text-base font-medium"
                    >
                      Bank Name
                    </Label>
                    <Select
                      value={editedAccount.bankName}
                      onValueChange={(value) =>
                        setEditedAccount({ ...editedAccount, bankName: value })
                      }
                      required
                    >
                      <SelectTrigger
                        id="edit-bankName"
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {bankData.map((bank) => (
                          <SelectItem key={bank.code} value={bank.name}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-accountName"
                      className="text-base font-medium"
                    >
                      Account Name
                    </Label>
                    <Input
                      id="edit-accountName"
                      value={editedAccount.accountName}
                      onChange={(e) =>
                        setEditedAccount({
                          ...editedAccount,
                          accountName: e.target.value,
                        })
                      }
                      placeholder="Enter account name"
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-accountNumber"
                      className="text-base font-medium"
                    >
                      Account Number
                    </Label>
                    <Input
                      id="edit-accountNumber"
                      value={editedAccount.accountNumber}
                      onChange={(e) =>
                        setEditedAccount({
                          ...editedAccount,
                          accountNumber: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="Enter 10-digit account number"
                      maxLength={10}
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Please enter a valid 10-digit account number without
                      spaces or special characters.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-isDefault"
                        checked={editedAccount.isDefault}
                        onCheckedChange={(checked) =>
                          setEditedAccount({
                            ...editedAccount,
                            isDefault: checked,
                          })
                        }
                      />
                      <Label
                        htmlFor="edit-isDefault"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Set as default account
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />{" "}
                          Updating...
                        </>
                      ) : (
                        <>Update Account</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </AnimatedCard>
          </FadeIn>
        )}

        <FadeIn delay={0.3}>
          <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-cyan-500" />
                Linked Bank Accounts
              </h2>

              {bankAccounts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[3px]"></div>
                    <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-4 rounded-full">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No Bank Accounts
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
                    You haven't added any bank accounts yet. Add a bank account
                    to withdraw funds from your wallet.
                  </p>
                  <Button
                    onClick={handleAddAccount}
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Bank Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account, index) => (
                    <div
                      key={account._id || index}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                              {account.bankName}
                            </h3>
                            {account.isDefault && (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {account.accountName}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-mono">
                              {account.accountNumber}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        {!account.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(account._id)}
                            className="text-xs h-8 rounded-lg border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccount(account._id)}
                          className="text-xs h-8 rounded-lg border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDeleteAccount(account._id)}
                          className="text-xs h-8 rounded-lg text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 dark:border-rose-800 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedCard>
        </FadeIn>

        <FadeIn delay={0.4}>
          <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-cyan-500" />
                Important Information
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Account Verification
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        All bank accounts are verified before withdrawals can be
                        processed. Ensure your account details are accurate to
                        avoid delays.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                        Security Notice
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        For security reasons, withdrawals can only be made to
                        bank accounts registered in your name. Third-party
                        accounts are not permitted.
                      </p>
                    </div>
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
              className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 bg-transparent"
              onClick={() => router.push("/dashboard/my-wallet")}
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Return to My Wallet
            </Button>
          </div>
        </FadeIn>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this bank account? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-lg border border-rose-100 dark:border-rose-800/30">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-rose-500 mr-2 mt-0.5" />
              <p className="text-sm text-rose-700 dark:text-rose-300">
                Removing this account will prevent any future withdrawals to
                this bank account.
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
