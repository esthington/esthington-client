"use client"

import { useEffect, useState } from "react"

// Define permission types
export type ManagementPermission =
  | "viewUsers"
  | "createUsers"
  | "editUsers"
  | "deleteUsers"
  | "blacklistUsers"
  | "viewAdmins"
  | "createAdmins"
  | "editAdmins"
  | "deleteAdmins"
  | "suspendAdmins"
  | "viewTransactions"
  | "approveTransactions"
  | "rejectTransactions"
  | "viewApprovals"
  | "approveRequests"
  | "rejectRequests"
  | "viewReports"
  | "exportReports"

// Define role types
export type UserRole = "buyer" | "agent" | "admin" | "super_admin"

// Hook for checking permissions
export function useManagementPermissions(userRole: UserRole = "buyer") {
  const [permissions, setPermissions] = useState<Record<ManagementPermission, boolean>>({
    viewUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    blacklistUsers: false,
    viewAdmins: false,
    createAdmins: false,
    editAdmins: false,
    deleteAdmins: false,
    suspendAdmins: false,
    viewTransactions: false,
    approveTransactions: false,
    rejectTransactions: false,
    viewApprovals: false,
    approveRequests: false,
    rejectRequests: false,
    viewReports: false,
    exportReports: false,
  })

  useEffect(() => {
    // Set permissions based on role
    switch (userRole) {
      case "super_admin":
        setPermissions({
          viewUsers: true,
          createUsers: true,
          editUsers: true,
          deleteUsers: true,
          blacklistUsers: true,
          viewAdmins: true,
          createAdmins: true,
          editAdmins: true,
          deleteAdmins: true,
          suspendAdmins: true,
          viewTransactions: true,
          approveTransactions: true,
          rejectTransactions: true,
          viewApprovals: true,
          approveRequests: true,
          rejectRequests: true,
          viewReports: true,
          exportReports: true,
        })
        break
      case "admin":
        setPermissions({
          viewUsers: true,
          createUsers: true,
          editUsers: true,
          deleteUsers: true,
          blacklistUsers: true,
          viewAdmins: true,
          createAdmins: false,
          editAdmins: false,
          deleteAdmins: false,
          suspendAdmins: false,
          viewTransactions: true,
          approveTransactions: true,
          rejectTransactions: true,
          viewApprovals: true,
          approveRequests: true,
          rejectRequests: true,
          viewReports: true,
          exportReports: true,
        })
        break
      case "agent":
        setPermissions({
          viewUsers: false,
          createUsers: false,
          editUsers: false,
          deleteUsers: false,
          blacklistUsers: false,
          viewAdmins: false,
          createAdmins: false,
          editAdmins: false,
          deleteAdmins: false,
          suspendAdmins: false,
          viewTransactions: true,
          approveTransactions: false,
          rejectTransactions: false,
          viewApprovals: false,
          approveRequests: false,
          rejectRequests: false,
          viewReports: false,
          exportReports: false,
        })
        break
      case "buyer":
      default:
        setPermissions({
          viewUsers: false,
          createUsers: false,
          editUsers: false,
          deleteUsers: false,
          blacklistUsers: false,
          viewAdmins: false,
          createAdmins: false,
          editAdmins: false,
          deleteAdmins: false,
          suspendAdmins: false,
          viewTransactions: false,
          approveTransactions: false,
          rejectTransactions: false,
          viewApprovals: false,
          approveRequests: false,
          rejectRequests: false,
          viewReports: false,
          exportReports: false,
        })
        break
    }
  }, [userRole])

  // Function to check if user has a specific permission
  const hasPermission = (permission: ManagementPermission): boolean => {
    return permissions[permission]
  }

  return {
    permissions,
    hasPermission,
  }
}
