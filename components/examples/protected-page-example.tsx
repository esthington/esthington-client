"use client"

import { withAuth } from "@/hocs"

function ProtectedPageExample() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  )
}

// Export the component wrapped with the auth HOC
export default withAuth(ProtectedPageExample)
