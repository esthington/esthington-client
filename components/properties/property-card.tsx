"use client"

import type React from "react"

import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Trash2, Edit, Eye, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import type { Property } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { usePropertyPermissions } from "@/hooks/use-property-permissions"

interface PropertyCardProps {
  property: Property
  onClick: () => void
  onDelete?: () => void
}

export default function PropertyCard({ property, onClick, onDelete }: PropertyCardProps) {
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
    <AnimatedCard
      hoverEffect="lift"
      className="overflow-hidden cursor-pointer bg-background/60 backdrop-blur-lg border-border hover:border-border/80"
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <motion.div whileHover={{ scale: 1.05 }} className="h-full w-full">
          <Image
            src={
              property.images[0] ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt={property.title}
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge
            variant={property.status === "Available" ? "success" : "secondary"}
            className="bg-green-500/20 text-green-400 border-green-500/30"
          >
            {property.status}
          </Badge>
          {property.featured && (
            <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-col">
          <div>
            <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-primary">{formatCurrency(property.price)}</div>
            <div className="text-xs text-muted-foreground">{property.plotSize} SQM</div>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{property.availablePlots}</span> plots available
          </div>

          <div className="flex gap-2">
            {permissions.canEdit && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-blue-600/30 text-blue-400 hover:bg-blue-600/20"
                  onClick={handleEdit}
                >
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
                  className="h-8 w-8 p-0 border-red-600/30 text-red-400 hover:bg-red-600/20"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:bg-foreground/10"
                onClick={onClick}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
