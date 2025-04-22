import type React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Composes multiple HOCs from right to left
 * @param {...Function} hocs - The HOCs to compose
 * @returns {Function} A composed HOC
 */
export function compose(...hocs: Function[]) {
  return (Component: React.ComponentType<any>, options?: any) =>
    hocs.reduceRight((acc, hoc) => {
      return hoc(acc, options)
    }, Component)
}
