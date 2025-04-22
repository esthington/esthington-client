import { EditMarketplaceListingPage } from "@/components/marketplace/edit-marketplace-listing-page"

export default function EditMarketplaceListingRoute({ params }: { params: { id: string } }) {
  return <EditMarketplaceListingPage params={params} />
}
