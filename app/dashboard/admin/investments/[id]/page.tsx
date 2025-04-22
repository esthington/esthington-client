import { ViewInvestmentPage } from "@/components/admin/view-investment-page"

export default function ViewInvestmentRoute({ params }: { params: { id: string } }) {
  return <ViewInvestmentPage id={params.id} />
}
