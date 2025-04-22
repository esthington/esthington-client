"use client"

import type React from "react"

/**
 * Higher-Order Component that wraps a component with a layout
 */
export function withLayout<P extends object>(
  Component: React.ComponentType<P>,
  Layout: React.ComponentType<{ children: React.ReactNode }>,
) {
  const WithLayout = (props: P) => {
    return (
      <Layout>
        <Component {...props} />
      </Layout>
    )
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithLayout.displayName = `withLayout(${displayName})`

  return WithLayout
}
