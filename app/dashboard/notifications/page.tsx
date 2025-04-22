import type { Metadata } from "next"
import NotificationsPage from "@/components/admin/notifications-page"

export const metadata: Metadata = {
  title: "Notifications | Esthington",
  description: "Manage system notifications for your Esthington platform",
}

export default function NotificationsRoute() {
  return <NotificationsPage />
}
