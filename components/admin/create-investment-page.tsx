"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Check,
  Building2,
  DollarSign,
  Percent,
  Clock,
  Users,
  FileText,
  Info,
  Save,
  Search,
  Calendar,
  Star,
  Sparkles,
  Loader2,
  Building,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Globe,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvestmentStatus, InvestmentCategory, InvestmentDetailsType, PayoutFrequency, ReturnType, useInvestment } from "@/contexts/investments-context"

// Types
type Property = {
  _id: string
  title: string
  location: string
  price: number
  type: string
  thumbnail: string
  investmentId?: string
}

type InvestmentPlan = {
  name: string
  minAmount: string
  returnRate: string
}

type InvestmentDuration = {
  name: string
  months: string
  bonusRate: string
}

type FormData = {
  propertyId: string;
  title: string;
  description: string;
  returnRate: string;
  investmentPeriod: string;
  minInvestment: string;
  maxInvestors: string;
  featured: boolean;
  trending: boolean;
  documents: File[];
  amenities: string[];
  newAmenity: string;
  investmentPlans: InvestmentPlan[];
  durations: InvestmentDuration[];
  // New fields to match backend schema
  returnType: ReturnType;
  payoutFrequency: PayoutFrequency;
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
  type: InvestmentCategory;
  riskLevel: string;
  targetAmount: string;
  location: string;
};

// Animation components
const FadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      {children}
    </motion.div>
  )
}

