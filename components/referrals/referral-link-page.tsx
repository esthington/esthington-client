"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Share2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AnimatedCard } from "@/components/ui/animated-card"
import { NotificationToast } from "@/components/ui/notification-toast"
import  PageTransition  from "@/components/animations/page-transition"
import  FadeIn  from "@/components/animations/fade-in"
import  StaggerChildren  from "@/components/animations/stagger-children"
import  StaggerItem  from "@/components/animations/stagger-item"

export default function ReferralLinkPage() {
  const [copied, setCopied] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  const referralLink = "https://esthington.com/ref/agent123"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setNotificationMessage("Referral link copied to clipboard!")
    setShowNotification(true)

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join Esthington Real Estate",
          text: "Check out this amazing real estate investment platform!",
          url: referralLink,
        })
        .then(() => {
          setNotificationMessage("Link shared successfully!")
          setShowNotification(true)
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      copyToClipboard()
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/my-referral-link">My Referral Link</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FadeIn>
          <h1 className="text-3xl font-bold mb-2 text-white">My Referral Link</h1>
          <p className="text-gray-400 mb-8">
            Share your unique referral link to earn commissions on referred investments.
          </p>
        </FadeIn>

        <StaggerChildren>
          <StaggerItem>
            <AnimatedCard className="mb-8 bg-[#1F1F23]/60 backdrop-blur-lg border-[#2A2A30]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Your Unique Referral Link</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-[#0F0F12]/80 border-[#2A2A30] text-gray-300"
                  />
                  <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                  <Button
                    onClick={shareLink}
                    variant="outline"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <AnimatedCard className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-lg border-blue-800/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">Total Referrals</h3>
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-sm text-blue-300 mt-2">+3 this month</p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-green-600/20 to-green-900/20 backdrop-blur-lg border-green-800/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-green-300">Total Earnings</h3>
                  <p className="text-3xl font-bold text-white">$2,450</p>
                  <p className="text-sm text-green-300 mt-2">+$350 this month</p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-lg border-purple-800/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-purple-300">Conversion Rate</h3>
                  <p className="text-3xl font-bold text-white">18.5%</p>
                  <p className="text-sm text-purple-300 mt-2">+2.3% from last month</p>
                </div>
              </AnimatedCard>
            </div>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard className="bg-[#1F1F23]/60 backdrop-blur-lg border-[#2A2A30]">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">How Referrals Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
                      <Share2 className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-white">Share Your Link</h3>
                    <p className="text-gray-400">Share your unique referral link with potential investors.</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                      >
                        <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </motion.div>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-white">They Invest</h3>
                    <p className="text-gray-400">When they invest through your link, we track the referral.</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-white">You Earn</h3>
                    <p className="text-gray-400">
                      Earn 5% commission on their initial investment and 1% on recurring investments.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>
        </StaggerChildren>
      </div>

      {/* {showNotification && (
        <NotificationToast message={notificationMessage} type="success" onClose={() => setShowNotification(false)} />
      )} */}
    </PageTransition>
  )
}
