"use client"

import type React from "react"
import { Component, type ErrorInfo } from "react"

interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Something went wrong</h2>
            <p className="mt-2 text-red-600 dark:text-red-300">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * Higher-Order Component that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  },
) {
  const WithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary fallback={options?.fallback} onError={options?.onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return WithErrorBoundary
}
