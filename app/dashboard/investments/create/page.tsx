import type { Metadata } from "next"
import { CreateInvestmentPage } from "@/components/admin/create-investment-page"

export const metadata: Metadata = {
  title: "Create Investment | Esthington Admin",
  description: "Create a new investment opportunity",
}

export default function CreateInvestmentRoute() {
  return <CreateInvestmentPage />
}
