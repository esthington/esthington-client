"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
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
import dynamic from "next/dynamic";

interface TawkMessengerProps {
  propertyId: string;
  widgetId: string;
}

const TawkMessengerReact = dynamic<TawkMessengerProps>(
  () => import("@tawk.to/tawk-messenger-react").then((mod) => mod.default),
  { ssr: false }
);

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

  const initialRenderRef = useRef(false);

  useEffect(() => {
    initialRenderRef.current = true;
  }, [user]);

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
    <div className={`min-h-screen ${theme === "dark" ? "dark" : "light"}`}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen lg:overflow-y-hidden">
        {/* Sticky Sidebar */}
        <aside className="sticky top-0 h-screen overflow-y-auto border-r border-border bg-background">
          {renderSidebar()}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky Top Navigation */}
          <header className="sticky top-0 z-10 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TopNav />
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto px-2 md:px-4 py-6 lg:px-10">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        {/* Mobile Top Navigation - Sticky */}
        <header className="sticky top-0 z-10 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TopNav />
        </header>

        {/* Mobile Main Content */}
        <main className="px-2 md:px-2 py-6 pb-20 bg-background">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {renderBottomNav()}
      </div>

      {/* Tawk Messenger */}
      {initialRenderRef.current && (
        <TawkMessengerReact
          propertyId="684a98c4c2de78190f3149e8"
          widgetId="1ithm9g6m"
        />
      )}
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
