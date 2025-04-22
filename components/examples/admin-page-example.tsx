"use client"

import { withRole } from "@/hocs"

function AdminPageExample() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>This page is only accessible to admin users.</p>
    </div>
  )
}

// Export the component wrapped with the role HOC
export default withRole(AdminPageExample, ["admin", "super_admin"])
