"use client";

import { useState, useEffect } from "react";
import {
  Building,
  CreditCard,
  Wallet,
  Users,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyList from "./property-list";
import TransactionList from "./transaction-list";
import { AnimatedCard } from "@/components/ui/animated-card";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/fade-in";
import StaggerChildren from "@/components/animations/stagger-children";
import StaggerItem from "@/components/animations/stagger-item";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardContent() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(user?.role ?? null);
  const [progressValues, setProgressValues] = useState({
    portfolio: 0,
    annual: 0,
    capital: 0,
  });

  useEffect(() => {

    if (typeof window !== "undefined") {
      setUserRole(user?.role ?? null);
    }

    // Animate progress bars
    const timer = setTimeout(() => {
      setProgressValues({
        portfolio: 70,
        annual: 45,
        capital: 30,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Admin dashboard content
  const renderAdminContent = () => (
    <FadeIn>
      <div className="space-y-6">
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
                <CardDescription>All listed properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    248
                  </motion.div>
                  <Building className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+12%</span> from last month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <CardDescription>Buyers and agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    1,024
                  </motion.div>
                  <Users className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+8%</span> from last month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Investments
                </CardTitle>
                <CardDescription>All property investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    $4.2M
                  </motion.div>
                  <Briefcase className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+15%</span> from last month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Platform Revenue
                </CardTitle>
                <CardDescription>Total earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    $320K
                  </motion.div>
                  <CreditCard className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+5%</span> from last month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>
        </StaggerChildren>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn delay={0.3} direction="left">
            <AnimatedCard hoverEffect="glow">
              <CardHeader>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>
                  Latest properties added to the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyList limit={5} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.4} direction="right">
            <AnimatedCard hoverEffect="glow">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList limit={5} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>
        </div>
      </div>
    </FadeIn>
  );

  // Buyer dashboard content
  const renderBuyerContent = () => (
    <FadeIn>
      <div className="space-y-6">
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <CardDescription>Your current balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                  >
                    $8,750
                  </motion.div>
                  <Wallet className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex justify-between mt-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      Fund
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Withdraw
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  My Investments
                </CardTitle>
                <CardDescription>Properties you've invested in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                  >
                    3
                  </motion.div>
                  <Briefcase className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total value: <span className="font-medium">$45,000</span>
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Properties
                </CardTitle>
                <CardDescription>Properties for investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                  >
                    124
                  </motion.div>
                  <Building className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+8</span> new this week
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Investment Returns
                </CardTitle>
                <CardDescription>Total earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                  >
                    $2,340
                  </motion.div>
                  <CreditCard className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+$320</span> this month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>
        </StaggerChildren>

        <FadeIn delay={0.4}>
          <Tabs defaultValue="featured">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="featured">Featured Properties</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
            </TabsList>
            <TabsContent value="featured" className="mt-4">
              <PropertyList limit={3} />
            </TabsContent>
            <TabsContent value="trending" className="mt-4">
              <PropertyList limit={3} />
            </TabsContent>
            <TabsContent value="recommended" className="mt-4">
              <PropertyList limit={3} />
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </FadeIn>
  );

  // Agent dashboard content
  const renderAgentContent = () => (
    <FadeIn>
      <div className="space-y-6">
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  My Properties
                </CardTitle>
                <CardDescription>Properties you've listed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    12
                  </motion.div>
                  <Building className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+2</span> this month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  My Referrals
                </CardTitle>
                <CardDescription>Users you've referred</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    48
                  </motion.div>
                  <Users className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+5</span> this month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <CardDescription>Your current balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    $2,450
                  </motion.div>
                  <Wallet className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+$350</span> this month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>

          <StaggerItem>
            <AnimatedCard hoverEffect="lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Commission
                </CardTitle>
                <CardDescription>Total earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    $12,680
                  </motion.div>
                  <CreditCard className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">+$1,200</span> this month
                </div>
              </CardContent>
            </AnimatedCard>
          </StaggerItem>
        </StaggerChildren>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn delay={0.3} direction="left">
            <AnimatedCard hoverEffect="glow">
              <CardHeader>
                <CardTitle>My Properties</CardTitle>
                <CardDescription>Properties you've listed</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyList limit={5} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.4} direction="right">
            <AnimatedCard hoverEffect="glow">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your recent financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList limit={5} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>
          
        </div>
      </div>
    </FadeIn>
  );

  // Render dashboard content based on user role
  const renderDashboardContent = () => {
    if (userRole === "admin") {
      return renderAdminContent();
    } else if (userRole === "agent") {
      return renderAgentContent();
    } else {
      return renderBuyerContent();
    }
  };

  return renderDashboardContent();
}
