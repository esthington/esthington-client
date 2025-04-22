"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, BarChart2, LineChartIcon, RefreshCcw } from "lucide-react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
import FadeIn from "@/components/animations/fade-in"
import { useManagement } from "@/contexts/management-context"
import { useManagementPermissions } from "@/hooks/use-management-permissions"

// Define colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
const PROPERTY_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"]

export function ReportsPage() {
  // Use the management context
  const { reportData, timeRange, setTimeRange, refreshReportData, isSubmitting } = useManagement()

  // Use permissions hook (assuming admin role for this component)
  const { hasPermission } = useManagementPermissions("admin")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [chartType, setChartType] = useState("bar")

  const handleExportReport = () => {
    // In a real app, this would call an API to export the report
  }

  const handleRefreshData = async () => {
    await refreshReportData()
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">View platform performance metrics and analytics</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {timeRange === "custom" && (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[130px]"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[130px]"
                  />
                </>
              )}
            </div>

            <Button variant="outline" onClick={handleRefreshData} disabled={isSubmitting}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isSubmitting ? "Refreshing..." : "Refresh"}
            </Button>

            {hasPermission("exportReports") && (
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard hoverEffect="lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CardDescription>All time platform revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.totalRevenue.toLocaleString()}</div>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-500">+12%</span> from last month
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard hoverEffect="lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <CardDescription>Active platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalUsers.toLocaleString()}</div>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-500">+8%</span> from last month
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard hoverEffect="lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <CardDescription>Listed properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalProperties.toLocaleString()}</div>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-500">+5%</span> from last month
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-4">
            <AnimatedCard className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold">Sales & Revenue Overview</h3>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart2 className="h-4 w-4 mr-1" />
                    Bar
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" />
                    Line
                  </Button>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={reportData.salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="properties" name="Property Sales" fill="#8884d8" />
                      <Bar dataKey="investments" name="Investment Sales" fill="#82ca9d" />
                    </BarChart>
                  ) : (
                    <LineChart data={reportData.salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="properties"
                        name="Property Sales"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="investments" name="Investment Sales" stroke="#82ca9d" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <AnimatedCard className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold">User Activity</h3>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.userActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="active" name="Active Users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="new" name="New Users" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <AnimatedCard className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold">Transaction Distribution</h3>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.transactionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.transactionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="properties" className="mt-4">
            <AnimatedCard className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold">Property Type Distribution</h3>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.propertyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PROPERTY_COLORS[index % PROPERTY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}
