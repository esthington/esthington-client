import { ViewMarketplaceListingPage } from "@/components/marketplace/view-marketplace-listing-page"

export default function ViewMarketplaceListingRoute({ params }: { params: { id: string } }) {
  return <ViewMarketplaceListingPage params={params} />
}
