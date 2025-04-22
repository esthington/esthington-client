"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { NotificationToast } from "@/components/ui/notification-toast"
import { Switch } from "@/components/ui/switch"
import PageTransition from "@/components/animations/page-transition"
import StaggerChildren from "@/components/animations/stagger-children"
import StaggerItem from "@/components/animations/stagger-item"

interface EditReferralPageProps {
  id: string
}

export function EditReferralPage({ id }: EditReferralPageProps) {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info")

  // Mock referral data - in a real app, this would be fetched from an API
  const [formData, setFormData] = useState({
    referrerName: "John Doe",
    referrerEmail: "john.doe@example.com",
    referrerPhone: "+1 (555) 123-4567",
    status: "active",
    commissionRate: "10",
    maxReferrals: "10",
    notes: "VIP referrer with high conversion rate.",
    allowPayout: true,
    emailNotifications: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would update the referral via an API call
    setToastMessage("Referral updated successfully")
    setToastType("success")
    setShowToast(true)

    // Navigate back to referral details after a short delay
    setTimeout(() => {
      router.push(`/dashboard/admin/referrals/${id}`)
    }, 1500)
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
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
                    <BreadcrumbLink href={`/dashboard/admin/referrals/${id}`}>Referral Details</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Edit Referral</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Edit Referral</CardTitle>
                  <CardDescription>Update referral information and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="referrerName">Referrer Name</Label>
                      <Input
                        id="referrerName"
                        name="referrerName"
                        value={formData.referrerName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referrerEmail">Email</Label>
                      <Input
                        id="referrerEmail"
                        name="referrerEmail"
                        type="email"
                        value={formData.referrerEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referrerPhone">Phone</Label>
                      <Input
                        id="referrerPhone"
                        name="referrerPhone"
                        value={formData.referrerPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                      <Input
                        id="commissionRate"
                        name="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.commissionRate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxReferrals">Maximum Referrals</Label>
                      <Input
                        id="maxReferrals"
                        name="maxReferrals"
                        type="number"
                        min="0"
                        value={formData.maxReferrals}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleInputChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowPayout">Allow Payout</Label>
                        <p className="text-sm text-muted-foreground">Enable commission payouts for this referrer</p>
                      </div>
                      <Switch
                        id="allowPayout"
                        checked={formData.allowPayout}
                        onCheckedChange={(checked) => handleSwitchChange("allowPayout", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send email notifications for new referrals</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </StaggerItem>
        </StaggerChildren>
      </div>

      {showToast && <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </PageTransition>
  )
}
