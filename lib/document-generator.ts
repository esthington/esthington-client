import type { Property } from "./property-types"
import type { Company } from "./company-data"
import { getCompanyById } from "./company-data"

export interface DocumentGenerationOptions {
  property: Property
  buyer: {
    name: string
    email: string
    phone: string
    address: string
  }
  selectedPlots: string[]
  paymentDetails: {
    amount: number
    method: string
    reference: string
    date: string
  }
}

export interface GeneratedDocument {
  id: string
  type: "receipt" | "offer_letter" | "allocation"
  title: string
  content: string
  date: string
  downloadUrl: string
}

export async function generateDocuments(options: DocumentGenerationOptions): Promise<GeneratedDocument[]> {
  const company = getCompanyById(options.property.companyId)

  if (!company) {
    throw new Error("Company not found")
  }

  // In a real app, this would call an API to generate PDFs
  // For this demo, we'll just create mock document objects

  const documents: GeneratedDocument[] = [
    generateReceipt(options, company),
    generateOfferLetter(options, company),
    generateAllocationLetter(options, company),
  ]

  return documents
}

function generateReceipt(options: DocumentGenerationOptions, company: Company): GeneratedDocument {
  const date = new Date().toISOString()
  const id = `RCP-${Math.floor(Math.random() * 1000000)}`

  return {
    id,
    type: "receipt",
    title: `Payment Receipt - ${company.name}`,
    content: `Receipt for payment of ${options.paymentDetails.amount} for property ${options.property.title}`,
    date,
    downloadUrl: `/api/documents/receipt/${id}`,
  }
}

function generateOfferLetter(options: DocumentGenerationOptions, company: Company): GeneratedDocument {
  const date = new Date().toISOString()
  const id = `OFR-${Math.floor(Math.random() * 1000000)}`

  return {
    id,
    type: "offer_letter",
    title: `Offer Letter - ${company.name}`,
    content: `Offer letter for property ${options.property.title}`,
    date,
    downloadUrl: `/api/documents/offer-letter/${id}`,
  }
}

function generateAllocationLetter(options: DocumentGenerationOptions, company: Company): GeneratedDocument {
  const date = new Date().toISOString()
  const id = `ALO-${Math.floor(Math.random() * 1000000)}`

  return {
    id,
    type: "allocation",
    title: `Provisional Allocation - ${company.name}`,
    content: `Provisional allocation for property ${options.property.title}`,
    date,
    downloadUrl: `/api/documents/allocation/${id}`,
  }
}
