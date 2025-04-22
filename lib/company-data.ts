export interface Company {
  id: string
  name: string
  logo: string
  description: string
  primaryColor: string
  secondaryColor: string
}

export const esthingtonCompanies: Company[] = [
  {
    id: "esthington-homes",
    name: "Esthington Homes",
    logo: "/placeholder.svg?height=100&width=100&text=EH",
    description: "Premium residential properties and homes",
    primaryColor: "#342B81",
    secondaryColor: "#6C63FF",
  },
  {
    id: "esthington-commercial",
    name: "Esthington Commercial",
    logo: "/placeholder.svg?height=100&width=100&text=EC",
    description: "Commercial real estate and office spaces",
    primaryColor: "#2B8147",
    secondaryColor: "#63FF8C",
  },
  {
    id: "esthington-lands",
    name: "Esthington Lands",
    logo: "/placeholder.svg?height=100&width=100&text=EL",
    description: "Premium land investments and developments",
    primaryColor: "#814B2B",
    secondaryColor: "#FFA563",
  },
  {
    id: "esthington-industrial",
    name: "Esthington Industrial",
    logo: "/placeholder.svg?height=100&width=100&text=EI",
    description: "Industrial properties and warehouses",
    primaryColor: "#812B2B",
    secondaryColor: "#FF6363",
  },
  {
    id: "esthington-luxury",
    name: "Esthington Luxury",
    logo: "/placeholder.svg?height=100&width=100&text=ELux",
    description: "Ultra-luxury properties and estates",
    primaryColor: "#81762B",
    secondaryColor: "#FFD863",
  },
  {
    id: "esthington-international",
    name: "Esthington International",
    logo: "/placeholder.svg?height=100&width=100&text=EInt",
    description: "International real estate investments",
    primaryColor: "#2B7081",
    secondaryColor: "#63D6FF",
  },
]

export function getCompanyById(id: string): Company | undefined {
  return esthingtonCompanies.find((company) => company.id === id)
}

export function getCompanyByName(name: string): Company | undefined {
  return esthingtonCompanies.find((company) => company.name === name)
}
