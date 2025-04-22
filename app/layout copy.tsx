
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerToastProvider } from "@/components/ui/sonner-toast-provider"
import { SystemProvider } from "@/contexts/system-context"
import { SecurityProvider } from "@/contexts/security-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { WalletProvider } from "@/contexts/wallet-context"
import { PurchasesProvider } from "@/contexts/purchases-context"
import { ReferralsProvider } from "@/contexts/referrals-context"
import { AuthProvider } from "@/contexts/auth-context"
import { DocumentsProvider } from "@/contexts/documents-context"
import { SupportProvider } from "@/contexts/support-context"
import { AnalyticsProvider } from "@/contexts/analytics-context"
import { VerificationProvider } from "@/contexts/verification-context"
import { FeedbackProvider } from "@/contexts/feedback-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Esthington - Real Estate Investment Platform",
  description: "Invest in premium real estate properties across Nigeria",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SonnerToastProvider />
          <SystemProvider>
            <AuthProvider>
              <SecurityProvider>
                <NotificationsProvider>
                  <WalletProvider>
                    <PurchasesProvider>
                      <ReferralsProvider>
                        <DocumentsProvider>
                          <SupportProvider>
                            <AnalyticsProvider>
                              <VerificationProvider>
                                <FeedbackProvider>{children}</FeedbackProvider>
                              </VerificationProvider>
                            </AnalyticsProvider>
                          </SupportProvider>
                        </DocumentsProvider>
                      </ReferralsProvider>
                    </PurchasesProvider>
                  </WalletProvider>
                </NotificationsProvider>
              </SecurityProvider>
            </AuthProvider>
          </SystemProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'