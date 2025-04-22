"use client"

import { useState } from "react"
import { Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { formatCurrency } from "@/lib/utils"
import type { Plot } from "@/lib/property-types"

interface PlotSelectionProps {
  plots: Plot[]
  onPlotSelectionChange: (selectedPlots: Plot[]) => void
  maxSelections?: number
}

export default function PlotSelection({ plots, onPlotSelectionChange, maxSelections = 0 }: PlotSelectionProps) {
  const [selectedPlots, setSelectedPlots] = useState<Plot[]>([])
  const [error, setError] = useState<string | null>(null)

  const availablePlots = plots.filter((plot) => plot.status === "Available")

  const handlePlotToggle = (plot: Plot) => {
    if (plot.status !== "Available") return

    setError(null)

    const isSelected = selectedPlots.some((p) => p.id === plot.id)

    if (isSelected) {
      // Remove from selection
      const newSelection = selectedPlots.filter((p) => p.id !== plot.id)
      setSelectedPlots(newSelection)
      onPlotSelectionChange(newSelection)
    } else {
      // Add to selection if under max limit
      if (maxSelections > 0 && selectedPlots.length >= maxSelections) {
        setError(`You can only select up to ${maxSelections} plots`)
        return
      }

      const newSelection = [...selectedPlots, plot]
      setSelectedPlots(newSelection)
      onPlotSelectionChange(newSelection)
    }
  }

  const totalPrice = selectedPlots.reduce((sum, plot) => sum + Number(plot.price), 0)

  return (
    <AnimatedCard className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select Plot(s) to Purchase</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {availablePlots.length} plot{availablePlots.length !== 1 ? "s" : ""} available for purchase
        </p>
        {error && (
          <div className="mt-2 flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {plots.map((plot) => {
          const isSelected = selectedPlots.some((p) => p.id === plot.id)
          const isAvailable = plot.status === "Available"

          return (
            <div
              key={plot.id}
              className={`
                border rounded-lg p-4 transition-all
                ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}
                ${isAvailable ? "cursor-pointer hover:border-blue-300" : "opacity-60 cursor-not-allowed"}
              `}
              onClick={() => handlePlotToggle(plot)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`
                    w-5 h-5 rounded-full border flex items-center justify-center mr-3
                    ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"}
                  `}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {plot.size} SQM ({plot.plotId})
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(Number(plot.price))}</p>
                  </div>
                </div>
                <div>
                  <span
                    className={`
                    text-xs px-2 py-1 rounded-full
                    ${
                      plot.status === "Available"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : plot.status === "Reserved"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }
                  `}
                  >
                    {plot.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedPlots.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlots.length} plot{selectedPlots.length !== 1 ? "s" : ""} selected
              </p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">Total: {formatCurrency(totalPrice)}</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Continue to Purchase</Button>
          </div>
        </div>
      )}
    </AnimatedCard>
  )
}
