"use client"

import { ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, Building, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"

interface TransactionListProps {
  limit?: number
}

const transactions = [
  {
    id: 1,
    title: "Investment in Downtown Apartment",
    amount: "$25,000",
    type: "investment",
    date: "Today, 10:30 AM",
    status: "completed",
  },
  {
    id: 2,
    title: "Wallet Deposit",
    amount: "$5,000",
    type: "deposit",
    date: "Yesterday, 2:45 PM",
    status: "completed",
  },
  {
    id: 3,
    title: "Commission Payout",
    amount: "$1,200",
    type: "commission",
    date: "May 15, 2023",
    status: "completed",
  },
  {
    id: 4,
    title: "Withdrawal to Bank Account",
    amount: "$3,500",
    type: "withdrawal",
    date: "May 12, 2023",
    status: "pending",
  },
  {
    id: 5,
    title: "Referral Bonus",
    amount: "$500",
    type: "referral",
    date: "May 10, 2023",
    status: "completed",
  },
  {
    id: 6,
    title: "Property Rental Income",
    amount: "$850",
    type: "income",
    date: "May 5, 2023",
    status: "completed",
  },
]

export default function TransactionList({ limit = 10 }: TransactionListProps) {
  const displayTransactions = transactions.slice(0, limit)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "investment":
        return <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "commission":
        return <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "referral":
        return <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case "income":
        return <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <StaggerChildren className="space-y-3" staggerDelay={0.08}>
      {displayTransactions.map((transaction) => (
        <StaggerItem key={transaction.id}>
          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-[#1F1F23] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: 10 }} className="p-2 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
                {getTransactionIcon(transaction.type)}
              </motion.div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{transaction.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-medium",
                  transaction.type === "withdrawal"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400",
                )}
              >
                {transaction.type === "withdrawal" ? "-" : "+"}
                {transaction.amount}
              </p>
              <motion.span
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full inline-block",
                  transaction.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                )}
              >
                {transaction.status}
              </motion.span>
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  )
}
