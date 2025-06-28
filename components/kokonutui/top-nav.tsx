"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Bell, Menu } from "lucide-react";
import Profile01 from "./profile-01";
import { ThemeToggle } from "../theme-toggle";
import { useState, useEffect } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Get user role from localStorage or auth context
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Esthington", href: "/dashboard" },
    { label: "dashboard", href: "/dashboard" },
  ];

  // Function to render the appropriate sidebar content
  const renderSidebarContent = () => {
    switch (userRole) {
      case "buyer":
        return <BuyerSidebarContent />;
      case "agent":
        return <AgentSidebarContent />;
      case "admin":
      case "super_admin":
        return <AdminSidebarContent />;
      default:
        return <BuyerSidebarContent />; // Default fallback
    }
  };

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-background border-b border-border h-full top-0 z-50">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors mr-2"
              >
                <Menu className="h-5 w-5 text-foreground/70" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/70" />
        </button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Image
              src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
              alt="User avatar"
              width={32}
              height={32}
              className="rounded-full ring-2 ring-border cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

// Buyer Sidebar Content Component
function BuyerSidebarContent() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 flex items-center border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Esthington"
            width={32}
            height={32}
            className="flex-shrink-0 rounded-md"
          />
          <span className="text-lg font-semibold text-foreground">
            Esthington
          </span>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="space-y-4">
          {/* Dashboard Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dashboard
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Overview</span>
              </a>
              <a
                href="/dashboard/properties"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Properties</span>
              </a>
              <a
                href="/dashboard/myproperties"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Properties</span>
              </a>
            </div>
          </div>

          {/* Wallet Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wallet
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/my-wallet"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Wallet</span>
              </a>
              <a
                href="/dashboard/fund-wallet"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Fund Wallet</span>
              </a>
              <a
                href="/dashboard/my-bank-account"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Bank Account</span>
              </a>
              <a
                href="/dashboard/withdraw-money"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Withdraw Money</span>
              </a>
              <a
                href="/dashboard/transfer-money"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Transfer Money</span>
              </a>
              <a
                href="/dashboard/my-transactions"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Transactions</span>
              </a>
            </div>
          </div>

          {/* Marketplace Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Marketplace
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/marketplace"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Marketplace</span>
              </a>
              <a
                href="/dashboard/my-purchases"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Purchases</span>
              </a>
            </div>
          </div>

          {/* Investments Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Investments
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/investments"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>All Investments</span>
              </a>
              <a
                href="/dashboard/my-investments"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Investments</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agent Sidebar Content Component
function AgentSidebarContent() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 flex items-center border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Esthington"
            width={32}
            height={32}
            className="flex-shrink-0 rounded-md"
          />
          <span className="text-lg font-semibold text-foreground">
            Esthington
          </span>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="space-y-4">
          {/* Dashboard Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dashboard
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Overview</span>
              </a>
              <a
                href="/dashboard/properties"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Properties</span>
              </a>
              <a
                href="/dashboard/myproperties"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Properties</span>
              </a>
            </div>
          </div>

          {/* Wallet Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wallet
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/my-wallet"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Wallet</span>
              </a>
              <a
                href="/dashboard/fund-wallet"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Fund Wallet</span>
              </a>
              <a
                href="/dashboard/transfer-money"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Transfer Money</span>
              </a>
              <a
                href="/dashboard/withdraw-money"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Withdraw Money</span>
              </a>
              <a
                href="/dashboard/my-bank-account"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Bank Account</span>
              </a>
              <a
                href="/dashboard/my-transactions"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Transactions</span>
              </a>
            </div>
          </div>

          {/* Marketplace Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Marketplace
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/marketplace"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Marketplace</span>
              </a>
              <a
                href="/dashboard/my-purchases"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Purchases</span>
              </a>
            </div>
          </div>

          {/* Investments Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Investments
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/investments"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>All Investments</span>
              </a>
              <a
                href="/dashboard/my-investments"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Investments</span>
              </a>
            </div>
          </div>

          {/* Referrals Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Referrals
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/my-referrals"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>My Referrals</span>
              </a>
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settings
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/settings/account"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Account</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Sidebar Content Component
function AdminSidebarContent() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 flex items-center border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Esthington"
            width={32}
            height={32}
            className="flex-shrink-0 rounded-md"
          />
          <span className="text-lg font-semibold text-foreground">
            Esthington
          </span>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="space-y-4">
          {/* Dashboard Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dashboard
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Overview</span>
              </a>
              <a
                href="/dashboard/companies"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Companies</span>
              </a>
              <a
                href="/dashboard/properties"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Properties</span>
              </a>
              <a
                href="/dashboard/properties/create"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Add Property</span>
              </a>
            </div>
          </div>

          {/* Management Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Management
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/users"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Manage Users</span>
              </a>
              <a
                href="/dashboard/admins"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Manage Admins</span>
              </a>
              <a
                href="/dashboard/transactions"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Transactions</span>
              </a>
              <a
                href="/dashboard/investment-due"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Investment Due</span>
              </a>
              <a
                href="/dashboard/approvals"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Payment Approvals</span>
              </a>
            </div>
          </div>

          {/* Marketplace Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Marketplace
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/marketplace"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>View Marketplace</span>
              </a>
              <a
                href="/dashboard/marketplace/add"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Add Listing</span>
              </a>
            </div>
          </div>

          {/* Investments Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Investments
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/investments"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Manage Investments</span>
              </a>
              <a
                href="/dashboard/investments/create"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Create Investment</span>
              </a>
            </div>
          </div>

          {/* System Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              System
            </div>
            <div className="space-y-1">
              <a
                href="/dashboard/settings/account"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
              >
                <span>Account</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
