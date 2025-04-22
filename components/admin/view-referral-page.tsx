"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Clock, DollarSign, Edit, Mail, Phone, Trash, Users, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationToast } from "@/components/ui/notification-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PageTransition from "@/components/animations/page-transition"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"
import { cn } from "@/lib/utils"

interface ViewReferralPageProps {
  id: string
}

export function ViewReferralPage({ id }: ViewReferralPageProps) {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mock referral data - in a real app, this would be fetched from an API
  const referral = {
    id,
    referrerName: "John Doe",
    referrerEmail: "john.doe@example.com",
    referrerPhone: "+1 (555) 123-4567",
    referrerAvatar: "/placeholder.svg?height=40&width=40",
    refereeCount: 5,
    referees: [
      {
        id: "1",
        name: "Alice Smith",
        email: "alice@example.com",
        status: "active",
        date: "2023-10-15",
        commission: 250,
      },
      { id: "2", name: "Bob Johnson", email: "bob@example.com", status: "pending", date: "2023-10-18", commission: 0 },
      {
        id: "3",
        name: "Carol Williams",
        email: "carol@example.com",
        status: "active",
        date: "2023-10-20",
        commission: 250,
      },
      {
        id: "4",
        name: "Dave Brown",
        email: "dave@example.com",
        status: "inactive",
        date: "2023-10-22",
        commission: 100,
      },
      { id: "5", name: "Eve Davis", email: "eve@example.com", status: "active", date: "2023-10-25", commission: 250 },
    ],
    totalCommission: 850,
    pendingCommission: 150,
    paidCommission: 700,
    status: "active",
    createdAt: "2023-10-10",
    lastActive: "2023-10-28",
  }

  const handleStatusChange = (newStatus: string) => {
    // In a real app, this would update the status via an API call
    setToastMessage(`Referral status updated to ${newStatus}`)
    setToastType("success")
    setShowToast(true)
  }

  const handleDeleteReferral = () => {
    // In a real app, this would delete the referral via an API call
    setShowDeleteDialog(false)
    setToastMessage("Referral deleted successfully")
    setToastType("success")
    setShowToast(true)

    // Navigate back to referrals list after a short delay
    setTimeout(() => {
      router.push("/dashboard/admin/referrals")
    }, 1500)
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <StaggerChildren>
          <StaggerItem>
            <div className="flex items-center justify-between mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard/admin/referrals">Referrals</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Referral Details</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/admin/referrals/edit/${id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Referral</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this referral? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteReferral}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Referrer Information</CardTitle>
                    <CardDescription>Details about the referrer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-6">
                      <Avatar className="h-16 w-16 mr-4">
                        <AvatarImage src={referral.referrerAvatar} alt={referral.referrerName} />
                        <AvatarFallback>{referral.referrerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{referral.referrerName}</h3>
                        <Badge
                          className={cn(
                            "mt-1",
                            referral.status === "active"
                              ? "bg-green-100 text-green-800"
                              : referral.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800",
                          )}
                        >
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{referral.referrerEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{referral.referrerPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{referral.refereeCount} Referees</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Joined: {new Date(referral.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Last Active: {new Date(referral.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start">
                    <h4 className="font-medium mb-2">Change Status</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={referral.status === "active" ? "default" : "outline"}
                        onClick={() => handleStatusChange("active")}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Active
                      </Button>
                      <Button
                        size="sm"
                        variant={referral.status === "pending" ? "default" : "outline"}
                        onClick={() => handleStatusChange("pending")}
                      >
                        <Clock className="mr-1 h-4 w-4" />
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={referral.status === "inactive" ? "default" : "outline"}
                        onClick={() => handleStatusChange("inactive")}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Inactive
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Details</CardTitle>
                    <CardDescription>Manage referral information and commissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="referees">
                      <TabsList className="mb-4">
                        <TabsTrigger value="referees">Referees</TabsTrigger>
                        <TabsTrigger value="commissions">Commissions</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                      </TabsList>

                      <TabsContent value="referees">
                        <div className="rounded-md border">
                          <div className="grid grid-cols-6 p-4 font-medium border-b">
                            <div className="col-span-2">Name</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1">Date</div>
                            <div className="col-span-1">Commission</div>
                            <div className="col-span-1">Actions</div>
                          </div>

                          {referral.referees.map((referee) => (
                            <div key={referee.id} className="grid grid-cols-6 p-4 border-b last:border-0">
                              <div className="col-span-2 flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback>{referee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{referee.name}</div>
                                  <div className="text-sm text-muted-foreground">{referee.email}</div>
                                </div>
                              </div>
                              <div className="col-span-1 flex items-center">
                                <Badge
                                  className={cn(
                                    referee.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : referee.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800",
                                  )}
                                >
                                  {referee.status.charAt(0).toUpperCase() + referee.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="col-span-1 flex items-center">
                                {new Date(referee.date).toLocaleDateString()}
                              </div>
                              <div className="col-span-1 flex items-center">${referee.commission}</div>
                              <div className="col-span-1 flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="commissions">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                                  <h3 className="text-2xl font-bold">${referral.totalCommission}</h3>
                                </div>
                                <DollarSign className="h-8 w-8 text-primary opacity-80" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                  <h3 className="text-2xl font-bold">${referral.pendingCommission}</h3>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Paid</p>
                                  <h3 className="text-2xl font-bold">${referral.paidCommission}</h3>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Commission History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">October 2023 Payout</h4>
                                  <p className="text-sm text-muted-foreground">3 successful referrals</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">$450</p>
                                  <p className="text-sm text-muted-foreground">Oct 31, 2023</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">September 2023 Payout</h4>
                                  <p className="text-sm text-muted-foreground">2 successful referrals</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">$250</p>
                                  <p className="text-sm text-muted-foreground">Sep 30, 2023</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">Pending Payout</h4>
                                  <p className="text-sm text-muted-foreground">1 pending referral</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">$150</p>
                                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="activity">
                        <div className="space-y-4">
                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 28, 2023</p>
                            <p className="font-medium">Referred Eve Davis</p>
                            <p className="text-sm">New referral registered using referral code</p>
                          </div>

                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 25, 2023</p>
                            <p className="font-medium">Commission Earned</p>
                            <p className="text-sm">$250 commission for Carol Williams' investment</p>
                          </div>

                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 22, 2023</p>
                            <p className="font-medium">Referred Dave Brown</p>
                            <p className="text-sm">New referral registered using referral link</p>
                          </div>

                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 20, 2023</p>
                            <p className="font-medium">Referred Carol Williams</p>
                            <p className="text-sm">New referral registered using referral code</p>
                          </div>

                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 18, 2023</p>
                            <p className="font-medium">Referred Bob Johnson</p>
                            <p className="text-sm">New referral registered using referral link</p>
                          </div>

                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 15, 2023</p>
                            <p className="font-medium">Referred Alice Smith</p>
                            <p className="text-sm">New referral registered using referral code</p>
                          </div>

                          <div className="border-l-2 border-primary pl-4 py-2">
                            <p className="text-sm text-muted-foreground">October 10, 2023</p>
                            <p className="font-medium">Referral Program Joined</p>
                            <p className="text-sm">John Doe joined the referral program</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>

      {showToast && <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </PageTransition>
  )
}
