"use client";

import { useAuth } from "@/contexts/auth-context";

// Define valid user roles for better type safety
type UserRole = "buyer" | "agent" | "admin" | "super_admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Bell, Menu, ChevronDown, ChevronRight, User } from "lucide-react";
import Profile01 from "./profile-01";
import { ThemeToggle } from "../theme-toggle";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Debug user role
  useEffect(() => {
    console.log("Current user role:", user?.role);
    setUserRole(user?.role);
  }, [user?.role]);
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
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    wallet: false,
    marketplace: true,
    investments: true,
  });

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  const sectionVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.3 },
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

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
            <button
              onClick={() => toggleSection("dashboard")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Dashboard</span>
              {expandedSections.dashboard ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.dashboard && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet Section */}
          <div>
            <button
              onClick={() => toggleSection("wallet")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Wallet</span>
              {expandedSections.wallet ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.wallet && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Marketplace Section */}
          <div>
            <button
              onClick={() => toggleSection("marketplace")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Marketplace</span>
              {expandedSections.marketplace ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.marketplace && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Investments Section */}
          <div>
            <button
              onClick={() => toggleSection("investments")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Investments</span>
              {expandedSections.investments ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.investments && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Section - Fixed */}
      <div className="px-4 py-4 border-t border-border">
        <div className="space-y-1">
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 mr-3 flex-shrink-0 fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chat With Admin
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted">
            <User className="h-4 w-4 mr-3 flex-shrink-0" />
            My Account
          </button>
        </div>
      </div>
    </div>
  );
}

// Agent Sidebar Content Component
function AgentSidebarContent() {
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    wallet: false,
    marketplace: false,
    investments: false,
    referrals: false,
    settings: true,
  });

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  const sectionVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.3 },
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

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
            <button
              onClick={() => toggleSection("dashboard")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Dashboard</span>
              {expandedSections.dashboard ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.dashboard && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet Section */}
          <div>
            <button
              onClick={() => toggleSection("wallet")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Wallet</span>
              {expandedSections.wallet ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.wallet && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Marketplace Section */}
          <div>
            <button
              onClick={() => toggleSection("marketplace")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Marketplace</span>
              {expandedSections.marketplace ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.marketplace && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Investments Section */}
          <div>
            <button
              onClick={() => toggleSection("investments")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Investments</span>
              {expandedSections.investments ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.investments && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Referrals Section */}
          <div>
            <button
              onClick={() => toggleSection("referrals")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Referrals</span>
              {expandedSections.referrals ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.referrals && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
                  <a
                    href="/dashboard/my-referrals"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <span>My Referrals</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings Section */}
          <div>
            <button
              onClick={() => toggleSection("settings")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Settings</span>
              {expandedSections.settings ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.settings && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
                  <a
                    href="/dashboard/settings/account"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <span>Account</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Section - Fixed */}
      <div className="px-4 py-4 border-t border-border">
        <div className="space-y-1">
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 mr-3 flex-shrink-0 fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chat With Admin
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted">
            <User className="h-4 w-4 mr-3 flex-shrink-0" />
            My Account
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Sidebar Content Component
function AdminSidebarContent() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    console.log("Admin sidebar - Current user role:", user?.role);
    setUserRole(user?.role);
  }, [user?.role]);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    wallet: true,
    management: true,
    marketplace: true,
    investments: true,
    system: true,
  });

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  const sectionVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.3 },
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

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
            <button
              onClick={() => toggleSection("dashboard")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Dashboard</span>
              {expandedSections.dashboard ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.dashboard && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet Section - Only for super_admin */}
          {userRole === "super_admin" && (
            <div>
              <button
                onClick={() => toggleSection("wallet")}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Wallet</span>
                {expandedSections.wallet ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {expandedSections.wallet && (
                  <motion.div
                    className="space-y-1 overflow-hidden"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={sectionVariants}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Management Section */}
          <div>
            <button
              onClick={() => toggleSection("management")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Management</span>
              {expandedSections.management ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.management && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Marketplace Section */}
          <div>
            <button
              onClick={() => toggleSection("marketplace")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Marketplace</span>
              {expandedSections.marketplace ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.marketplace && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Investments Section */}
          <div>
            <button
              onClick={() => toggleSection("investments")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Investments</span>
              {expandedSections.investments ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.investments && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* System Section */}
          <div>
            <button
              onClick={() => toggleSection("system")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>System</span>
              {expandedSections.system ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {expandedSections.system && (
                <motion.div
                  className="space-y-1 overflow-hidden"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                >
                  <a
                    href="/dashboard/settings/account"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <span>Account</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Section - Fixed */}
      <div className="px-4 py-4 border-t border-border">
        <div className="space-y-1">
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 mr-3 flex-shrink-0 fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Support Chat
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted">
            <User className="h-4 w-4 mr-3 flex-shrink-0" />
            My Account
          </button>
        </div>
      </div>
    </div>
  );
}
