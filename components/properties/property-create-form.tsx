/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  Save,
  Building,
  MapPin,
  DollarSign,
  SquareStack,
  Tag,
  Star,
  ImageIcon,
  FileText,
  Grid3X3,
  Check,
  Info,
  LayoutGrid,
  Sparkles,
  Home,
  Building2,
  Store,
  Loader2,
  X,
  ImageIcon as ImageIcon2,
  FileImage,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FadeIn from "@/components/animations/fade-in";
import { useProperty } from "@/contexts/property-context";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoditEditor from "jodit-react";

export default function PropertyCreateForm() {
  const editor = useRef(null);
  const router = useRouter();
  const { createProperty, isLoading, getCompanies } = useProperty();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const planFileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    plotSize: "",
    totalPlots: "",
    type: "Land",
    status: "Available",
    featured: false,
    companyId: "",
    amenities: ["Electricity", "Road Access", "Security", "Water"],
    plots: [] as Array<{
      id: string;
      plotId: string;
      size: string;
      price: string;
      status: string;
    }>,
    thumbnail: null as File | null,
    gallery: [] as Array<File>,
    planFile: null as File | null,
    documents: [] as Array<File>,
  });

  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );

  // Add body class to hide scrollbar when form is active
  useEffect(() => {
    document.body.classList.add("property-form-active");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("property-form-active");
    };
  }, []);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const companiesList = await getCompanies();
        setCompanies(companiesList);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to load companies", {
          description:
            "Please try again or contact support if the issue persists.",
        });
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [getCompanies]);

  // Update plots when totalPlots changes
  useEffect(() => {
    if (formData.totalPlots && !isNaN(Number(formData.totalPlots))) {
      const totalPlotsNum = Number(formData.totalPlots);
      const currentPlots = [...formData.plots];

      // If we need more plots
      if (totalPlotsNum > currentPlots.length) {
        const newPlots: any = [];
        for (let i = currentPlots.length; i < totalPlotsNum; i++) {
          newPlots.push({
            id: String(i + 1),
            plotId: `Plot-${i + 1}`,
            size: formData.plotSize,
            price: formData.price,
            status: "Available",
          });
        }
        setFormData((prev) => ({
          ...prev,
          plots: [...currentPlots, ...newPlots],
        }));
      }
      // If we need fewer plots
      else if (totalPlotsNum < currentPlots.length) {
        setFormData((prev) => ({
          ...prev,
          plots: currentPlots.slice(0, totalPlotsNum),
        }));
      }
    }
  }, [formData.totalPlots, formData.plotSize, formData.price]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };

  const handlePlotChange = (index: number, field: string, value: string) => {
    const updatedPlots = [...formData.plots];
    updatedPlots[index] = { ...updatedPlots[index], [field]: value };
    setFormData((prev) => ({ ...prev, plots: updatedPlots }));
  };

  const handleAddPlot = () => {
    if (formData.plots.length >= Number(formData.totalPlots)) {
      toast.error("Cannot add more plots than the total plots specified");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      plots: [
        ...prev.plots,
        {
          id: String(prev.plots.length + 1),
          plotId: `Plot-${prev.plots.length + 1}`,
          size: prev.plotSize, // Default to the property plot size
          price: prev.price, // Default to the property price
          status: "Available",
        },
      ],
    }));
  };

  const handleRemovePlot = (index: number) => {
    const updatedPlots = [...formData.plots];
    updatedPlots.splice(index, 1);

    // Update IDs to maintain sequence
    const reindexedPlots = updatedPlots.map((plot, idx) => ({
      ...plot,
      id: String(idx + 1),
      plotId: plot.plotId.startsWith("Plot-") ? `Plot-${idx + 1}` : plot.plotId,
    }));

    setFormData((prev) => ({
      ...prev,
      plots: reindexedPlots,
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail" | "gallery" | "planFile" | "documents"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    if (type === "thumbnail" && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: files[0],
      }));
    } else if (type === "gallery") {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...files],
      }));
    } else if (type === "planFile" && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        planFile: files[0],
      }));
    } else if (type === "documents") {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...files],
      }));
    }

    // Reset the file input
    e.target.value = "";
  };

  const handleAddThumbnail = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    }
  };

  const handleAddGalleryImages = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleAddPlanFile = () => {
    if (planFileInputRef.current) {
      planFileInputRef.current.click();
    }
  };

  const handleAddDocuments = () => {
    if (documentFileInputRef.current) {
      documentFileInputRef.current.click();
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail: null }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updatedGallery = [...formData.gallery];
    updatedGallery.splice(index, 1);
    setFormData((prev) => ({ ...prev, gallery: updatedGallery }));
  };

  const handleRemovePlanFile = () => {
    setFormData((prev) => ({ ...prev, planFile: null }));
  };

  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    setFormData((prev) => ({ ...prev, documents: updatedDocuments }));
  };

  const getFileUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.title.trim()) {
      toast.error("Please enter a property title");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a property description");
      return false;
    }

    if (!formData.location.trim()) {
      toast.error("Please enter a property location");
      return false;
    }

    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      toast.error("Please enter a valid price");
      return false;
    }

    if (!formData.companyId) {
      toast.error("Please select a company");
      return false;
    }

    if (!formData.plotSize.trim()) {
      toast.error("Please enter a plot size");
      return false;
    }

    if (
      !formData.totalPlots ||
      isNaN(Number(formData.totalPlots)) ||
      Number(formData.totalPlots) <= 0
    ) {
      toast.error("Please enter a valid number of total plots");
      return false;
    }

    // Validate plots
    if (formData.plots.length === 0) {
      toast.error("Please add at least one plot");
      return false;
    }

    for (const plot of formData.plots) {
      if (!plot.plotId.trim()) {
        toast.error("Please enter a plot ID for all plots");
        return false;
      }

      if (!plot.size.trim()) {
        toast.error("Please enter a size for all plots");
        return false;
      }

      if (!plot.price || isNaN(Number(plot.price)) || Number(plot.price) <= 0) {
        toast.error("Please enter a valid price for all plots");
        return false;
      }
    }

    // Validate thumbnail
    if (!formData.thumbnail) {
      toast.error("Please upload a thumbnail image");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data submission
      const formDataObj = new FormData();

      // Convert property data to JSON and append as 'data'
      const propertyData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: Number(formData.price),
        plotSize: formData.plotSize,
        totalPlots: Number(formData.totalPlots),
        type: formData.type,
        status: formData.status,
        featured: formData.featured,
        companyId: formData.companyId,
        amenities: formData.amenities,
        availablePlots: formData.plots.filter((p) => p.status === "Available")
          .length,
        plots: formData.plots.map((plot) => ({
          ...plot,
          price: Number(plot.price),
        })),
      };

      formDataObj.append("data", JSON.stringify(propertyData));

      // Append thumbnail
      if (formData.thumbnail) {
        formDataObj.append("thumbnail", formData.thumbnail);
      }

      // Append gallery images
      formData.gallery.forEach((image) => {
        formDataObj.append("gallery", image);
      });

      // Append plan file
      if (formData.planFile) {
        formDataObj.append("planFile", formData.planFile);
      }

      // Append documents
      formData.documents.forEach((doc) => {
        formDataObj.append("documents", doc);
      });

      const result = await createProperty(formDataObj);

      if (result) {
        toast.success("Property created successfully", {
          description: `${result.title} has been added to your properties.`,
        });
        router.push("/dashboard/properties");
      } else {
        toast.error("Failed to create property", {
          description:
            "Please try again or contact support if the issue persists.",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to create property", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/properties");
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "Land":
        return <LayoutGrid className="h-4 w-4" />;
      case "Residential":
        return <Home className="h-4 w-4" />;
      case "Commercial":
        return <Store className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  // Jodit Editor configuration
  const editorConfig = {
    readonly: false,
    height: 300,
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "medium",
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "|",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "fullsize",
    ],
    extraButtons: ["uploadImage"],
    uploader: {
      insertImageAsBase64URI: true,
    },
    placeholder: "Provide a detailed description of the property...",
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FadeIn>
            <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                    <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Basic Information
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Property Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. IVY GOLD ESTATE ABUJA (PHASE 3)"
                      className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Description
                    </Label>
                    <div className="min-h-fit rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
                      <JoditEditor
                        ref={editor}
                        value={formData.description}
                        config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={handleDescriptionChange}
                        onChange={handleDescriptionChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Location
                        </div>
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Abuja, Nigeria"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="type"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Property Type
                        </div>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleSelectChange("type", value)
                        }
                      >
                        <SelectTrigger
                          id="type"
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        >
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="Land"
                            className="flex items-center"
                          >
                            <div className="flex items-center">
                              <LayoutGrid className="h-4 w-4 mr-2 text-violet-500 dark:text-violet-400" />
                              Land
                            </div>
                          </SelectItem>
                          <SelectItem value="Residential">
                            <div className="flex items-center">
                              <Home className="h-4 w-4 mr-2 text-violet-500 dark:text-violet-400" />
                              Residential
                            </div>
                          </SelectItem>
                          <SelectItem value="Commercial">
                            <div className="flex items-center">
                              <Store className="h-4 w-4 mr-2 text-violet-500 dark:text-violet-400" />
                              Commercial
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companyId"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                        Company
                      </div>
                    </Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) =>
                        handleSelectChange("companyId", value)
                      }
                      required
                    >
                      <SelectTrigger
                        id="companyId"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                      >
                        <SelectValue
                          placeholder={
                            isLoadingCompanies
                              ? "Loading companies..."
                              : "Select company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCompanies ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2 text-violet-500" />
                            <span className="text-sm">
                              Loading companies...
                            </span>
                          </div>
                        ) : companies.length > 0 ? (
                          companies.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              <div className="flex items-center ">
                                <img
                                  src={
                                    company.logo ||
                                    "/placeholder.svg?height=20&width=20&query=company"
                                  }
                                  alt={company.name}
                                  className="object-cover rounded-md h-8 w-8 mr-2"
                                  width={20}
                                  height={20}
                                />
                                {company.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-center py-2 text-sm text-muted-foreground">
                            No companies found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-emerald-500 dark:text-emerald-400" />
                          Base Price (₦)
                        </div>
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g. 5000000"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="plotSize"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <SquareStack className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-400" />
                          Plot Size (SQM)
                        </div>
                      </Label>
                      <Input
                        id="plotSize"
                        name="plotSize"
                        value={formData.plotSize}
                        onChange={handleInputChange}
                        placeholder="e.g. 250"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="totalPlots"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Grid3X3 className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Total Plots
                        </div>
                      </Label>
                      <Input
                        id="totalPlots"
                        name="totalPlots"
                        type="number"
                        value={formData.totalPlots}
                        onChange={handleInputChange}
                        placeholder="e.g. 10"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Status
                        </div>
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger
                          id="status"
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200">
                                Available
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Sold Out">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-200">
                                Sold Out
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Coming Soon">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200">
                                Coming Soon
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="featured"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center"
                      >
                        <Star className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-400" />
                        Featured Property
                      </Label>
                      <div className="flex items-center justify-between h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Highlight this property on the homepage
                        </span>
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("featured", checked)
                          }
                          className="data-[state=checked]:bg-violet-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>
        );
      case 2:
        return (
          <FadeIn>
            <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                    <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Property Media
                  </h2>
                </div>

                <Tabs defaultValue="thumbnail" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger
                      value="thumbnail"
                      className="flex items-center gap-2"
                    >
                      <ImageIcon2 className="h-4 w-4" />
                      Thumbnail
                    </TabsTrigger>
                    <TabsTrigger
                      value="gallery"
                      className="flex items-center gap-2"
                    >
                      <FileImage className="h-4 w-4" />
                      Gallery
                    </TabsTrigger>
                    <TabsTrigger
                      value="plan"
                      className="flex items-center gap-2"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Property Plan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="thumbnail" className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddThumbnail}
                        className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                        Upload Thumbnail
                      </Button>
                      <input
                        type="file"
                        ref={thumbnailInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "thumbnail")}
                      />
                    </div>

                    {formData.thumbnail ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="relative h-[300px] w-full">
                          <img
                            src={
                              getFileUrl(formData.thumbnail) ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt="Property thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveThumbnail}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <p className="text-white font-medium">
                            Main Property Thumbnail
                          </p>
                          <p className="text-white/80 text-sm">
                            {formData.thumbnail.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={handleAddThumbnail}
                      >
                        <div className="relative mx-auto w-16 h-16 mb-4">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400/30 to-purple-500/30 p-4 rounded-full flex items-center justify-center">
                            <ImageIcon2 className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                          Upload property thumbnail
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          This will be the main image displayed for your
                          property
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                        >
                          <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                          Upload Thumbnail
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="gallery" className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddGalleryImages}
                        className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                        Add Gallery Images
                      </Button>
                      <input
                        type="file"
                        ref={galleryInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, "gallery")}
                      />
                    </div>

                    {formData.gallery.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                        <div className="relative mx-auto w-16 h-16 mb-4">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400/30 to-purple-500/30 p-4 rounded-full flex items-center justify-center">
                            <FileImage className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                          No gallery images added yet
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          Click "Add Gallery Images" to upload additional
                          property images
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddGalleryImages}
                          className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                        >
                          <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                          Upload Images
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.gallery.map((image, index) => (
                          <div
                            key={index}
                            className="relative group rounded-xl overflow-hidden h-48 border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                            <img
                              src={getFileUrl(image) || "/placeholder.svg"}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                              <Badge className="bg-white/90 text-slate-700 hover:bg-white">
                                {image.name}
                              </Badge>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="plan" className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddPlanFile}
                        className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                        Upload Plan File
                      </Button>
                      <input
                        type="file"
                        ref={planFileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e, "planFile")}
                      />
                    </div>

                    {formData.planFile ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                        <div className="flex items-center">
                          <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-lg mr-4">
                            <File className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 dark:text-white font-medium">
                              {formData.planFile.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {(formData.planFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePlanFile}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={handleAddPlanFile}
                      >
                        <div className="relative mx-auto w-16 h-16 mb-4">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400/30 to-purple-500/30 p-4 rounded-full flex items-center justify-center">
                            <LayoutGrid className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                          Upload property plan file
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          Upload the master plan file for this property (PDF
                          only)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                        >
                          <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                          Upload Plan
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </AnimatedCard>
          </FadeIn>
        );
      case 3:
        return (
          <FadeIn>
            <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                      <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                        <Grid3X3 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Available Plots
                    </h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPlot}
                    disabled={
                      !formData.totalPlots ||
                      isNaN(Number(formData.totalPlots)) ||
                      formData.plots.length >= Number(formData.totalPlots)
                    }
                    className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Plus className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                    Add Plot
                  </Button>
                </div>

                {formData.plots.length > 0 && (
                  <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center">
                    <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {formData.plots.length} of {formData.totalPlots} plots
                      added
                      {formData.plots.length >= Number(formData.totalPlots) &&
                        " (Maximum reached)"}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.plots.map((plot, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 relative bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute top-3 right-3">
                        {formData.plots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlot(index)}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-1.5 rounded-full">
                            <Grid3X3 className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Plot {index + 1}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`plot-id-${index}`}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Plot ID
                          </Label>
                          <Input
                            id={`plot-id-${index}`}
                            value={plot.plotId}
                            onChange={(e) =>
                              handlePlotChange(index, "plotId", e.target.value)
                            }
                            placeholder="e.g. IVG3 TD-02"
                            className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`plot-size-${index}`}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Size (SQM)
                          </Label>
                          <Input
                            id={`plot-size-${index}`}
                            value={plot.size}
                            onChange={(e) =>
                              handlePlotChange(index, "size", e.target.value)
                            }
                            placeholder="e.g. 250"
                            className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`plot-price-${index}`}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Price (₦)
                          </Label>
                          <Input
                            id={`plot-price-${index}`}
                            type="number"
                            value={plot.price}
                            onChange={(e) =>
                              handlePlotChange(index, "price", e.target.value)
                            }
                            placeholder="e.g. 5000000"
                            className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`plot-status-${index}`}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Status
                          </Label>
                          <Select
                            value={plot.status}
                            onValueChange={(value) =>
                              handlePlotChange(index, "status", value)
                            }
                          >
                            <SelectTrigger
                              id={`plot-status-${index}`}
                              className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                            >
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available">
                                <div className="flex items-center">
                                  <Badge className="mr-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200">
                                    Available
                                  </Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="Reserved">
                                <div className="flex items-center">
                                  <Badge className="mr-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200">
                                    Reserved
                                  </Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="Sold">
                                <div className="flex items-center">
                                  <Badge className="mr-2 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-200">
                                    Sold
                                  </Badge>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.plots.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="relative mx-auto w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-violet-400/30 to-purple-500/30 p-4 rounded-full flex items-center justify-center">
                          <Grid3X3 className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                        No plots added yet
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Click "Add Plot" to create available plots for this
                        property
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddPlot}
                        disabled={
                          !formData.totalPlots ||
                          isNaN(Number(formData.totalPlots))
                        }
                        className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Plus className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                        Add First Plot
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>
        );
      case 4:
        return (
          <div className="space-y-6">
            <FadeIn>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="relative mr-3">
                      <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                      <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Amenities
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Electricity",
                      "Road Access",
                      "Security",
                      "Water",
                      "Drainage System",
                      "Perimeter Fencing",
                      "Recreational Areas",
                      "Shopping Centers",
                      "Schools",
                      "Hospitals",
                    ].map((amenity) => (
                      <div
                        key={amenity}
                        className={`flex items-center space-x-2 p-3 rounded-xl border ${
                          formData.amenities.includes(amenity)
                            ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                        } cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors`}
                        onClick={() => {
                          const checked = !formData.amenities.includes(amenity);
                          setFormData((prev) => ({
                            ...prev,
                            amenities: checked
                              ? [...prev.amenities, amenity]
                              : prev.amenities.filter((a) => a !== amenity),
                          }));
                        }}
                      >
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            value={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={(e) => {
                              const { value, checked } = e.target;
                              setFormData((prev) => ({
                                ...prev,
                                amenities: checked
                                  ? [...prev.amenities, value]
                                  : prev.amenities.filter((a) => a !== value),
                              }));
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        </div>
                        <Label
                          htmlFor={`amenity-${amenity}`}
                          className={`text-sm font-medium ${
                            formData.amenities.includes(amenity)
                              ? "text-violet-700 dark:text-violet-300"
                              : "text-slate-700 dark:text-slate-300"
                          } cursor-pointer`}
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>

            <FadeIn delay={0.1}>
              <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Documents
                      </h2>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddDocuments}
                      className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    >
                      <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
                      Add Document
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
                        <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                        <div className="relative bg-gradient-to-br from-violet-400/30 to-purple-500/30 p-4 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                        Upload property documents
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Layout plans, certificates, legal documents, etc.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddDocuments}
                        className="rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
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
                            <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg mr-3">
                              <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
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
                            onClick={() => handleRemoveDocument(index)}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </FadeIn>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <div className="mr-3 bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg shadow-md">
                <Building className="h-6 w-6 text-white" />
              </div>
              Create Property
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
              Add a new property listing to the platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
            {currentStep === 4 ? (
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Property
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => nextStep(e)}
                className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
              >
                Continue <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            )}
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
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <Home className="h-3.5 w-3.5 mr-1" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/properties"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
                >
                  <Building className="h-3.5 w-3.5 mr-1" />
                  Properties
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium flex items-center">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create Property
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-[2px]"></div>
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 p-2 rounded-full">
                <Info className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Complete all steps
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fill out all required information to create a comprehensive
                property listing
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <div className="w-full max-w-3xl mx-auto flex">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                        : currentStep > step
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {currentStep > step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step}</span>
                    )}
                  </button>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep === step
                        ? "text-violet-700 dark:text-violet-300"
                        : currentStep > step
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step === 1 && "Basic Info"}
                    {step === 2 && "Media"}
                    {step === 3 && "Plots"}
                    {step === 4 && "Details"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {renderStepContent()}

      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Step
          </Button>
        ) : (
          <div></div>
        )}

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={(e) => nextStep(e)}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            Next Step <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Property
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
