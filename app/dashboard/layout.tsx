import type React from "react"
import Layout from "@/components/kokonutui/layout"
import { SystemProvider } from "@/contexts/system-context"
import { SecurityProvider } from "@/contexts/security-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { MarketplaceProvider } from "@/contexts/marketplace-context"
import { ManagementProvider } from "@/contexts/management-context"
import { ReferralsProvider } from "@/contexts/referrals-context"
import { PropertyProvider } from "@/contexts/property-context"
import { WalletProvider } from "@/contexts/wallet-context"
// Add UIProvider import
import { UIProvider } from "@/contexts/ui-context"
import { InvestmentProvider } from "@/contexts/investments-context"
import { ProfileCompletionProvider } from "@/components/profile/profile-completion-provider"

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
            <PropertyProvider>
              <ManagementProvider>
                <ReferralsProvider>
                  <PropertyProvider>
                    <InvestmentProvider>
                      <WalletProvider>
                        <UIProvider>
                        <ProfileCompletionProvider>
                          <Layout>{children}</Layout>
                          </ProfileCompletionProvider>
                        </UIProvider>
                      </WalletProvider>
                    </InvestmentProvider>
                  </PropertyProvider>
                </ReferralsProvider>
              </ManagementProvider>
            </PropertyProvider>
          </MarketplaceProvider>
        </NotificationsProvider>
      </SecurityProvider>
    </SystemProvider>
  )
}
