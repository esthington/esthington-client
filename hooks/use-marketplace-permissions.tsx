"use client"

import { useEffect, useState } from "react"
import type { UserRole } from "./use-management-permissions"

// Define permission types
export type MarketplacePermission =
  | "viewMarketplace"
  | "buyProperty"
  | "investProperty"
  | "addListing"
  | "editListing"
  | "deleteListing"
  | "featureListing"
  | "approveListing"
  | "rejectListing"
  | "viewAllListings"
  | "exportListings"

// Hook for checking permissions
export function useMarketplacePermissions(userRole: UserRole = "buyer") {
  const [permissions, setPermissions] = useState<Record<MarketplacePermission, boolean>>({
    viewMarketplace: false,
    buyProperty: false,
    investProperty: false,
    addListing: false,
    editListing: false,
    deleteListing: false,
    featureListing: false,
    approveListing: false,
    rejectListing: false,
    viewAllListings: false,
    exportListings: false,
  })

  useEffect(() => {
    // Set permissions based on role
    switch (userRole) {
      case "super_admin":
        setPermissions({
          viewMarketplace: true,
          buyProperty: true,
          investProperty: true,
          addListing: true,
          editListing: true,
          deleteListing: true,
          featureListing: true,
          approveListing: true,
          rejectListing: true,
          viewAllListings: true,
          exportListings: true,
        })
        break
      case "admin":
        setPermissions({
          viewMarketplace: true,
          buyProperty: true,
          investProperty: true,
          addListing: true,
          editListing: true,
          deleteListing: true,
          featureListing: true,
          approveListing: true,
          rejectListing: true,
          viewAllListings: true,
          exportListings: true,
        })
        break
      case "agent":
        setPermissions({
          viewMarketplace: true,
          buyProperty: true,
          investProperty: true,
          addListing: true,
          editListing: true,
          deleteListing: true,
          featureListing: false,
          approveListing: false,
          rejectListing: false,
          viewAllListings: false,
          exportListings: false,
        })
        break
      case "buyer":
      default:
        setPermissions({
          viewMarketplace: true,
          buyProperty: true,
          investProperty: true,
          addListing: false,
          editListing: false,
          deleteListing: false,
          featureListing: false,
          approveListing: false,
          rejectListing: false,
          viewAllListings: false,
          exportListings: false,
        })
        break
    }
  }, [userRole])

  // Function to check if user has a specific permission
  const hasPermission = (permission: MarketplacePermission): boolean => {
    return permissions[permission]
  }

  return {
    permissions,
    hasPermission,
  }
}
