import { ViewReferralPage } from "@/components/admin/view-referral-page"

export default function ViewReferralRoute({ params }: { params: { id: string } }) {
  return <ViewReferralPage id={params.id} />
}
