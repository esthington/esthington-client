"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import PropertyDetailPage from "@/components/properties/property-detail-page"
import { PropertyProvider } from "@/contexts/property-context"

export default function PropertyDetailPageWrapper() {

  return (
    <PropertyProvider>
      <PropertyDetailPage  />
    </PropertyProvider>
  )
}
