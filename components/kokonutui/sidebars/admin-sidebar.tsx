"use client";

import type React from "react";

import {
  Home,
  Building,
  Users,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Menu,
  PlusCircle,
  UserPlus,
  BarChart2,
  FileText,
  DollarSign,
  Shield,
  Bell,
  Crown,
  ShoppingBag,
  Briefcase,
  ChevronDown,
  ChevronRight,
  HousePlus,
  MapPinHouse,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Profile01 from "../profile-01";

export default function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    management: true,
    marketplace: true,
    investments: true,
    referrals: true,
    system: true,
  });
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on desktop and set sidebar to open by default
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsMobileMenuOpen(window.innerWidth >= 1024);
    };

    // Initial check
    checkIfDesktop();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfDesktop);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

  function handleNavigation() {
    if (!isDesktop) {
      setIsMobileMenuOpen(false);
    }
  }

  function handleLogout() {
    // Clear user data
    localStorage.removeItem("userRole");
    // Redirect to login
    router.push("/login");
  }

  function handleChatWithAdmin() {
    // Open WhatsApp with a predefined message
    window.open(
      "https://wa.me/1234567890?text=Hello%20Esthington%20Support,%20I%20need%20assistance.",
      "_blank"
    );
  }

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  function NavItem({
    href,
    icon: Icon,
    children,
    onClick,
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
    onClick?: () => void;
  }) {
    const isActive = pathname === href;

    return (
      <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={href}
          onClick={() => {
            handleNavigation();
            onClick && onClick();
          }}
          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? "text-white bg-primary/80 backdrop-blur-sm dark:text-white dark:bg-primary/80"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-primary/50 backdrop-blur-sm"
          }`}
        >
          <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
          {children}
        </Link>
      </motion.div>
    );
  }

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const menuButtonVariants = {
    open: { rotate: 90 },
    closed: { rotate: 0 },
  };

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
    <div className="z-30 flex flex-col">
      <motion.button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white/90 dark:bg-[#0F0F12]/80 backdrop-blur-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        animate={isMobileMenuOpen ? "open" : "closed"}
        variants={menuButtonVariants}
        transition={{ duration: 0.3 }}
      >
        <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      <AnimatePresence>
        {(isMobileMenuOpen || isDesktop) && (
          <motion.nav
            className="fixed h-screen inset-y-0 left-0 z-[70] w-64 bg-white/90 backdrop-blur-md lg:static lg:w-64 border-r border-gray-200 dark:bg-[#0F0F12]/80 dark:border-[#1F1F23]"
            initial={isDesktop ? "open" : "closed"}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
          >
            <div className="h-full flex flex-col">
              <Link
                href="/dashboard"
                className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
              >
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src="/logo.svg"
                    alt="Esthington"
                    width={32}
                    height={32}
                    className="flex-shrink-0 rounded-md"
                  />
                  <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                    Esthington
                  </span>
                </motion.div>
              </Link>

              <div className="flex-1 overflow-y-auto py-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#1F1F23] scrollbar-track-transparent">
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Dashboard Section */}
                  <div>
                    <button
                      onClick={() => toggleSection("dashboard")}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
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
                          <NavItem href="/dashboard" icon={Home}>
                            Overview
                          </NavItem>
                          <NavItem href="/dashboard/companies" icon={MapPinHouse}>
                            Companies
                          </NavItem>
                          <NavItem href="/dashboard/properties" icon={Building}>
                            Properties
                          </NavItem>
                          <NavItem
                            href="/dashboard/properties/create"
                            icon={PlusCircle}
                          >
                            Add Property
                          </NavItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Management Section */}
                  <div>
                    <button
                      onClick={() => toggleSection("management")}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
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
                          <NavItem href="/dashboard/users" icon={Users}>
                            Manage Users
                          </NavItem>
                          <NavItem href="/dashboard/admins" icon={UserPlus}>
                            Manage Admins
                          </NavItem>
                          <NavItem
                            href="/dashboard/transactions"
                            icon={DollarSign}
                          >
                            Transactions
                          </NavItem>
                          <NavItem href="/dashboard/reports" icon={BarChart2}>
                            Reports
                          </NavItem>
                          <NavItem href="/dashboard/approvals" icon={FileText}>
                            Approvals
                          </NavItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Marketplace Section */}
                  <div>
                    <button
                      onClick={() => toggleSection("marketplace")}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
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
                          <NavItem
                            href="/dashboard/marketplace"
                            icon={ShoppingBag}
                          >
                            View Marketplace
                          </NavItem>
                          <NavItem
                            href="/dashboard/marketplace/add"
                            icon={PlusCircle}
                          >
                            Add Listing
                          </NavItem>
                         
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Investments Section */}
                  <div>
                    <button
                      onClick={() => toggleSection("investments")}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
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
                          <NavItem
                            href="/dashboard/investments"
                            icon={Briefcase}
                          >
                            Manage Investments
                          </NavItem>
                          <NavItem
                            href="/dashboard/investments/create"
                            icon={PlusCircle}
                          >
                            Create Investment
                          </NavItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Referrals Section */}
                  <div>
                    <button
                      onClick={() => toggleSection("referrals")}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
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
                          <NavItem
                            href="/dashboard/referrals"
                            icon={Users}
                          >
                            Manage Referrals
                          </NavItem>
                          <NavItem
                            href="/dashboard/referrals/settings"
                            icon={Settings}
                          >
                            Program Settings
                          </NavItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* System Section */}
                  <div>
                    <button
                      onClick={() => toggleSection("system")}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
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
                          <NavItem href="/dashboard/security" icon={Shield}>
                            Security
                          </NavItem>
                          {/* <NavItem href="/dashboard/notifications" icon={Bell}>
                            Notifications
                          </NavItem> */}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
                <div className="space-y-1">
                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={handleChatWithAdmin}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-primary/50 backdrop-blur-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 mr-3 flex-shrink-0 fill-current"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Support Chat
                    </button>
                  </motion.div>

                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => setShowAccountDialog(true)}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-primary/50 backdrop-blur-sm"
                    >
                      <User className="h-4 w-4 mr-3 flex-shrink-0" />
                      My Account
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && !isDesktop && (
          <motion.div
            className="fixed inset-0 bg-black z-[65] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0F0F12]/90 backdrop-blur-xl border-gray-200 dark:border-[#1F1F23]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              My Account
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Profile01 />

            <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-[#1F1F23]/50 backdrop-blur-sm">
              <div className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-secondary" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Administrator Account
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Full system access with all privileges
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/dashboard/settings"
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F1F23]/50 dark:hover:bg-primary/50 transition-all"
                >
                  <Settings className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Settings
                  </span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/dashboard/help"
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F1F23]/50 dark:hover:bg-primary/50 transition-all"
                >
                  <HelpCircle className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Help
                  </span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="col-span-2"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-3 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-all"
                >
                  <LogOut className="h-5 w-5 mr-2 text-red-600 dark:text-red-300" />
                  <span className="text-sm text-red-600 dark:text-red-300">
                    Logout
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
