"use client"

import { Building, MapPin, Bed, Bath, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/ui/animated-card"
import { motion } from "framer-motion"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"

interface PropertyListProps {
  limit?: number
}

const properties = [
  {
    id: 1,
    title: "Modern Apartment in Downtown",
    location: "123 Main St, New York, NY",
    price: "$450,000",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sqft",
    image: "/placeholder.svg?height=200&width=300",
    status: "For Sale",
    return: "8% p.a.",
  },
  {
    id: 2,
    title: "Luxury Villa with Pool",
    location: "456 Ocean Dr, Miami, FL",
    price: "$1,250,000",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    area: "3,500 sqft",
    image: "/placeholder.svg?height=200&width=300",
    status: "For Investment",
    return: "12% p.a.",
  },
  {
    id: 3,
    title: "Cozy Townhouse Near Park",
    location: "789 Park Ave, Boston, MA",
    price: "$650,000",
    type: "Townhouse",
    bedrooms: 3,
    bathrooms: 2.5,
    area: "2,100 sqft",
    image: "/placeholder.svg?height=200&width=300",
    status: "For Sale",
    return: "7% p.a.",
  },
  {
    id: 4,
    title: "Beachfront Condo",
    location: "101 Beach Rd, San Diego, CA",
    price: "$850,000",
    type: "Condo",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,800 sqft",
    image: "/placeholder.svg?height=200&width=300",
    status: "For Investment",
    return: "10% p.a.",
  },
  {
    id: 5,
    title: "Suburban Family Home",
    location: "202 Maple St, Chicago, IL",
    price: "$550,000",
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,800 sqft",
    image: "/placeholder.svg?height=200&width=300",
    status: "For Sale",
    return: "6% p.a.",
  },
]

export default function PropertyList({ limit = 10 }: PropertyListProps) {
  const displayProperties = properties.slice(0, limit)

  return (
    <StaggerChildren className="space-y-4">
      {displayProperties.map((property) => (
        <StaggerItem key={property.id}>
          <AnimatedCard
            hoverEffect="lift"
            className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors"
          >
            <div className="relative w-full sm:w-32 h-24 rounded-md overflow-hidden">
              <motion.div whileHover={{ scale: 1.05 }} className="h-full w-full">
                <Image src={property.image || "/placeholder.svg"} alt={property.title} fill className="object-cover" />
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{property.title}</h3>
                <Badge variant={property.status === "For Investment" ? "secondary" : "outline"}>
                  {property.status}
                </Badge>
              </div>

              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <Building className="h-3 w-3 mr-1" />
                  <span>{property.type}</span>
                </div>

                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <Bed className="h-3 w-3 mr-1" />
                  <span>{property.bedrooms} Beds</span>
                </div>

                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <Bath className="h-3 w-3 mr-1" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{property.price}</span>
                  {property.status === "For Investment" && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">{property.return}</span>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </AnimatedCard>
        </StaggerItem>
      ))}

      {displayProperties.length < properties.length && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button variant="outline" className="w-full mt-2">
            View All Properties
          </Button>
        </motion.div>
      )}
    </StaggerChildren>
  )
}
