import type { Metadata } from "next"
import AddMarketplaceListingPage from "@/components/marketplace/add-marketplace-listing-page"

export const metadata: Metadata = {
  title: "Add Marketplace Listing | Esthington",
  description: "Add a new property listing to the marketplace",
}

export default function AddMarketplaceListingRoute() {
  return <AddMarketplaceListingPage />
}
