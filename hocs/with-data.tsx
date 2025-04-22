"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {LoadingSpinner} from "@/components/ui/loading-spinner"

interface WithDataOptions<T> {
  fetchData: () => Promise<T>
  loadingComponent?: React.ReactNode
  errorComponent?: (error: Error) => React.ReactNode
  dependencies?: any[]
}

/**
 * Higher-Order Component that handles data fetching
 */
export function withData<T, P extends object>(
  Component: React.ComponentType<P & { data: T }>,
  options: WithDataOptions<T>,
) {
  const WithData = (props: P) => {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const dependencies = options.dependencies || []

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const result = await options.fetchData()
          setData(result)
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }, dependencies)

    // Show loading state
    if (isLoading) {
      return options.loadingComponent || <LoadingSpinner />
    }

    // Show error state
    if (error) {
      return options.errorComponent ? (
        options.errorComponent(error)
      ) : (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Error loading data</h2>
          <p className="mt-2 text-red-600 dark:text-red-300">{error.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => setIsLoading(true)} // This will trigger a re-fetch
          >
            Retry
          </button>
        </div>
      )
    }

    // When data is loaded, render the wrapped component
    return <Component {...props} data={data as T} />
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithData.displayName = `withData(${displayName})`

  return WithData
}
