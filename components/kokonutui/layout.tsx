"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "../ui/loading-spinner";

// Import role-specific sidebars
import BuyerSidebar from "./sidebars/buyer-sidebar";
import AgentSidebar from "./sidebars/agent-sidebar";
import AdminSidebar from "./sidebars/admin-sidebar";

// Import role-specific bottom navs
import BuyerBottomNav from "./bottom-navs/buyer-bottom-nav";
import AgentBottomNav from "./bottom-navs/agent-bottom-nav";
import AdminBottomNav from "./bottom-navs/admin-bottom-nav";
import TopNav from "./top-nav";
import { withAuth } from "@/hocs";

// Define valid user roles for better type safety
type UserRole = "buyer" | "agent" | "admin" | "super_admin";

interface LayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Debug user role
  useEffect(() => {
    console.log("Current user role:", user?.role);
  }, [user?.role]);

  // Normalize role to handle case sensitivity or formatting issues
  const normalizeRole = (role?: string): UserRole => {
    if (!role) return "buyer"; // Default to buyer if no role

    const normalizedRole = role.toLowerCase().trim();

    if (normalizedRole === "admin" || normalizedRole === "super_admin") {
      return normalizedRole as UserRole;
    } else if (normalizedRole === "agent") {
      return "agent";
    } else {
      return "buyer";
    }
  };

  const userRole = normalizeRole(user?.role);

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    switch (userRole) {
      case "admin":
      case "super_admin":
        return <AdminSidebar />;
      case "agent":
        return <AgentSidebar />;
      default:
        return <BuyerSidebar />;
    }
  };

  // Render the appropriate bottom nav based on user role
  const renderBottomNav = () => {
    switch (userRole) {
      case "admin":
      case "super_admin":
        return <AdminBottomNav />;
      case "agent":
        return <AgentBottomNav />;
      default:
        return <BuyerBottomNav />;
    }
  };

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : "light"}`}>
      {renderSidebar()}
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-border">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto px-1 md:px-4 py-6 bg-background pb-20 lg:pb-6 lg:px-20">
          {children}
        </main>
        {renderBottomNav()}
      </div>
    </div>
  );
}

// Wrap the layout with withAuth to protect it
export default withAuth(DashboardLayout, {
  redirectTo: "/login",
  loadingComponent: (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <LoadingSpinner />
    </div>
  ),
});
