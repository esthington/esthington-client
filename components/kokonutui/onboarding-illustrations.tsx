"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function WelcomeIllustration() {
  return (
    <div className="relative w-64 h-64">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Image
          src="https://as2.ftcdn.net/jpg/06/07/79/05/1000_F_607790534_pZii2r1shyi7uZKWPOIWEtWPNdGCe4mV.jpg"
          alt="Welcome to Esthington"
          fill
          className="object-cover rounded-full"
        />
      </motion.div>
    </div>
  )
}

export function AccountsIllustration() {
  return (
    <div className="relative w-64 h-64">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Image
          src="https://media.istockphoto.com/id/1397751417/vector/3d-vecor-icon.jpg?s=612x612&w=0&k=20&c=fr9uLHuOy25jER-42MccLPegRvIyI7O3jnFOW5QoFsE="
          alt="Property Investment"
          fill
          className="object-cover rounded-full"
        />
      </motion.div>
    </div>
  )
}

export function TransactionsIllustration() {
  return (
    <div className="relative w-64 h-64">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Image
          src="https://img.freepik.com/premium-vector/wallet-with-dollar-banknotes-green-cash-mobile-banking-3d-vector-icon-cartoon-minimal-style_365941-1160.jpg?semt=ais_hybrid"
          alt="Monitor Transactions"
          fill
          className="object-cover rounded-full"
        />
      </motion.div>
    </div>
  )
}

export function GoalsIllustration() {
  return (
    <div className="relative w-64 h-64">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Image
          src="https://img.freepik.com/free-vector/store-grocery-shop-building-isolated-white-background_1284-14054.jpg"
          alt="Set Financial Goals"
          fill
          className="object-cover rounded-full"
        />
      </motion.div>
    </div>
  )
}

export const PropertyInvestmentIllustration = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="200" height="200" rx="10" fill="#F5F7FA" />
    <path d="M100 40L40 80V160H160V80L100 40Z" fill="#E2E8F0" stroke="#342B81" strokeWidth="4" />
    <rect x="70" y="100" width="60" height="60" fill="#FFFFFF" stroke="#342B81" strokeWidth="3" />
    <rect x="85" y="115" width="30" height="30" fill="#FF9E0B" />
    <path d="M40 80H160" stroke="#342B81" strokeWidth="3" />
    <circle cx="100" cy="60" r="10" fill="#FF9E0B" />
    <rect x="90" y="140" width="20" height="20" fill="#FFFFFF" stroke="#342B81" strokeWidth="2" />
  </svg>
)

export const DigitalWalletIllustration = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="200" height="200" rx="10" fill="#F5F7FA" />
    <rect x="50" y="60" width="100" height="80" rx="8" fill="#FFFFFF" stroke="#342B81" strokeWidth="4" />
    <rect x="60" y="80" width="80" height="10" rx="2" fill="#E2E8F0" />
    <rect x="60" y="100" width="40" height="10" rx="2" fill="#E2E8F0" />
    <circle cx="130" cy="105" r="15" fill="#FF9E0B" />
    <rect x="60" y="120" width="80" height="10" rx="2" fill="#E2E8F0" />
    <rect x="140" y="70" width="20" height="30" rx="4" fill="#342B81" />
  </svg>
)

export const MarketplaceIllustration = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="200" height="200" rx="10" fill="#F5F7FA" />
    <rect x="40" y="60" width="50" height="80" rx="4" fill="#FFFFFF" stroke="#342B81" strokeWidth="3" />
    <rect x="110" y="60" width="50" height="80" rx="4" fill="#FFFFFF" stroke="#342B81" strokeWidth="3" />
    <path d="M50 80H80" stroke="#E2E8F0" strokeWidth="4" />
    <path d="M50 100H80" stroke="#E2E8F0" strokeWidth="4" />
    <path d="M50 120H80" stroke="#E2E8F0" strokeWidth="4" />
    <path d="M120 80H150" stroke="#E2E8F0" strokeWidth="4" />
    <path d="M120 100H150" stroke="#E2E8F0" strokeWidth="4" />
    <path d="M120 120H150" stroke="#E2E8F0" strokeWidth="4" />
    <circle cx="65" cy="50" r="10" fill="#FF9E0B" />
    <circle cx="135" cy="50" r="10" fill="#FF9E0B" />
    <path d="M65 50L135 50" stroke="#342B81" strokeWidth="3" />
  </svg>
)
