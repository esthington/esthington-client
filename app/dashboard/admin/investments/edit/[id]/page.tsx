import { EditInvestmentPage } from "@/components/admin/edit-investment-page"

export default function EditInvestmentRoute({ params }: { params: { id: string } }) {
  return <EditInvestmentPage id={params.id} />
}
