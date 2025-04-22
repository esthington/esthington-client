"use client"

import type React from "react"

import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Trash2, Edit, Eye, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import type { Property } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { usePropertyPermissions } from "@/hooks/use-property-permissions"

interface PropertyListItemProps {
  property: Property
  onClick: () => void
  onDelete?: () => void
}

export default function PropertyListItem({ property, onClick, onDelete }: PropertyListItemProps) {
  const router = useRouter()
  const { permissions } = usePropertyPermissions()

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/marketplace/edit/${property.id}`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete()
    }
  }

  return (
    <AnimatedCard hoverEffect="lift" className="overflow-hidden cursor-pointer" onClick={onClick}>
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0">
          <Image src={property.images[0] || "/placeholder.svg"} alt={property.title} fill className="object-cover" />
        </div>

        <div className="p-4 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.title}</h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/20 text-white">
                {property.type}
              </Badge>
              <Badge variant="outline" className="bg-blue-500/80 backdrop-blur-md border-blue-400/30 text-white">
                {property.plotSize}
              </Badge>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{property.description}</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{property.availablePlots}</span> plots available
            </div>

            <div className="flex gap-2">
              {permissions.canEdit && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </motion.div>
              )}
              {permissions.canDelete && onDelete && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClick}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
