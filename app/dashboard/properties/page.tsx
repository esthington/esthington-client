"use client"

import PropertyListingPage from "@/components/properties/property-listing-page"
import { PropertyProvider } from "@/contexts/property-context"

export default function PropertiesPage() {
  return (
    <PropertyProvider>
      <PropertyListingPage />
    </PropertyProvider>
  )
}
