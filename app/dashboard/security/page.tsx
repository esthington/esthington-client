import type { Metadata } from "next"
import SecurityPage from "@/components/admin/security-page"

export const metadata: Metadata = {
  title: "Security Settings | Esthington",
  description: "Manage security settings for your Esthington platform",
}

export default function SecurityRoute() {
  return <SecurityPage />
}
