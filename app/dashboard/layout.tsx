import type React from "react"
import Layout from "@/components/kokonutui/layout"
import { SystemProvider } from "@/contexts/system-context"
import { SecurityProvider } from "@/contexts/security-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { MarketplaceProvider } from "@/contexts/marketplace-context"
import { PurchasesProvider } from "@/contexts/purchases-context"
import { ManagementProvider } from "@/contexts/management-context"
import { ReferralsProvider } from "@/contexts/referrals-context"
import { PropertyProvider } from "@/contexts/property-context"
import { InvestmentsProvider } from "@/contexts/investments-context"
import { WalletProvider } from "@/contexts/wallet-context"
// Add UIProvider import
import { UIProvider } from "@/contexts/ui-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SystemProvider>
      <SecurityProvider>
        <NotificationsProvider>
          <MarketplaceProvider>
            <PurchasesProvider>
              <ManagementProvider>
                <ReferralsProvider>
                  <PropertyProvider>
                    <InvestmentsProvider>
                      <WalletProvider>
                        <UIProvider>
                          <Layout>{children}</Layout>
                        </UIProvider>
                      </WalletProvider>
                    </InvestmentsProvider>
                  </PropertyProvider>
                </ReferralsProvider>
              </ManagementProvider>
            </PurchasesProvider>
          </MarketplaceProvider>
        </NotificationsProvider>
      </SecurityProvider>
    </SystemProvider>
  )
}
