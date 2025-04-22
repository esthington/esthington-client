import type { Metadata } from "next"
import ManageMarketplaceListingsPage from "@/components/marketplace/manage-marketplace-listings-page"

export const metadata: Metadata = {
  title: "Manage Marketplace Listings | Esthington",
  description: "Manage your property listings in the marketplace",
}

export default function ManageMarketplaceListingsRoute() {
  return <ManageMarketplaceListingsPage />
}
