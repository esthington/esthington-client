"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for analytics
export type TimeRange = "day" | "week" | "month" | "quarter" | "year" | "custom"

export type ChartType = "line" | "bar" | "pie" | "doughnut" | "area" | "scatter"

export type DataPoint = {
  label: string
  value: number
}

export type ChartData = {
  id: string
  title: string
  description?: string
  type: ChartType
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
  options?: Record<string, any>
}

export type AnalyticsSummary = {
  totalUsers: number
  totalProperties: number
  totalInvestments: number
  totalTransactions: number
  totalRevenue: number
  activeUsers: number
  conversionRate: number
  averageInvestment: number
  userGrowthRate: number
}

export type AnalyticsReport = {
  id: string
  title: string
  description?: string
  timeRange: TimeRange
  customStartDate?: string
  customEndDate?: string
  charts: ChartData[]
  summary: AnalyticsSummary
  createdAt: string
  createdBy?: string
  isScheduled: boolean
  scheduleFrequency?: "daily" | "weekly" | "monthly"
  recipients?: string[]
}

// Context type
type AnalyticsContextType = {
  // State
  summary: AnalyticsSummary | null
  charts: ChartData[]
  reports: AnalyticsReport[]
  selectedReport: AnalyticsReport | null
  timeRange: TimeRange
  customStartDate?: string
  customEndDate?: string
  isLoading: boolean
  isSubmitting: boolean

  // Dashboard analytics
  getDashboardAnalytics: (
    timeRange: TimeRange,
    customStartDate?: string,
    customEndDate?: string,
  ) => Promise<{
    summary: AnalyticsSummary
    charts: ChartData[]
  }>

  // Reports
  getReports: () => Promise<AnalyticsReport[]>
  getReportById: (id: string) => Promise<AnalyticsReport | null>
  createReport: (report: Omit<AnalyticsReport, "id" | "createdAt">) => Promise<AnalyticsReport | null>
  updateReport: (id: string, data: Partial<AnalyticsReport>) => Promise<boolean>
  deleteReport: (id: string) => Promise<boolean>

  // Time range
  setTimeRange: (range: TimeRange, startDate?: string, endDate?: string) => void

  // Export
  exportReportPDF: (reportId: string) => Promise<boolean>
  exportReportCSV: (reportId: string) => Promise<boolean>

  // Schedule
  scheduleReport: (
    reportId: string,
    frequency: "daily" | "weekly" | "monthly",
    recipients: string[],
  ) => Promise<boolean>
  unscheduleReport: (reportId: string) => Promise<boolean>
}

// Mock data
const mockCharts: ChartData[] = [
  {
    id: "chart1",
    title: "User Growth",
    description: "Monthly user registrations over time",
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [65, 78, 90, 105, 125, 150],
        borderColor: "#4f46e5",
      },
    ],
  },
  {
    id: "chart2",
    title: "Revenue Breakdown",
    description: "Revenue by category",
    type: "pie",
    labels: ["Investments", "Property Sales", "Referrals", "Fees"],
    datasets: [
      {
        label: "Revenue",
        data: [45, 30, 15, 10],
        backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  },
  {
    id: "chart3",
    title: "Transaction Volume",
    description: "Number of transactions by type",
    type: "bar",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Investments",
        data: [30, 35, 40, 50, 60, 70],
        backgroundColor: "#4f46e5",
      },
      {
        label: "Property Sales",
        data: [20, 25, 30, 35, 40, 45],
        backgroundColor: "#10b981",
      },
    ],
  },
  {
    id: "chart4",
    title: "User Activity",
    description: "Daily active users",
    type: "area",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active Users",
        data: [1200, 1300, 1400, 1350, 1500, 1000, 900],
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "#4f46e5",
      },
    ],
  },
]

const mockSummary: AnalyticsSummary = {
  totalUsers: 5280,
  totalProperties: 320,
  totalInvestments: 450,
  totalTransactions: 1250,
  totalRevenue: 125000000, // ₦125M
  activeUsers: 3500,
  conversionRate: 12.5, // 12.5%
  averageInvestment: 275000, // ₦275K
  userGrowthRate: 8.5, // 8.5%
}

const mockReports: AnalyticsReport[] = [
  {
    id: "report1",
    title: "Monthly Performance Report",
    description: "Overview of platform performance for the current month",
    timeRange: "month",
    charts: mockCharts,
    summary: mockSummary,
    createdAt: new Date().toISOString(),
    createdBy: "admin1",
    isScheduled: true,
    scheduleFrequency: "monthly",
    recipients: ["admin@example.com", "finance@example.com"],
  },
  {
    id: "report2",
    title: "Quarterly Investment Analysis",
    description: "Detailed analysis of investment performance for Q2 2023",
    timeRange: "quarter",
    charts: mockCharts.slice(0, 2),
    summary: mockSummary,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    createdBy: "admin2",
    isScheduled: false,
  },
  {
    id: "report3",
    title: "Annual Growth Report",
    description: "Year-over-year growth analysis for 2023",
    timeRange: "year",
    charts: mockCharts.slice(1, 3),
    summary: mockSummary,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    createdBy: "admin1",
    isScheduled: true,
    scheduleFrequency: "monthly",
    recipients: ["management@example.com"],
  },
]

