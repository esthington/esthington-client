"use client";

import type { ReactNode } from "react";
import TopNav from "./top-nav";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Import role-specific sidebars
import BuyerSidebar from "./sidebars/buyer-sidebar";
import AgentSidebar from "./sidebars/agent-sidebar";
import AdminSidebar from "./sidebars/admin-sidebar";

// Import role-specific bottom navs
import BuyerBottomNav from "./bottom-navs/buyer-bottom-nav";
import AgentBottomNav from "./bottom-navs/agent-bottom-nav";
import AdminBottomNav from "./bottom-navs/admin-bottom-nav";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "../ui/loading-spinner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [userRole, setUserRole] = useState<string>("");

  // Update userRole when user changes
  useEffect(() => {
    if (user && user.role) {
      setUserRole(user.role);
    } else {
      setUserRole("buyer"); // Default role if no user or role is undefined
    }
  }, [user]);

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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : "light"}`}>
      {renderSidebar()}
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-border">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto p-6 bg-background pb-20 lg:pb-6">
          {children}
        </main>
        {renderBottomNav()}
      </div>
    </div>
  );
}
