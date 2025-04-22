"use client"

import { withPermission } from "@/hocs"

function UserManagementExample() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p>This page is only accessible to users with the viewUsers permission.</p>
    </div>
  )
}

// Export the component wrapped with the permission HOC
export default withPermission(UserManagementExample, "viewUsers")
