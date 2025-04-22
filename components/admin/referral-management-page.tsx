"use client"

import { useState } from "react"
import {
  Users,
  Settings,
  DollarSign,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Award,
  MoreHorizontal,
} from "lucide-react"
import { format } from "date-fns"
import PageTransition from "@/components/animations/page-transition"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Add the following import
import Link from "next/link"

// Mock data for referrals
const mockReferrals = [
  {
    id: "REF-001",
    referrer: {
      id: "USR-123",
      name: "John Smith",
      email: "john@example.com",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    referee: {
      id: "USR-456",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    date: new Date("2023-11-15"),
    status: "completed",
    commission: 250,
    commissionPaid: true,
    type: "signup",
  },
  {
    id: "REF-002",
    referrer: {
      id: "USR-789",
      name: "Michael Brown",
      email: "michael@example.com",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWFufGVufDB8fDB8fHww",
    },
    referee: {
      id: "USR-101",
      name: "Emily Davis",
      email: "emily@example.com",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    date: new Date("2023-11-20"),
    status: "pending",
    commission: 500,
    commissionPaid: false,
    type: "investment",
  },
  {
    id: "REF-003",
    referrer: {
      id: "USR-202",
      name: "David Wilson",
      email: "david@example.com",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    referee: {
      id: "USR-303",
      name: "Jessica Taylor",
      email: "jessica@example.com",
      avatar:
        "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHdvbWFufGVufDB8fDB8fHww",
    },
    date: new Date("2023-11-25"),
    status: "completed",
    commission: 750,
    commissionPaid: true,
    type: "purchase",
  },
  {
    id: "REF-004",
    referrer: {
      id: "USR-404",
      name: "Robert Martinez",
      email: "robert@example.com",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    referee: {
      id: "USR-505",
      name: "Amanda Clark",
      email: "amanda@example.com",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdvbWFufGVufDB8fDB8fHww",
    },
    date: new Date("2023-11-30"),
    status: "rejected",
    commission: 0,
    commissionPaid: false,
    type: "signup",
  },
  {
    id: "REF-005",
    referrer: {
      id: "USR-606",
      name: "Thomas Anderson",
      email: "thomas@example.com",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    referee: {
      id: "USR-707",
      name: "Jennifer White",
      email: "jennifer@example.com",
      avatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHdvbWFufGVufDB8fDB8fHww",
    },
    date: new Date("2023-12-05"),
    status: "pending",
    commission: 1000,
    commissionPaid: false,
    type: "investment",
  },
]

// Mock data for referral statistics
const referralStats = {
  totalReferrals: 127,
  activeReferrers: 42,
  pendingCommissions: 15,
  totalCommissionsPaid: 25000,
  conversionRate: 68,
  topReferrers: [
    { name: "John Smith", count: 15, commission: 3750 },
    { name: "Michael Brown", count: 12, commission: 3000 },
    { name: "David Wilson", count: 10, commission: 2500 },
  ],
  monthlyReferrals: [
    { month: "Jan", count: 8 },
    { month: "Feb", count: 10 },
    { month: "Mar", count: 12 },
    { month: "Apr", count: 15 },
    { month: "May", count: 18 },
    { month: "Jun", count: 14 },
    { month: "Jul", count: 16 },
    { month: "Aug", count: 20 },
    { month: "Sep", count: 22 },
    { month: "Oct", count: 25 },
    { month: "Nov", count: 28 },
    { month: "Dec", count: 24 },
  ],
}

// Mock data for referral settings
const referralSettings = {
  signupCommission: 250,
  investmentCommissionPercentage: 5,
  purchaseCommissionPercentage: 2.5,
  minimumPayoutAmount: 1000,
  payoutFrequency: "monthly",
  referralLinkExpiry: 30, // days
  multiTierReferral: false,
  autoApproval: true,
}

export function ReferralManagementPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showCommissionDialog, setShowCommissionDialog] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<any>(null)
  const [currentSettings, setCurrentSettings] = useState(referralSettings)
  const isMobile = false

  // Filter referrals based on search query, status, and type
  const filteredReferrals = mockReferrals.filter((referral) => {
    const matchesSearch =
      searchQuery === "" ||
      referral.referrer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || referral.status === statusFilter
    const matchesType = typeFilter === "all" || referral.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Handle approving a commission
  const handleApproveCommission = () => {
    // In a real app, this would make an API call to approve the commission
    console.log(`Approving commission for referral ${selectedReferral?.id}`)
    setShowCommissionDialog(false)
  }

  // Handle rejecting a commission
  const handleRejectCommission = () => {
    // In a real app, this would make an API call to reject the commission
    console.log(`Rejecting commission for referral ${selectedReferral?.id}`)
    setShowCommissionDialog(false)
  }

  // Handle saving settings
  const handleSaveSettings = () => {
    // In a real app, this would make an API call to update the settings
    console.log("Saving settings:", currentSettings)
    setShowSettingsDialog(false)
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Render commission status badge
  const renderCommissionBadge = (paid: boolean) => {
    return paid ? (
      <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
    ) : (
      <Badge variant="outline">Unpaid</Badge>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Referral Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold tracking-tight">Referral Management</h1>
            <p className="text-muted-foreground">Manage referrals, commissions, and program settings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Program Settings
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <StaggerChildren>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{referralStats.activeReferrers}</div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{referralStats.pendingCommissions}</div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Commissions Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">${referralStats.totalCommissionsPaid.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </StaggerChildren>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="all">All Referrals</TabsTrigger>
            <TabsTrigger value="pending">Pending Commissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search referrals..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="signup">Signup</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Referrals</CardTitle>
                <CardDescription>View and manage all referrals in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No referrals found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={referral.referrer.avatar || "/placeholder.svg"}
                                alt={referral.referrer.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium">{referral.referrer.name}</div>
                                <div className="text-xs text-muted-foreground">{referral.referrer.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={referral.referee.avatar || "/placeholder.svg"}
                                alt={referral.referee.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium">{referral.referee.name}</div>
                                <div className="text-xs text-muted-foreground">{referral.referee.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{format(referral.date, "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {referral.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{renderStatusBadge(referral.status)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>${referral.commission.toLocaleString()}</span>
                              <span>{renderCommissionBadge(referral.commissionPaid)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Link
                                      href={`/dashboard/admin/referrals/${referral.id}`}
                                      className="flex items-center"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setSelectedReferral(referral)}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Process Commission
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredReferrals.length} of {mockReferrals.length} referrals
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Commissions</CardTitle>
                <CardDescription>Review and process pending commission payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReferrals
                      .filter((r) => r.status === "pending" && !r.commissionPaid)
                      .map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={referral.referrer.avatar || "/placeholder.svg"}
                                alt={referral.referrer.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium">{referral.referrer.name}</div>
                                <div className="text-xs text-muted-foreground">{referral.referrer.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={referral.referee.avatar || "/placeholder.svg"}
                                alt={referral.referee.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium">{referral.referee.name}</div>
                                <div className="text-xs text-muted-foreground">{referral.referee.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{format(referral.date, "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {referral.type}
                            </Badge>
                          </TableCell>
                          <TableCell>${referral.commission.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => {
                                  setSelectedReferral(referral)
                                  setShowCommissionDialog(true)
                                }}
                              >
                                Process
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {mockReferrals.filter((r) => r.status === "pending" && !r.commissionPaid).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No pending commissions to process
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Referral Performance</CardTitle>
                  <CardDescription>Key metrics for your referral program</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <div className="flex items-center">
                        <span className="text-lg font-bold">{referralStats.conversionRate}%</span>
                        <span className="text-xs text-green-500 ml-1">+2.5%</span>
                      </div>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${referralStats.conversionRate}%` }}
                      ></div>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">Monthly Referrals</h4>
                      <div className="flex items-end h-40 gap-1">
                        {referralStats.monthlyReferrals.map((month) => (
                          <div key={month.month} className="flex flex-col items-center">
                            <div
                              className="bg-primary/80 w-8 rounded-t-sm"
                              style={{ height: `${(month.count / 30) * 100}%` }}
                            ></div>
                            <span className="text-xs mt-1">{month.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription>Users who have made the most successful referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralStats.topReferrers.map((referrer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{referrer.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{referrer.count} referrals</div>
                          <div className="text-sm text-muted-foreground">
                            ${referrer.commission.toLocaleString()} earned
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full mt-4">
                      View All Referrers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Commission Processing Dialog */}
      <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Process Commission</DialogTitle>
            <DialogDescription>Review and process the commission for this referral.</DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Referral ID</Label>
                  <div className="font-medium">{selectedReferral.id}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <div className="font-medium">{format(selectedReferral.date, "MMM d, yyyy")}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referrer</Label>
                  <div className="font-medium">{selectedReferral.referrer.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referee</Label>
                  <div className="font-medium">{selectedReferral.referee.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="font-medium capitalize">{selectedReferral.type}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Commission Amount</Label>
                  <div className="font-medium">${selectedReferral.commission.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input id="notes" placeholder="Add notes about this commission" />
              </div>
            </div>
          )}
          <DialogFooter className="flex sm:justify-between">
            <Button variant="destructive" onClick={handleRejectCommission}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApproveCommission}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      {isMobile ? (
        <Drawer open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DrawerTrigger asChild>
            <Button>Open</Button>
          </DrawerTrigger>
          <DrawerContent className="">
            <DrawerHeader>
              <DrawerTitle>Referral Program Settings</DrawerTitle>
              <DrawerDescription>Configure your referral program settings and commission structure.</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="signupCommission">Signup Commission ($)</Label>
                  <Input
                    id="signupCommission"
                    type="number"
                    value={currentSettings.signupCommission}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        signupCommission: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Fixed amount paid for each successful signup referral</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentCommission">Investment Commission (%)</Label>
                  <Input
                    id="investmentCommission"
                    type="number"
                    value={currentSettings.investmentCommissionPercentage}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        investmentCommissionPercentage: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Percentage of investment amount paid as commission</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseCommission">Purchase Commission (%)</Label>
                  <Input
                    id="purchaseCommission"
                    type="number"
                    value={currentSettings.purchaseCommissionPercentage}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        purchaseCommissionPercentage: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Percentage of purchase amount paid as commission</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout Amount ($)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    value={currentSettings.minimumPayoutAmount}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        minimumPayoutAmount: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Minimum amount required before commission is paid out</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                  <Select
                    value={currentSettings.payoutFrequency}
                    onValueChange={(value) =>
                      setCurrentSettings({
                        ...currentSettings,
                        payoutFrequency: value,
                      })
                    }
                  >
                    <SelectTrigger id="payoutFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkExpiry">Referral Link Expiry (Days)</Label>
                  <Input
                    id="linkExpiry"
                    type="number"
                    value={currentSettings.referralLinkExpiry}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        referralLinkExpiry: Number.parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days before a referral link expires (0 for never)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoApproval"
                    checked={currentSettings.autoApproval}
                    onCheckedChange={(checked) =>
                      setCurrentSettings({
                        ...currentSettings,
                        autoApproval: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="autoApproval">Auto-approve commissions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiTier"
                    checked={currentSettings.multiTierReferral}
                    onCheckedChange={(checked) =>
                      setCurrentSettings({
                        ...currentSettings,
                        multiTierReferral: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="multiTier">Enable multi-tier referrals</Label>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Referral Program Settings</DialogTitle>
              <DialogDescription>Configure your referral program settings and commission structure.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="signupCommission">Signup Commission ($)</Label>
                  <Input
                    id="signupCommission"
                    type="number"
                    value={currentSettings.signupCommission}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        signupCommission: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Fixed amount paid for each successful signup referral</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentCommission">Investment Commission (%)</Label>
                  <Input
                    id="investmentCommission"
                    type="number"
                    value={currentSettings.investmentCommissionPercentage}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        investmentCommissionPercentage: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Percentage of investment amount paid as commission</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseCommission">Purchase Commission (%)</Label>
                  <Input
                    id="purchaseCommission"
                    type="number"
                    value={currentSettings.purchaseCommissionPercentage}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        purchaseCommissionPercentage: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Percentage of purchase amount paid as commission</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout Amount ($)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    value={currentSettings.minimumPayoutAmount}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        minimumPayoutAmount: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Minimum amount required before commission is paid out</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                  <Select
                    value={currentSettings.payoutFrequency}
                    onValueChange={(value) =>
                      setCurrentSettings({
                        ...currentSettings,
                        payoutFrequency: value,
                      })
                    }
                  >
                    <SelectTrigger id="payoutFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkExpiry">Referral Link Expiry (Days)</Label>
                  <Input
                    id="linkExpiry"
                    type="number"
                    value={currentSettings.referralLinkExpiry}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        referralLinkExpiry: Number.parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days before a referral link expires (0 for never)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoApproval"
                    checked={currentSettings.autoApproval}
                    onCheckedChange={(checked) =>
                      setCurrentSettings({
                        ...currentSettings,
                        autoApproval: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="autoApproval">Auto-approve commissions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiTier"
                    checked={currentSettings.multiTierReferral}
                    onCheckedChange={(checked) =>
                      setCurrentSettings({
                        ...currentSettings,
                        multiTierReferral: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="multiTier">Enable multi-tier referrals</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageTransition>
  )
}
