"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Bell, Search } from "lucide-react";
import Profile01 from "./profile-01";
import { ThemeToggle } from "../theme-toggle";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
// Add UI context import
import { useUI } from "@/contexts/ui-context";
import { Menu } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav() {
  // const { toggleSidebar, isMobileView } = useUI()

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Esthington", href: "/dashboard" },
    { label: "dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-background border-b border-border h-full top-0 z-50">
      {/* Add sidebar toggle button for mobile */}
      {/* {isMobileView && (
        <button onClick={toggleSidebar} className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/70" />
        </button>
      )} */}
      {/* Empty div on the left for mobile */}
      <div className="md:hidden flex items-center">
        {/* Empty div to maintain layout */}
      </div>

      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        {/* <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search properties..."
            className="pl-10 bg-muted/30 border-input"
          />
        </div> */}
      </div>

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
