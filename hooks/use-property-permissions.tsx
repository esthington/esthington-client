"use client"

import { useState, useEffect } from "react"

type UserRole = "admin" | "agent" | "buyer" | null

interface PropertyPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canView: boolean
  canBuy: boolean
  canInvest: boolean
}

export function usePropertyPermissions(): {
  userRole: UserRole
  permissions: PropertyPermissions
} {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [permissions, setPermissions] = useState<PropertyPermissions>({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canBuy: false,
    canInvest: false,
  })

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") as UserRole
      setUserRole(role)

      // Set permissions based on role
      switch (role) {
        case "admin":
          setPermissions({
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canView: true,
            canBuy: false,
            canInvest: false,
          })
          break
        case "agent":
          setPermissions({
            canCreate: true,
            canEdit: true,
            canDelete: false,
            canView: true,
            canBuy: false,
            canInvest: true,
          })
          break
        case "buyer":
          setPermissions({
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canView: true,
            canBuy: true,
            canInvest: true,
          })
          break
        default:
          setPermissions({
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canView: true,
            canBuy: false,
            canInvest: false,
          })
      }
    }
  }, [])

  return { userRole, permissions }
}
