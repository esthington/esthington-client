import type { Metadata } from "next";
import InvestmentsPage from "@/components/admin/investments-page";

export const metadata: Metadata = {
  title: "Manage Investments | Esthington Admin",
  description: "Create and manage investment opportunities",
};

export default function AdminInvestmentsRoute() {
  return <InvestmentsPage />;
}
