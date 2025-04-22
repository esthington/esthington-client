"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FadeIn from "@/components/animations/fade-in";
import { esthingtonCompanies } from "@/lib/company-data";
import { useInvestments } from "@/contexts/investments-context";
import Image from "next/image";

export function CreateInvestmentPage() {
  const router = useRouter();
  const { createInvestment, isSubmitting } = useInvestments();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    type: "",
    returnRate: "",
    investmentPeriod: "",
    minInvestment: "",
    maxInvestors: "",
    featured: false,
    trending: false,
    companyId: "",
    images: [] as File[],
    documents: [] as File[],
    amenities: [] as string[],
    newAmenity: "",
    // New property investment specific fields
    propertyType: "Residential", // Residential, Commercial, Industrial, Mixed Use
    propertyStatus: "Under Construction", // Under Construction, Completed, Off-Plan
    investmentPlans: [
      {
        name: "Basic Plan",
        minAmount: "100000",
        returnRate: "10",
      },
      {
        name: "Premium Plan",
        minAmount: "500000",
        returnRate: "12",
      },
      {
        name: "Elite Plan",
        minAmount: "1000000",
        returnRate: "15",
      },
    ],
    durations: [
      {
        name: "6 Months",
        months: "6",
        bonusRate: "0",
      },
      {
        name: "12 Months",
        months: "12",
        bonusRate: "1",
      },
      {
        name: "24 Months",
        months: "24",
        bonusRate: "2",
      },
    ],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "images" | "documents"
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], ...filesArray],
      }));
    }
  };

  const removeFile = (index: number, type: "images" | "documents") => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const addAmenity = () => {
    if (formData.newAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, formData.newAmenity.trim()],
        newAmenity: "",
      }));
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  // Handle investment plan changes
  const handlePlanChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedPlans = [...prev.investmentPlans];
      updatedPlans[index] = { ...updatedPlans[index], [field]: value };
      return { ...prev, investmentPlans: updatedPlans };
    });
  };

  // Handle duration changes
  const handleDurationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedDurations = [...prev.durations];
      updatedDurations[index] = { ...updatedDurations[index], [field]: value };
      return { ...prev, durations: updatedDurations };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to investment object
    const investmentData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      price: Number.parseFloat(formData.price),
      type: formData.type,
      propertyType: formData.propertyType,
      propertyStatus: formData.propertyStatus,
      returnRate: Number.parseFloat(formData.returnRate),
      investmentPeriod: formData.investmentPeriod,
      minInvestment: Number.parseFloat(formData.minInvestment),
      featured: formData.featured,
      trending: formData.trending,
      companyId: formData.companyId,
      amenities: formData.amenities,
      investmentPlans: formData.investmentPlans.map((plan) => ({
        name: plan.name,
        minAmount: Number(plan.minAmount),
        returnRate: Number(plan.returnRate),
      })),
      durations: formData.durations.map((duration) => ({
        name: duration.name,
        months: Number(duration.months),
        bonusRate: Number(duration.bonusRate),
      })),
      // For demo purposes, we'll use placeholder images
      images:
        formData.images.length > 0
          ? Array(formData.images.length).fill(
              "/placeholder.svg?height=400&width=600"
            )
          : ["/placeholder.svg?height=400&width=600"],
      // For demo purposes, we'll use placeholder documents
      documents:
        formData.documents.length > 0
          ? formData.documents.map((file) => ({
              name: file.name,
              size: Number.parseFloat((file.size / (1024 * 1024)).toFixed(2)),
              url: "#",
            }))
          : [],
    };

    const success = await createInvestment(investmentData);

    if (success) {
      setShowSuccess(true);

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/dashboard/admin/investments");
      }, 2000);
    }
  };

  return (
    <FadeIn>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/admin/investments">
                Investments
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Create Investment</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              Create Property Investment Opportunity
            </h1>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="investment">Investment Details</TabsTrigger>
              <TabsTrigger value="plans">Investment Plans</TabsTrigger>
              <TabsTrigger value="media">Media & Documents</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="details">
                <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                    <CardDescription>
                      Enter the basic details about the property
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Property Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g. Luxury Apartment Complex"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="e.g. Lagos, Nigeria"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the property in detail..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        className="min-h-[150px] bg-[#1F1F23]/50 border-[#342B81]/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Investment Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            handleSelectChange("type", value)
                          }
                          required
                        >
                          <SelectTrigger className="bg-[#1F1F23]/50 border-[#342B81]/50">
                            <SelectValue placeholder="Select investment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Residential">
                              Residential
                            </SelectItem>
                            <SelectItem value="Commercial">
                              Commercial
                            </SelectItem>
                            <SelectItem value="Industrial">
                              Industrial
                            </SelectItem>
                            <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select
                          value={formData.propertyType}
                          onValueChange={(value) =>
                            handleSelectChange("propertyType", value)
                          }
                          required
                        >
                          <SelectTrigger className="bg-[#1F1F23]/50 border-[#342B81]/50">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                            <SelectItem value="Office">Office Space</SelectItem>
                            <SelectItem value="Retail">Retail Space</SelectItem>
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="propertyStatus">Property Status</Label>
                        <Select
                          value={formData.propertyStatus}
                          onValueChange={(value) =>
                            handleSelectChange("propertyStatus", value)
                          }
                          required
                        >
                          <SelectTrigger className="bg-[#1F1F23]/50 border-[#342B81]/50">
                            <SelectValue placeholder="Select property status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Under Construction">
                              Under Construction
                            </SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Off-Plan">Off-Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyId">Company</Label>
                        <Select
                          value={formData.companyId}
                          onValueChange={(value) =>
                            handleSelectChange("companyId", value)
                          }
                          required
                        >
                          <SelectTrigger className="bg-[#1F1F23]/50 border-[#342B81]/50">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            {esthingtonCompanies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                <div className="flex items-center">
                                  <div className="w-5 h-5 mr-2 relative">
                                    <Image
                                      src={company.logo || "/placeholder.svg"}
                                      alt={company.name}
                                      width={20}
                                      height={20}
                                      className="object-contain"
                                    />
                                  </div>
                                  {company.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Total Property Value (₦)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          placeholder="e.g. 50000000"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investment">
                <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle>Investment Details</CardTitle>
                    <CardDescription>
                      Configure how investors can participate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="returnRate">Base Return Rate (%)</Label>
                        <Input
                          id="returnRate"
                          name="returnRate"
                          type="number"
                          placeholder="e.g. 12"
                          value={formData.returnRate}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="investmentPeriod">
                          Default Investment Period (months)
                        </Label>
                        <Input
                          id="investmentPeriod"
                          name="investmentPeriod"
                          type="number"
                          placeholder="e.g. 36"
                          value={formData.investmentPeriod}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minInvestment">
                          Minimum Investment (₦)
                        </Label>
                        <Input
                          id="minInvestment"
                          name="minInvestment"
                          type="number"
                          placeholder="e.g. 100000"
                          value={formData.minInvestment}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxInvestors">Maximum Investors</Label>
                        <Input
                          id="maxInvestors"
                          name="maxInvestors"
                          type="number"
                          placeholder="e.g. 50"
                          value={formData.maxInvestors}
                          onChange={handleInputChange}
                          required
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("featured", checked)
                          }
                        />
                        <Label htmlFor="featured">
                          Feature this investment (highlighted in marketplace)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="trending"
                          checked={formData.trending}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("trending", checked)
                          }
                        />
                        <Label htmlFor="trending">
                          Mark as trending (appears in trending section)
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plans">
                <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle>Investment Plans & Durations</CardTitle>
                    <CardDescription>
                      Configure investment plans and durations for this property
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Investment Plans</h3>
                      <p className="text-sm text-gray-400">
                        Define different investment tiers with varying minimum
                        amounts and return rates
                      </p>

                      {formData.investmentPlans.map((plan, index) => (
                        <div
                          key={index}
                          className="p-4 border border-[#342B81]/30 rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Plan {index + 1}</h4>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 p-1 h-auto"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    investmentPlans:
                                      prev.investmentPlans.filter(
                                        (_, i) => i !== index
                                      ),
                                  }));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`plan-name-${index}`}>
                                Plan Name
                              </Label>
                              <Input
                                id={`plan-name-${index}`}
                                value={plan.name}
                                onChange={(e) =>
                                  handlePlanChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="bg-[#1F1F23]/50 border-[#342B81]/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`plan-min-${index}`}>
                                Minimum Amount (₦)
                              </Label>
                              <Input
                                id={`plan-min-${index}`}
                                type="number"
                                value={plan.minAmount}
                                onChange={(e) =>
                                  handlePlanChange(
                                    index,
                                    "minAmount",
                                    e.target.value
                                  )
                                }
                                className="bg-[#1F1F23]/50 border-[#342B81]/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`plan-rate-${index}`}>
                                Return Rate (%)
                              </Label>
                              <Input
                                id={`plan-rate-${index}`}
                                type="number"
                                value={plan.returnRate}
                                onChange={(e) =>
                                  handlePlanChange(
                                    index,
                                    "returnRate",
                                    e.target.value
                                  )
                                }
                                className="bg-[#1F1F23]/50 border-[#342B81]/50"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            investmentPlans: [
                              ...prev.investmentPlans,
                              {
                                name: `Plan ${prev.investmentPlans.length + 1}`,
                                minAmount: "0",
                                returnRate: "0",
                              },
                            ],
                          }));
                        }}
                        className="mt-2 bg-[#342B81]/20 border-[#342B81]/50 hover:bg-[#342B81]/30"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Investment Plan
                      </Button>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-[#1F1F23]">
                      <h3 className="text-lg font-medium">
                        Investment Durations
                      </h3>
                      <p className="text-sm text-gray-400">
                        Define different investment periods with bonus rates for
                        longer commitments
                      </p>

                      {formData.durations.map((duration, index) => (
                        <div
                          key={index}
                          className="p-4 border border-[#342B81]/30 rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">
                              Duration {index + 1}
                            </h4>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 p-1 h-auto"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    durations: prev.durations.filter(
                                      (_, i) => i !== index
                                    ),
                                  }));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`duration-name-${index}`}>
                                Duration Name
                              </Label>
                              <Input
                                id={`duration-name-${index}`}
                                value={duration.name}
                                onChange={(e) =>
                                  handleDurationChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="bg-[#1F1F23]/50 border-[#342B81]/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`duration-months-${index}`}>
                                Months
                              </Label>
                              <Input
                                id={`duration-months-${index}`}
                                type="number"
                                value={duration.months}
                                onChange={(e) =>
                                  handleDurationChange(
                                    index,
                                    "months",
                                    e.target.value
                                  )
                                }
                                className="bg-[#1F1F23]/50 border-[#342B81]/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`duration-bonus-${index}`}>
                                Bonus Rate (%)
                              </Label>
                              <Input
                                id={`duration-bonus-${index}`}
                                type="number"
                                value={duration.bonusRate}
                                onChange={(e) =>
                                  handleDurationChange(
                                    index,
                                    "bonusRate",
                                    e.target.value
                                  )
                                }
                                className="bg-[#1F1F23]/50 border-[#342B81]/50"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            durations: [
                              ...prev.durations,
                              {
                                name: `${prev.durations.length * 6 + 6} Months`,
                                months: `${prev.durations.length * 6 + 6}`,
                                bonusRate: "0",
                              },
                            ],
                          }));
                        }}
                        className="mt-2 bg-[#342B81]/20 border-[#342B81]/50 hover:bg-[#342B81]/30"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Duration Option
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media">
                <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle>Media & Documents</CardTitle>
                    <CardDescription>
                      Upload images and documents for the investment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Property Images</h3>
                      <div className="border-2 border-dashed border-[#342B81]/50 rounded-lg p-6 text-center">
                        <Upload className="h-10 w-10 mx-auto mb-4 text-[#342B81]" />
                        <h3 className="text-lg font-medium mb-2">
                          Drag and drop images here
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          or click to browse files
                        </p>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "images")}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("images")?.click()
                          }
                          className="bg-[#342B81]/20 border-[#342B81]/50 hover:bg-[#342B81]/30"
                        >
                          Select Images
                        </Button>
                      </div>

                      {formData.images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Selected Images ({formData.images.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-md overflow-hidden bg-[#1F1F23]">
                                  <img
                                    src={
                                      URL.createObjectURL(file) ||
                                      "/placeholder.svg"
                                    }
                                    alt={`Property image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index, "images")}
                                  className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Property Documents
                      </h3>
                      <div className="border-2 border-dashed border-[#342B81]/50 rounded-lg p-6 text-center">
                        <Upload className="h-10 w-10 mx-auto mb-4 text-[#342B81]" />
                        <h3 className="text-lg font-medium mb-2">
                          Drag and drop documents here
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          PDF, DOC, DOCX files (Max 10MB each)
                        </p>
                        <Input
                          id="documents"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "documents")}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("documents")?.click()
                          }
                          className="bg-[#342B81]/20 border-[#342B81]/50 hover:bg-[#342B81]/30"
                        >
                          Select Documents
                        </Button>
                      </div>

                      {formData.documents.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Selected Documents ({formData.documents.length})
                          </h4>
                          <div className="space-y-2">
                            {formData.documents.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-[#1F1F23]/50 rounded-md"
                              >
                                <div className="flex items-center">
                                  <div className="p-2 bg-[#342B81]/20 rounded-md mr-3">
                                    <svg
                                      className="h-5 w-5 text-[#342B81]"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-[200px]">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index, "documents")}
                                  className="text-red-500 hover:text-red-600 p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities">
                <Card className="bg-[#0F0F12]/80 backdrop-blur-md border-[#1F1F23]">
                  <CardHeader>
                    <CardTitle>Property Amenities</CardTitle>
                    <CardDescription>
                      Add amenities and features of the property
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow space-y-2">
                        <Label htmlFor="newAmenity">Add Amenity</Label>
                        <Input
                          id="newAmenity"
                          name="newAmenity"
                          placeholder="e.g. Swimming Pool"
                          value={formData.newAmenity}
                          onChange={handleInputChange}
                          className="bg-[#1F1F23]/50 border-[#342B81]/50"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addAmenity}
                        className="bg-[#342B81] hover:bg-[#342B81]/90"
                        disabled={!formData.newAmenity.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {formData.amenities.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Added Amenities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-[#342B81]/20 text-white px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">{amenity}</span>
                              <button
                                type="button"
                                onClick={() => removeAmenity(index)}
                                className="ml-2 text-gray-400 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400">
                        <p>
                          No amenities added yet. Add some amenities to
                          highlight property features.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-[#1F1F23]/50 rounded-md">
                      <h4 className="text-sm font-medium mb-2">
                        Common Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Electricity",
                          "Water",
                          "Security",
                          "Parking",
                          "Swimming Pool",
                          "Gym",
                          "Playground",
                          "Garden",
                          "CCTV",
                          "Elevator",
                          "24/7 Security",
                          "Backup Generator",
                          "Air Conditioning",
                          "Furnished",
                          "Gated Community",
                          "Rooftop Terrace",
                          "Smart Home Features",
                          "Fiber Internet",
                        ].map((amenity) => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => {
                              if (!formData.amenities.includes(amenity)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  amenities: [...prev.amenities, amenity],
                                }));
                              }
                            }}
                            disabled={formData.amenities.includes(amenity)}
                            className={`text-sm px-3 py-1 rounded-full ${
                              formData.amenities.includes(amenity)
                                ? "bg-[#342B81]/50 text-white cursor-not-allowed"
                                : "bg-[#1F1F23] text-gray-300 hover:bg-[#342B81]/30"
                            }`}
                          >
                            {amenity}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-2"
                  onClick={() => router.push("/dashboard/admin/investments")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#342B81] hover:bg-[#342B81]/80"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Investment"
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </motion.div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500/90 text-white p-4 rounded-md shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <p>Investment created successfully! Redirecting...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeIn>
  );
}
