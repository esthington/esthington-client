"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Share2, Facebook, Twitter, Linkedin, Mail, Check, Users, DollarSign, Percent, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useReferrals } from "@/contexts/referrals-context"
import  PageTransition  from "@/components/animations/page-transition"
import  FadeIn  from "@/components/animations/fade-in"
import  StaggerChildren  from "@/components/animations/stagger-children"
import  StaggerItem  from "@/components/animations/stagger-item"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AgentReferralLinkPage() {
  const [copied, setCopied] = useState<string | boolean>(false)
  const [activeTab, setActiveTab] = useState("link")
  const linkRef = useRef(null)
  const codeRef = useRef(null)

  const {
    stats,
    isLoading,
    error,
    commissionRates,
    agentRankInfo,
    getReferralStats,
    generateReferralLink,
    copyReferralLink,
  } = useReferrals()

  const referralLink = stats?.referralLink || "Loading..."
  const referralCode = stats?.referralLink ? stats.referralLink.split("ref=")[1] : "Loading..."

  const copyToClipboard = (text: string, type: string | boolean | ((prevState: string | boolean) => string | boolean)) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join Esthington Real Estate Platform")
    const body = encodeURIComponent(
      `I thought you might be interested in Esthington. Use my referral link to sign up: ${referralLink}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank")
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent("Join Esthington Real Estate Platform using my referral link!")
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, "_blank")
  }

  const shareViaLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, "_blank")
  }

  // Generate referral link if not available
  useEffect(() => {
    if (!stats?.referralLink) {
      generateReferralLink()
    }
  }, [stats, generateReferralLink])

  // Stats data
  const statsData = [
    {
      title: "Total Referrals",
      value: stats?.totalReferrals.toString() || "0",
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Commission Rate",
      value: agentRankInfo && commissionRates ? `${commissionRates[agentRankInfo.currentRank].investment}%` : "0%",
      icon: Percent,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Total Earnings",
      value: `$${stats?.totalEarnings.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "bg-secondary/10 text-secondary",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex flex-col space-y-8">
          <FadeIn>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">My Referral Link</h1>
              <p className="text-gray-400">Share your referral link and earn commissions when new users sign up</p>
            </div>
          </FadeIn>

          {/* Agent Rank Card */}
          {agentRankInfo && (
            <StaggerChildren>
              <StaggerItem>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30] overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Agent Rank: {agentRankInfo.currentRank}</CardTitle>
                        <CardDescription>
                          {agentRankInfo.currentRank !== "Platinum"
                            ? `${agentRankInfo.currentReferrals}/${agentRankInfo.requiredReferrals} referrals to reach ${agentRankInfo.nextRank}`
                            : "You've reached the highest rank!"}
                        </CardDescription>
                      </div>
                      <div className={`p-3 rounded-full bg-${getRankColor(agentRankInfo.currentRank)}-500/20`}>
                        <Award className={`h-6 w-6 text-${getRankColor(agentRankInfo.currentRank)}-500`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {agentRankInfo.currentRank !== "Platinum" && (
                      <div className="mt-2">
                        <div className="h-2 w-full bg-[#2A2A30] rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${getRankColor(agentRankInfo.currentRank)}-500 rounded-full`}
                            style={{ width: `${agentRankInfo.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                          <span>{agentRankInfo.currentReferrals} referrals</span>
                          <span>{agentRankInfo.requiredReferrals} referrals</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerChildren>
          )}

          {/* Stats Cards */}
          <StaggerChildren>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsData.map((stat, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30] hover:border-primary/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                          </div>
                          <div className={cn("p-2 rounded-full", stat.color)}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerChildren>

          {/* Referral Link Card */}
          <StaggerChildren>
            <StaggerItem>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                  <CardHeader>
                    <CardTitle className="text-white">Share Your Referral</CardTitle>
                    <CardDescription>
                      Earn {commissionRates?.[agentRankInfo?.currentRank || "Bronze"]?.investment || 2.5}% commission on
                      investments and {commissionRates?.[agentRankInfo?.currentRank || "Bronze"]?.property || 1}% on
                      property purchases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-[#2A2A30] p-1 rounded-lg">
                        <TabsTrigger
                          value="link"
                          className="data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          Referral Link
                        </TabsTrigger>
                        <TabsTrigger
                          value="code"
                          className="data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          Referral Code
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="link" className="mt-4">
                        <div className="flex flex-col space-y-4">
                          <div className="flex">
                            <Input
                              ref={linkRef}
                              readOnly
                              value={referralLink}
                              className="rounded-r-none bg-[#2A2A30] border-[#3A3A40] text-white"
                            />
                            <Button
                              onClick={() => {
                                copyReferralLink()
                                setCopied("link")
                                setTimeout(() => setCopied(false), 2000)
                              }}
                              variant="default"
                              className="rounded-l-none bg-primary hover:bg-primary/90"
                            >
                              {copied === "link" ? (
                                <Check className="h-4 w-4 mr-2" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2" />
                              )}
                              {copied === "link" ? "Copied!" : "Copy"}
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-[#2A2A30] border-[#3A3A40] text-white hover:bg-primary/20 hover:text-white"
                              onClick={shareViaFacebook}
                            >
                              <Facebook className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-[#2A2A30] border-[#3A3A40] text-white hover:bg-primary/20 hover:text-white"
                              onClick={shareViaTwitter}
                            >
                              <Twitter className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-[#2A2A30] border-[#3A3A40] text-white hover:bg-primary/20 hover:text-white"
                              onClick={shareViaLinkedin}
                            >
                              <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-[#2A2A30] border-[#3A3A40] text-white hover:bg-primary/20 hover:text-white"
                              onClick={shareViaEmail}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-[#2A2A30] border-[#3A3A40] text-white hover:bg-primary/20 hover:text-white"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              More Options
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="mt-4">
                        <div className="flex flex-col space-y-4">
                          <div className="flex">
                            <Input
                              ref={codeRef}
                              readOnly
                              value={referralCode}
                              className="rounded-r-none bg-[#2A2A30] border-[#3A3A40] text-white"
                            />
                            <Button
                              onClick={() => copyToClipboard(referralCode, "code")}
                              variant="default"
                              className="rounded-l-none bg-primary hover:bg-primary/90"
                            >
                              {copied === "code" ? (
                                <Check className="h-4 w-4 mr-2" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2" />
                              )}
                              {copied === "code" ? "Copied!" : "Copy"}
                            </Button>
                          </div>

                          <div className="bg-[#2A2A30]/50 p-4 rounded-lg border border-[#3A3A40]">
                            <h4 className="text-sm font-medium text-white mb-2">How to use your referral code</h4>
                            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                              <li>Share your referral code with potential users</li>
                              <li>Ask them to enter the code during signup</li>
                              <li>Earn commission when they make transactions</li>
                            </ol>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          </StaggerChildren>

          {/* Commission Rates Card */}
          {commissionRates && (
            <StaggerChildren>
              <StaggerItem>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                    <CardHeader>
                      <CardTitle className="text-white">Commission Rates</CardTitle>
                      <CardDescription>Your commission rates based on agent rank</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Object.entries(commissionRates).map(([rank, rates]) => (
                          <Card
                            key={rank}
                            className={cn(
                              "bg-[#2A2A30] border-[#3A3A40]",
                              agentRankInfo?.currentRank === rank && "border-primary/50",
                            )}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle
                                className={cn(
                                  "text-sm flex items-center",
                                  agentRankInfo?.currentRank === rank ? "text-primary" : "text-white",
                                )}
                              >
                                {rank}
                                {agentRankInfo?.currentRank === rank && <Check className="h-4 w-4 ml-1 text-primary" />}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Investment</span>
                                  <span className="text-white font-medium">{rates.investment}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Property</span>
                                  <span className="text-white font-medium">{rates.property}%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            </StaggerChildren>
          )}

          {/* Referral Program Info */}
          <StaggerChildren>
            <StaggerItem>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-[#1F1F23]/50 backdrop-blur-sm border-[#2A2A30]">
                  <CardHeader>
                    <CardTitle className="text-white">Referral Program Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                        <h4 className="text-white font-medium mb-2">How It Works</h4>
                        <ul className="text-sm text-gray-300 space-y-2">
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">
                              1
                            </span>
                            <span>Share your unique referral link or code with potential clients</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">
                              2
                            </span>
                            <span>
                              When they sign up using your link, they're automatically connected to your account
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">
                              3
                            </span>
                            <span>You earn commission on all their transactions based on your agent rank</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">
                              4
                            </span>
                            <span>Commissions are automatically added to your wallet</span>
                          </li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-[#2A2A30] border border-[#3A3A40]">
                          <h4 className="text-white font-medium mb-2">Rank Benefits</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Higher ranks earn higher commission rates</li>
                            <li>• Platinum agents get priority support</li>
                            <li>• Gold+ agents get featured on the platform</li>
                            <li>• Silver+ agents get access to exclusive events</li>
                          </ul>
                        </div>

                        <div className="p-4 rounded-lg bg-[#2A2A30] border border-[#3A3A40]">
                          <h4 className="text-white font-medium mb-2">Payout Information</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Commissions paid monthly</li>
                            <li>• Minimum payout: $50</li>
                            <li>• Direct deposit to your wallet</li>
                            <li>• Withdraw anytime after clearing period</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </div>
    </PageTransition>
  )
}

// Helper function to get color based on rank
function getRankColor(rank: string): string {
  switch (rank) {
    case "Bronze":
      return "yellow"
    case "Silver":
      return "blue"
    case "Gold":
      return "yellow"
    case "Platinum":
      return "purple"
    default:
      return "blue"
  }
}
