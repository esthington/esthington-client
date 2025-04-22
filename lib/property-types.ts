import type { Company } from "./company-data"

export interface Plot {
  id: string
  plotId: string
  size: string
  price: number
  status: "Available" | "Reserved" | "Sold"
  selected?: boolean
}

export interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  plotSize: string
  totalPlots: number
  availablePlots: number
  type: "Land" | "Residential" | "Commercial"
  status: "Available" | "Sold Out" | "Coming Soon"
  featured: boolean
  companyId: string
  company?: Company
  amenities: string[]
  plots: Plot[]
  images: string[]
  layoutImage?: string
  documents: Document[]
  createdAt: string
}