const AnimatedCard = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function CreateInvestmentPage() {
  const router = useRouter()
  const { createInvestment, fetchAvailableProperties, availableProperties, isSubmitting } = useInvestment()
  
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const documentFileInputRef = useRef<HTMLInputElement>(null)
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Get current date and calculate default end date (6 months from now)
  const today = new Date()
  const sixMonthsLater = new Date(today)
  sixMonthsLater.setMonth(today.getMonth() + 6)

  const [formData, setFormData] = useState<FormData>({
    propertyId: "",
    title: "",
    description: "",
    returnRate: "",
    investmentPeriod: "6", // Default to 6 months
    minInvestment: "",
    maxInvestors: "",
    featured: false,
    trending: false,
    documents: [],
    amenities: [],
    newAmenity: "",
    investmentPlans: [],
    durations: [],
    // New fields to match backend schema
    returnType: ReturnType.FIXED,
    payoutFrequency: PayoutFrequency.MONTHLY,
    startDate: today.toISOString().split("T")[0],
    endDate: sixMonthsLater.toISOString().split("T")[0],
    status: InvestmentStatus.DRAFT,
    type: InvestmentCategory.REAL_ESTATE,
    riskLevel: "medium",
    targetAmount: "",
    location: "",
  });

  // Fetch available properties on component mount
  useEffect(() => {
    fetchAvailableProperties()
  }, [])

  // Update filtered properties when availableProperties or searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProperties(
        availableProperties.map((property: any) => ({
          ...property,
          thumbnail: property.thumbnail || "/placeholder.svg",
        })),
      )
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = availableProperties
        .filter(
          (property: any) =>
            property.title.toLowerCase().includes(query) ||
            property.location.toLowerCase().includes(query) ||
            property.type.toLowerCase().includes(query),
        )
        .map((property: any) => ({
          ...property,
          thumbnail: property.thumbnail || "/placeholder.svg",
        }))
      setFilteredProperties(filtered)
    }
  }, [searchQuery])

  // Auto-fill title and location when property is selected
  useEffect(() => {
    if (formData.propertyId) {
      const selectedProperty = filteredProperties.find((p) => p._id === formData.propertyId)
      if (selectedProperty) {
        if (!formData.title) {
          setFormData((prev) => ({
            ...prev,
            title: `Investment Opportunity: ${selectedProperty.title}`,
          }))
        }

        // Set location from property
        setFormData((prev) => ({
          ...prev,
          location: selectedProperty.location,
        }))

        // Set target amount based on property price
        if (!formData.targetAmount) {
          setFormData((prev) => ({
            ...prev,
            targetAmount: selectedProperty.price.toString(),
          }))
        }
      }
    }
  }, [formData.propertyId,])

  // Update end date when investment period changes
  useEffect(() => {
    if (formData.investmentPeriod && formData.startDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + Number.parseInt(formData.investmentPeriod))
      setFormData((prev) => ({
        ...prev,
        endDate: endDate.toISOString().split("T")[0],
      }))
    }
  }, [formData.investmentPeriod, formData.startDate])

  // Validate form on data change
  useEffect(() => {
    validateForm()
  }, [formData])

  // Update the useEffect hooks to sync the base values with the first plan and duration

  // Add this useEffect after the existing useEffects to sync base values with first plan
  useEffect(() => {
    // If we have a return rate and minimum investment, but no plans yet, create the first plan
    if (formData.returnRate && formData.minInvestment && formData.investmentPlans.length === 0) {
      setFormData((prev) => ({
        ...prev,
        investmentPlans: [
          {
            name: "Plan 1",
            minAmount: prev.minInvestment,
            returnRate: prev.returnRate,
          },
        ],
      }));
    }
    
    // If we update the base values and have a first plan, update the first plan
    if (formData.returnRate && formData.minInvestment && formData.investmentPlans.length > 0) {
      setFormData((prev) => {
        const updatedPlans = [...prev.investmentPlans];
        // Only update the first plan (Plan 1)
        if (updatedPlans[0]) {
          updatedPlans[0] = {
            ...updatedPlans[0],
            minAmount: prev.minInvestment,
            returnRate: prev.returnRate,
          };
        }
        return { ...prev, investmentPlans: updatedPlans };
      });
    }
  }, [formData.returnRate, formData.minInvestment]);

  // Add this useEffect to sync investment period with first duration
  useEffect(() => {
    // If we have an investment period but no durations yet, create the first duration
    if (formData.investmentPeriod && formData.durations.length === 0) {
      setFormData((prev) => ({
        ...prev,
        durations: [
          {
            name: `${prev.investmentPeriod} Months`,
            months: prev.investmentPeriod,
            bonusRate: "0",
          },
        ],
      }));
    }
    
    // If we update the investment period and have a first duration, update the first duration
    if (formData.investmentPeriod && formData.durations.length > 0) {
      setFormData((prev) => {
        const updatedDurations = [...prev.durations];
        // Only update the first duration
        if (updatedDurations[0]) {
          updatedDurations[0] = {
            ...updatedDurations[0],
            name: `${prev.investmentPeriod} Months`,
            months: prev.investmentPeriod,
          };
        }
        return { ...prev, durations: updatedDurations };
      });
    }
  }, [formData.investmentPeriod]);

  // Update the handleInputChange function to validate against base values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special validation for plan values to ensure they don't go below base values
    if (name === "returnRate" || name === "minInvestment") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update the handlePlanChange function to validate against base values
  const handlePlanChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedPlans = [...prev.investmentPlans];
      
      // For the first plan (index 0), enforce minimum values
      if (index === 0) {
        if (field === "minAmount" && Number(value) < Number(prev.minInvestment)) {
          toast.error("Plan 1 minimum amount cannot be less than the base minimum investment");
          return prev;
        }
        
        if (field === "returnRate" && Number(value) < Number(prev.returnRate)) {
          toast.error("Plan 1 return rate cannot be less than the base return rate");
          return prev;
        }
      }
      
      updatedPlans[index] = { ...updatedPlans[index], [field]: value };
      return { ...prev, investmentPlans: updatedPlans };
    });
  };

  // Update the handleDurationChange function to validate against base duration
  const handleDurationChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedDurations = [...prev.durations];
      
      // For the first duration (index 0), enforce minimum values
      if (index === 0 && field === "months" && Number(value) < Number(prev.investmentPeriod)) {
        toast.error("First duration cannot be less than the base investment period");
        return prev;
      }
      
      updatedDurations[index] = { ...updatedDurations[index], [field]: value };
      return { ...prev, durations: updatedDurations };
    });
  };

  // Update the validateForm function to add additional validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.propertyId) {
      errors.propertyId = "Please select a property";
    }

    if (!formData.title.trim()) {
      errors.title = "Please enter an investment title";
    }

    if (!formData.description.trim()) {
      errors.description = "Please enter an investment description";
    }

    if (!formData.returnRate || isNaN(Number(formData.returnRate)) || Number(formData.returnRate) <= 0) {
      errors.returnRate = "Please enter a valid return rate";
    }

    if (!formData.investmentPeriod || isNaN(Number(formData.investmentPeriod)) || Number(formData.investmentPeriod) <= 0) {
      errors.investmentPeriod = "Please enter a valid investment period";
    }

    if (!formData.minInvestment || isNaN(Number(formData.minInvestment)) || Number(formData.minInvestment) <= 0) {
      errors.minInvestment = "Please enter a valid minimum investment amount";
    }

    if (!formData.targetAmount || isNaN(Number(formData.targetAmount)) || Number(formData.targetAmount) <= 0) {
      errors.targetAmount = "Please enter a valid target amount";
    }

    if (!formData.startDate) {
      errors.startDate = "Please select a start date";
    }

    if (!formData.endDate) {
      errors.endDate = "Please select an end date";
    }

    if (!formData.location) {
      errors.location = "Please enter a location";
    }
    
    // Validate that first plan values match or exceed base values
    if (formData.investmentPlans.length > 0) {
      const firstPlan = formData.investmentPlans[0];
      if (Number(firstPlan.minAmount) < Number(formData.minInvestment)) {
        errors.minInvestment = "Plan 1 minimum amount cannot be less than the base minimum investment";
      }
      
      if (Number(firstPlan.returnRate) < Number(formData.returnRate)) {
        errors.returnRate = "Plan 1 return rate cannot be less than the base return rate";
      }
    }
    
    // Validate that first duration matches or exceeds base period
    if (formData.durations.length > 0) {
      const firstDuration = formData.durations[0];
      if (Number(firstDuration.months) < Number(formData.investmentPeriod)) {
        errors.investmentPeriod = "First duration cannot be less than the base investment period";
      }
    }

    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Find the first error and scroll to that section
      const firstErrorKey = Object.keys(validationErrors)[0]
      if (firstErrorKey === "propertyId") {
        setActiveSection("property")
      } else if (["startDate", "endDate", "returnType", "payoutFrequency"].includes(firstErrorKey)) {
        setActiveSection("terms")
      } else if (firstErrorKey === "targetAmount") {
        setActiveSection("financial")
      } else {
        setActiveSection("details")
      }

      toast.error("Please fix the errors before submitting")
      return
    }

    try {
      // Convert form data to FormData object for API
      const apiFormData = new FormData()

      // Basic information
      apiFormData.append("propertyId", formData.propertyId)
      apiFormData.append("title", formData.title)
      apiFormData.append("description", formData.description)

      // Financial details
      apiFormData.append("minimumInvestment", formData.minInvestment)
      apiFormData.append("targetAmount", formData.targetAmount)
      apiFormData.append("returnRate", formData.returnRate)

      // Investment terms
      apiFormData.append("returnType", formData.returnType)
      apiFormData.append("duration", formData.investmentPeriod)
      apiFormData.append("payoutFrequency", formData.payoutFrequency)
      apiFormData.append("startDate", formData.startDate)
      apiFormData.append("endDate", formData.endDate)

      // Classification
      apiFormData.append("status", formData.status)
      apiFormData.append("type", String(formData.type))
      apiFormData.append("riskLevel", formData.riskLevel)
      apiFormData.append("location", formData.location)

      // Visibility
      apiFormData.append("featured", String(formData.featured))
      apiFormData.append("trending", String(formData.trending))

      if (formData.maxInvestors) {
        apiFormData.append("maxInvestors", formData.maxInvestors)
      }

      // Append investment plans
      apiFormData.append("investmentPlans", JSON.stringify(formData.investmentPlans))

      // Append durations
      apiFormData.append("durations", JSON.stringify(formData.durations))

      // Append amenities
      apiFormData.append("amenities", JSON.stringify(formData.amenities))

      // Append documents
      apiFormData.append("documents", JSON.stringify(formData.documents))

    

      // Call the createInvestment function from context
      const investmentId = await createInvestment(apiFormData)

      if (investmentId) {
        // Redirect after showing success message
        setTimeout(() => {
          router.push("/dashboard/investments")
        }, 2000)
      }
    } catch (error) {
      console.error("Error creating investment:", error)
      toast.error("Failed to create investment")
    }
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const getSelectedProperty = () => {
    return filteredProperties.find((p) => p._id === formData.propertyId)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddDocuments = () => {
    documentFileInputRef.current?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({ ...prev, [field]: [...prev[field as keyof FormData] as File[], ...files] }))
  }

  const removeFile = (index: number, field: string) => {
    setFormData((prev) => {
      const updatedFiles = [...(prev[field as keyof FormData] as File[])]
      updatedFiles.splice(index, 1)
      return { ...prev, [field]: updatedFiles }
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  return (
    <div className="pb-10 max-w-full overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                <div className="mr-3 bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                Create Investment
              </h1>
         
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                className="h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Investment
                  </>
                )}
              </Button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard/admin/investments"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Investments
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="font-medium">
                    Create Investment
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Navigation */}
          <div className="lg:col-span-1">
            <AnimatedCard className="sticky top-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    Investment Creation
                  </CardTitle>
                  <CardDescription>
                    Complete all sections to create your investment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 pt-1 pb-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "property"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : validationErrors.propertyId
                        ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("property")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "property"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : validationErrors.propertyId
                            ? "bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Select Property</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Choose a property for investment
                        </p>
                      </div>
                    </div>
                    {validationErrors.propertyId ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : activeSection === "property" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "details"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : Object.keys(validationErrors).some((key) =>
                            ["title", "description", "location"].includes(key)
                          )
                        ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("details")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "details"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : Object.keys(validationErrors).some((key) =>
                                ["title", "description", "location"].includes(
                                  key
                                )
                              )
                            ? "bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Info className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Basic Details</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Title, description, location
                        </p>
                      </div>
                    </div>
                    {Object.keys(validationErrors).some((key) =>
                      ["title", "description", "location"].includes(key)
                    ) ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : activeSection === "details" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "financial"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : Object.keys(validationErrors).some((key) =>
                            [
                              "returnRate",
                              "minInvestment",
                              "targetAmount",
                            ].includes(key)
                          )
                        ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("financial")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "financial"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : Object.keys(validationErrors).some((key) =>
                                [
                                  "returnRate",
                                  "minInvestment",
                                  "targetAmount",
                                ].includes(key)
                              )
                            ? "bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Financial Details</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Investment amounts and returns
                        </p>
                      </div>
                    </div>
                    {Object.keys(validationErrors).some((key) =>
                      ["returnRate", "minInvestment", "targetAmount"].includes(
                        key
                      )
                    ) ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : activeSection === "financial" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "terms"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : Object.keys(validationErrors).some((key) =>
                            [
                              "investmentPeriod",
                              "startDate",
                              "endDate",
                            ].includes(key)
                          )
                        ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("terms")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "terms"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : Object.keys(validationErrors).some((key) =>
                                [
                                  "investmentPeriod",
                                  "startDate",
                                  "endDate",
                                ].includes(key)
                              )
                            ? "bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Investment Terms</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Duration, dates, and payout details
                        </p>
                      </div>
                    </div>
                    {Object.keys(validationErrors).some((key) =>
                      ["investmentPeriod", "startDate", "endDate"].includes(key)
                    ) ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : activeSection === "terms" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "plans"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("plans")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "plans"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Percent className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Investment Plans</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Define tiers and return rates
                        </p>
                      </div>
                    </div>
                    {activeSection === "plans" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "durations"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("durations")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "durations"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Investment Durations</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Set time periods and bonuses
                        </p>
                      </div>
                    </div>
                    {activeSection === "durations" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "documents"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("documents")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "documents"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Documents & Media</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Upload supporting files
                        </p>
                      </div>
                    </div>
                    {activeSection === "documents" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSection === "visibility"
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    onClick={() => toggleSection("visibility")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activeSection === "visibility"
                            ? "bg-cyan-100 dark:bg-cyan-800/30 text-cyan-600 dark:text-cyan-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Star className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Visibility Options</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Featured and trending settings
                        </p>
                      </div>
                    </div>
                    {activeSection === "visibility" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </CardContent>
                <div className="px-6 pb-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Create Investment
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </AnimatedCard>
          </div>

          {/* Right Column - Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Selection Section */}
            <AnimatePresence>
              {(activeSection === "property" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Select Property
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Choose a property to create an investment
                            opportunity
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search properties by name, location, or type..."
                            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        {validationErrors.propertyId && (
                          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {validationErrors.propertyId}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          {filteredProperties.length > 0 ? (
                            filteredProperties.map((property) => (
                              <div
                                key={property._id}
                                className={`relative overflow-hidden rounded-xl border ${
                                  formData.propertyId === property._id
                                    ? "border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20"
                                    : "border-slate-200 dark:border-slate-700"
                                } cursor-pointer transition-all hover:shadow-md`}
                                onClick={() =>
                                  handleSelectChange("propertyId", property._id)
                                }
                              >
                                <div className="flex h-full">
                                  <div className="w-1/3 relative">
                                    <img
                                      src={
                                        property.thumbnail ||
                                        "/placeholder.svg?height=400&width=600&query=property" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt={property.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="w-2/3 p-4 flex flex-col justify-between">
                                    <div>
                                      <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                        {property.title}
                                      </h3>
                                      <div className="flex items-center mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        <Building className="h-3.5 w-3.5 mr-1" />
                                        <span>{property.type}</span>
                                      </div>
                                      <div className="flex items-center mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        <MapPin className="h-3.5 w-3.5 mr-1" />
                                        <span>{property.location}</span>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Value: ₦
                                        {property.price.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {formData.propertyId === property._id && (
                                  <div className="absolute top-2 right-2">
                                    <Badge className="bg-cyan-500 hover:bg-cyan-600">
                                      <Check className="h-3 w-3 mr-1" />{" "}
                                      Selected
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                              <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                              <p className="text-lg font-medium">
                                No properties found
                              </p>
                              <p className="text-sm mt-1">
                                {availableProperties.length === 0
                                  ? "No properties are available for investment. Please add properties first."
                                  : "Try adjusting your search criteria"}
                              </p>
                            </div>
                          )}
                        </div>

                        {formData.propertyId && (
                          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 flex items-start">
                            <Info className="h-5 w-5 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-cyan-800 dark:text-cyan-300">
                                Property Selected
                              </h4>
                              <p className="text-xs text-cyan-700 dark:text-cyan-400 mt-1">
                                You've selected "{getSelectedProperty()?.title}
                                ". You can now proceed to configure the
                                investment details.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Basic Details Section */}
            <AnimatePresence>
              {(activeSection === "details" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Info className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Basic Details
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Define the basic information for this investment
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Investment Title
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Premium Investment Opportunity"
                            className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                              validationErrors.title
                                ? "border-red-300 dark:border-red-700"
                                : ""
                            }`}
                            required
                          />
                          {validationErrors.title && (
                            <p className="text-sm text-red-500">
                              {validationErrors.title}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the investment opportunity in detail..."
                            className={`min-h-[150px] resize-y rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                              validationErrors.description
                                ? "border-red-300 dark:border-red-700"
                                : ""
                            }`}
                            required
                          />
                          {validationErrors.description && (
                            <p className="text-sm text-red-500">
                              {validationErrors.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="location"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                              Location
                            </div>
                          </Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            // onChange={handleInputChange}
                            placeholder="e.g. Lagos, Nigeria"
                            className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 $`}
                            required
                            readOnly
                          />
                         
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="type"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                              Investment Type
                            </div>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) =>
                              handleSelectChange("type", value)
                            }
                          >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500">
                              <SelectValue placeholder="Select investment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={InvestmentCategory.REAL_ESTATE}
                              >
                                Real Estate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="riskLevel"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                              Risk Level
                            </div>
                          </Label>
                          <Select
                            value={formData.riskLevel}
                            onValueChange={(value) =>
                              handleSelectChange("riskLevel", value)
                            }
                          >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500">
                              <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Risk</SelectItem>
                              <SelectItem value="medium">
                                Medium Risk
                              </SelectItem>
                              <SelectItem value="high">High Risk</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Financial Details Section */}
            <AnimatePresence>
              {(activeSection === "financial" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Financial Details
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Define the financial terms for this investment
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="minInvestment"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Minimum Investment (₦)
                              </div>
                            </Label>
                            <Input
                              id="minInvestment"
                              name="minInvestment"
                              type="number"
                              value={formData.minInvestment}
                              onChange={handleInputChange}
                              placeholder="e.g. 100000"
                              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                                validationErrors.minInvestment
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                              required
                            />
                            {validationErrors.minInvestment && (
                              <p className="text-sm text-red-500">
                                {validationErrors.minInvestment}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="targetAmount"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Target Amount (₦)
                              </div>
                            </Label>
                            <Input
                              id="targetAmount"
                              name="targetAmount"
                              type="number"
                              value={formData.targetAmount}
                              onChange={handleInputChange}
                              placeholder="e.g. 10000000"
                              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                                validationErrors.targetAmount
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                              required
                            />
                            {validationErrors.targetAmount && (
                              <p className="text-sm text-red-500">
                                {validationErrors.targetAmount}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="returnRate"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <Percent className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Base Return Rate (%)
                              </div>
                            </Label>
                            <Input
                              id="returnRate"
                              name="returnRate"
                              type="number"
                              value={formData.returnRate}
                              onChange={handleInputChange}
                              placeholder="e.g. 12"
                              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                                validationErrors.returnRate
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                              required
                            />
                            {validationErrors.returnRate && (
                              <p className="text-sm text-red-500">
                                {validationErrors.returnRate}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="returnType"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <Percent className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Return Type
                              </div>
                            </Label>
                            <Select
                              value={formData.returnType}
                              onValueChange={(value) =>
                                handleSelectChange("returnType", value)
                              }
                            >
                              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500">
                                <SelectValue placeholder="Select return type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ReturnType.FIXED}>
                                  Fixed
                                </SelectItem>
                                <SelectItem value={ReturnType.VARIABLE}>
                                  Variable
                                </SelectItem>
                                <SelectItem value={ReturnType.PROFIT_SHARING}>
                                  Profit Sharing
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="maxInvestors"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                              Maximum Investors (Optional)
                            </div>
                          </Label>
                          <Input
                            id="maxInvestors"
                            name="maxInvestors"
                            type="number"
                            value={formData.maxInvestors}
                            onChange={handleInputChange}
                            placeholder="e.g. 50 (optional)"
                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Investment Terms Section */}
            <AnimatePresence>
              {(activeSection === "terms" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Investment Terms
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Define the duration and payout details for this
                            investment
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="investmentPeriod"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Investment Period (months)
                              </div>
                            </Label>
                            <Input
                              id="investmentPeriod"
                              name="investmentPeriod"
                              type="number"
                              value={formData.investmentPeriod}
                              onChange={handleInputChange}
                              placeholder="e.g. 36"
                              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                                validationErrors.investmentPeriod
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                              required
                            />
                            {validationErrors.investmentPeriod && (
                              <p className="text-sm text-red-500">
                                {validationErrors.investmentPeriod}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="payoutFrequency"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Payout Frequency
                              </div>
                            </Label>
                            <Select
                              value={formData.payoutFrequency}
                              onValueChange={(value) =>
                                handleSelectChange("payoutFrequency", value)
                              }
                            >
                              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500">
                                <SelectValue placeholder="Select payout frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={PayoutFrequency.MONTHLY}>
                                  Monthly
                                </SelectItem>
                                <SelectItem value={PayoutFrequency.QUARTERLY}>
                                  Quarterly
                                </SelectItem>
                                <SelectItem
                                  value={PayoutFrequency.SEMI_ANNUALLY}
                                >
                                  Semi-Annually
                                </SelectItem>
                                <SelectItem value={PayoutFrequency.ANNUALLY}>
                                  Annually
                                </SelectItem>
                                <SelectItem value={PayoutFrequency.END_OF_TERM}>
                                  End of Term
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="startDate"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                Start Date
                              </div>
                            </Label>
                            <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                                validationErrors.startDate
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                              required
                            />
                            {validationErrors.startDate && (
                              <p className="text-sm text-red-500">
                                {validationErrors.startDate}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="endDate"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                                End Date
                              </div>
                            </Label>
                            <Input
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleInputChange}
                              className={`h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500 ${
                                validationErrors.endDate
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                              required
                            />
                            {validationErrors.endDate && (
                              <p className="text-sm text-red-500">
                                {validationErrors.endDate}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="status"
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center">
                              <Info className="h-4 w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                              Investment Status
                            </div>
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) =>
                              handleSelectChange("status", value)
                            }
                          >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-cyan-500">
                              <SelectValue placeholder="Select investment status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={InvestmentStatus.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={InvestmentStatus.PENDING}>
                                Pending
                              </SelectItem>
                              <SelectItem value={InvestmentStatus.ACTIVE}>
                                Active
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Investment Plans Section */}
            <AnimatePresence>
              {(activeSection === "plans" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Percent className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Investment Plans
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Define different investment tiers with varying
                            minimum amounts and return rates
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Create multiple plans to attract different types of
                            investors
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                investmentPlans: [
                                  ...prev.investmentPlans,
                                  {
                                    name: `Plan ${
                                      prev.investmentPlans.length + 1
                                    }`,
                                    minAmount: "0",
                                    returnRate: "0",
                                  },
                                ],
                              }));
                            }}
                            className="h-8 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Plan
                          </Button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {formData.investmentPlans.map((plan, index) => (
                            <Card
                              key={index}
                              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-blue-600"></div>
                              <CardHeader className="py-3 px-4">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base font-medium">
                                    {plan.name}
                                  </CardTitle>
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
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
                              </CardHeader>
                              <CardContent className="py-3 px-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label
                                      htmlFor={`plan-name-${index}`}
                                      className="text-xs"
                                    >
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
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label
                                      htmlFor={`plan-min-${index}`}
                                      className="text-xs"
                                    >
                                      Minimum Amount (₦)
                                    </Label>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
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
                                        className="pl-9 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1.5 col-span-2">
                                    <Label
                                      htmlFor={`plan-rate-${index}`}
                                      className="text-xs"
                                    >
                                      Return Rate (%)
                                    </Label>
                                    <div className="relative">
                                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
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
                                        className="pl-9 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Investment Durations Section */}
            <AnimatePresence>
              {(activeSection === "durations" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Investment Durations
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Define different investment periods with bonus rates
                            for longer commitments
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Offer incentives for longer investment periods
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                durations: [
                                  ...prev.durations,
                                  {
                                    name: `${
                                      prev.durations.length * 6 + 6
                                    } Months`,
                                    months: `${prev.durations.length * 6 + 6}`,
                                    bonusRate: "0",
                                  },
                                ],
                              }));
                            }}
                            className="h-8 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Duration
                          </Button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {formData.durations.map((duration, index) => (
                            <Card
                              key={index}
                              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-cyan-600"></div>
                              <CardHeader className="py-3 px-4">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base font-medium">
                                    {duration.name}
                                  </CardTitle>
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
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
                              </CardHeader>
                              <CardContent className="py-3 px-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <Label
                                      htmlFor={`duration-name-${index}`}
                                      className="text-xs"
                                    >
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
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label
                                      htmlFor={`duration-months-${index}`}
                                      className="text-xs"
                                    >
                                      Months
                                    </Label>
                                    <div className="relative">
                                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
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
                                        className="pl-9 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1.5 col-span-2">
                                    <Label
                                      htmlFor={`duration-bonus-${index}`}
                                      className="text-xs"
                                    >
                                      Bonus Rate (%)
                                    </Label>
                                    <div className="relative">
                                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
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
                                        className="pl-9 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Documents & Media Section */}
            <AnimatePresence>
              {(activeSection === "documents" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Documents & Media
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Upload supporting documents and images for the
                            investment
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddDocuments}
                            className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                          >
                            <Upload className="mr-2 h-4 w-4 text-cyan-500 dark:text-cyan-400" />{" "}
                            Add Documents
                          </Button>
                          <input
                            type="file"
                            ref={documentFileInputRef}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            multiple
                            onChange={(e) => handleFileUpload(e, "documents")}
                          />
                        </div>

                        {formData.documents.length === 0 ? (
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                            <div className="relative mx-auto w-16 h-16 mb-4">
                              <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                              <div className="relative bg-gradient-to-br from-cyan-400/30 to-blue-500/30 p-4 rounded-full flex items-center justify-center">
                                <FileText className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                              Upload investment documents
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                              Certificates, legal documents, brochures, etc.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddDocuments}
                              className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                            >
                              <Upload className="mr-2 h-4 w-4 text-cyan-500 dark:text-cyan-400" />{" "}
                              Upload Files
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {formData.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                              >
                                <div className="flex items-center">
                                  <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg mr-3">
                                    <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {(doc.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index, "documents")}
                                  className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>

            {/* Visibility Options Section */}
            <AnimatePresence>
              {(activeSection === "visibility" || activeSection === null) && (
                <FadeIn>
                  <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-full">
                            <Star className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Visibility Options
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Control how this investment appears in the
                            marketplace
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="featured"
                              className="text-base flex items-center"
                            >
                              <Star className="h-4 w-4 mr-2 text-amber-500" />
                              Featured Investment
                            </Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Highlight this investment on the marketplace
                              homepage
                            </p>
                          </div>
                          <Switch
                            id="featured"
                            checked={formData.featured}
                            onCheckedChange={(checked) =>
                              handleSwitchChange("featured", checked)
                            }
                            className="data-[state=checked]:bg-cyan-600"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="trending"
                              className="text-base flex items-center"
                            >
                              <Sparkles className="h-4 w-4 mr-2 text-cyan-500" />
                              Trending Investment
                            </Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Mark as trending to appear in the trending section
                            </p>
                          </div>
                          <Switch
                            id="trending"
                            checked={formData.trending}
                            onCheckedChange={(checked) =>
                              handleSwitchChange("trending", checked)
                            }
                            className="data-[state=checked]:bg-cyan-600"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </FadeIn>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>

    </div>
  );
}