// Create context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [charts, setCharts] = useState<ChartData[]>([])
  const [reports, setReports] = useState<AnalyticsReport[]>([])
  const [selectedReport, setSelectedReport] = useState<AnalyticsReport | null>(null)
  const [timeRange, setTimeRangeState] = useState<TimeRange>("month")
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize analytics
  useEffect(() => {
    const initAnalytics = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Set initial data
        setSummary(mockSummary)
        setCharts(mockCharts)
        setReports(mockReports)
      } catch (error) {
        console.error("Failed to initialize analytics:", error)
        errorToast("Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    initAnalytics()
  }, [])

  // Get dashboard analytics
  const getDashboardAnalytics = async (
    range: TimeRange,
    startDate?: string,
    endDate?: string,
  ): Promise<{ summary: AnalyticsSummary; charts: ChartData[] }> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call with the time range parameters
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update state
      setTimeRangeState(range)
      setCustomStartDate(startDate)
      setCustomEndDate(endDate)

      // Return mock data (in a real app, this would be the data from the API)
      return {
        summary: mockSummary,
        charts: mockCharts,
      }
    } catch (error) {
      console.error("Failed to get dashboard analytics:", error)
      errorToast("Failed to load analytics data")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get reports
  const getReports = async (): Promise<AnalyticsReport[]> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return reports
    } catch (error) {
      console.error("Failed to get reports:", error)
      errorToast("Failed to load reports")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Get report by ID
  const getReportById = async (id: string): Promise<AnalyticsReport | null> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      const report = reports.find((r) => r.id === id) || null
      setSelectedReport(report)

      if (report) {
        // Update time range
        setTimeRangeState(report.timeRange)
        setCustomStartDate(report.customStartDate)
        setCustomEndDate(report.customEndDate)
      }

      return report
    } catch (error) {
      console.error("Failed to get report:", error)
      errorToast("Failed to load report")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Create report
  const createReport = async (report: Omit<AnalyticsReport, "id" | "createdAt">): Promise<AnalyticsReport | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new report
      const newReport: AnalyticsReport = {
        ...report,
        id: `report${reports.length + 1}`,
        createdAt: new Date().toISOString(),
      }

      // Update state
      setReports((prev) => [...prev, newReport])

      successToast("Report created successfully")
      return newReport
    } catch (error) {
      console.error("Failed to create report:", error)
      errorToast("Failed to create report")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update report
  const updateReport = async (id: string, data: Partial<AnalyticsReport>): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update report
      setReports((prev) => prev.map((report) => (report.id === id ? { ...report, ...data } : report)))

      // Update selected report if it's the one being updated
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport((prev) => (prev ? { ...prev, ...data } : null))
      }

      successToast("Report updated successfully")
      return true
    } catch (error) {
      console.error("Failed to update report:", error)
      errorToast("Failed to update report")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete report
  const deleteReport = async (id: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Delete report
      setReports((prev) => prev.filter((report) => report.id !== id))

      // Clear selected report if it's the one being deleted
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null)
      }

      successToast("Report deleted successfully")
      return true
    } catch (error) {
      console.error("Failed to delete report:", error)
      errorToast("Failed to delete report")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set time range
  const setTimeRange = (range: TimeRange, startDate?: string, endDate?: string) => {
    setTimeRangeState(range)
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)

    // Refresh data with new time range
    getDashboardAnalytics(range, startDate, endDate)
  }

  // Export report as PDF
  const exportReportPDF = async (reportId: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      successToast("Report exported as PDF successfully")
      return true
    } catch (error) {
      console.error("Failed to export report as PDF:", error)
      errorToast("Failed to export report")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Export report as CSV
  const exportReportCSV = async (reportId: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      successToast("Report exported as CSV successfully")
      return true
    } catch (error) {
      console.error("Failed to export report as CSV:", error)
      errorToast("Failed to export report")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Schedule report
  const scheduleReport = async (
    reportId: string,
    frequency: "daily" | "weekly" | "monthly",
    recipients: string[],
  ): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update report
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                isScheduled: true,
                scheduleFrequency: frequency,
                recipients,
              }
            : report,
        ),
      )

      // Update selected report if it's the one being scheduled
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                isScheduled: true,
                scheduleFrequency: frequency,
                recipients,
              }
            : null,
        )
      }

      successToast(`Report scheduled to be sent ${frequency}`)
      return true
    } catch (error) {
      console.error("Failed to schedule report:", error)
      errorToast("Failed to schedule report")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Unschedule report
  const unscheduleReport = async (reportId: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update report
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                isScheduled: false,
                scheduleFrequency: undefined,
                recipients: undefined,
              }
            : report,
        ),
      )

      // Update selected report if it's the one being unscheduled
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                isScheduled: false,
                scheduleFrequency: undefined,
                recipients: undefined,
              }
            : null,
        )
      }

      successToast("Report unscheduled successfully")
      return true
    } catch (error) {
      console.error("Failed to unschedule report:", error)
      errorToast("Failed to unschedule report")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    summary,
    charts,
    reports,
    selectedReport,
    timeRange,
    customStartDate,
    customEndDate,
    isLoading,
    isSubmitting,
    getDashboardAnalytics,
    getReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    setTimeRange,
    exportReportPDF,
    exportReportCSV,
    scheduleReport,
    unscheduleReport,
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

// Custom hook to use the context
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
