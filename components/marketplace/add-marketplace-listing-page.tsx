"use client";

import type React from "react";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Upload,
  ArrowLeft,
  Save,
  Building,
  MapPin,
  DollarSign,
  Tag,
  Star,
  ImageIcon,
  FileText,
  Info,
  Loader2,
  X,
  FileImage,
  Check,
  Sparkles,
  Package,
  Percent,
  Barcode,
  Weight,
  Ruler,
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
import { useMarketplace } from "@/contexts/marketplace-context";
import { useMarketplacePermissions } from "@/hooks/use-marketplace-permissions";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import JoditEditor from "jodit-react";

export default function AddMarketplaceListingPage() {
  const router = useRouter();
  const { addListing, isSubmitting, getCompanies } = useMarketplace();
  const { user } = useAuth();
  const { hasPermission } = useMarketplacePermissions();

  const [currentStep, setCurrentStep] = useState(1);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);
  const editor = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    discountedPrice: "",
    quantity: "1",
    sku: "",
    barcode: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    type: "Physical",
    status: "Available",
    featured: false,
    companyId: "",
    amenities: ["Electricity", "Road Access", "Security", "Water"],
    thumbnail: null as File | null,
    gallery: [] as Array<File>,
    documents: [] as Array<File>,
    creatorId: user?.id || "",
    categories: [] as string[],
    tags: [] as string[],
    isDigital: false,
    downloadUrl: "",
  });

  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Dynamically import Jodit Editor

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested dimensions
    if (name.startsWith("dimensions.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter((c) => c !== value),
    }));
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const value = target.value.trim();

      // Limit tag length and total number of tags
      if (
        value &&
        !formData.tags.includes(value) &&
        value.length <= 30 &&
        formData.tags.length < 20
      ) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, value],
        }));
        target.value = "";
      } else if (formData.tags.length >= 20) {
        toast.warning("Maximum of 20 tags allowed");
      } else if (value.length > 30) {
        toast.warning("Tag is too long (maximum 30 characters)");
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail" | "gallery" | "documents"
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
      toast.error("Please enter a listing title");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a listing description");
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

    if (
      !formData.quantity ||
      isNaN(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      toast.error("Please enter a valid quantity");
      return false;
    }

    if (!formData.companyId) {
      toast.error("Please select a company");
      return false;
    }

    // Validate thumbnail
    if (!formData.thumbnail) {
      toast.error("Please upload a thumbnail image");
      return false;
    }

    // Validate digital product
    if (formData.isDigital && !formData.downloadUrl.trim()) {
      toast.error("Please enter a download URL for the digital product");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for multipart/form-data submission
      const formDataObj = new FormData();

      // Convert listing data to JSON and append as 'data'
      const listingData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: Number(formData.price),
        discountedPrice: formData.discountedPrice
          ? Number(formData.discountedPrice)
          : undefined,
        quantity: Number(formData.quantity),
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        dimensions: {
          length: formData.dimensions.length
            ? Number(formData.dimensions.length)
            : undefined,
          width: formData.dimensions.width
            ? Number(formData.dimensions.width)
            : undefined,
          height: formData.dimensions.height
            ? Number(formData.dimensions.height)
            : undefined,
        },
        type: formData.type,
        status: formData.status,
        featured: formData.featured,
        companyId: formData.companyId, // Changed from { _id: formData.companyId } to just formData.companyId
        amenities: formData.amenities,
        creatorId: formData.creatorId || user?.id || "",
        categories:
          formData.categories.length > 0 ? formData.categories : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isDigital: formData.isDigital,
        downloadUrl: formData.isDigital ? formData.downloadUrl : undefined,
      };

      // Append the data as a string
      formDataObj.append("data", JSON.stringify(listingData));

      // Debug: Log the FormData contents
      console.log("FormData created with data:", listingData);
      console.log("FormData has data field:", formDataObj.has("data"));

      // Append thumbnail
      if (formData.thumbnail) {
        formDataObj.append(
          "thumbnail",
          formData.thumbnail,
          formData.thumbnail.name
        );
        console.log("Added thumbnail:", formData.thumbnail.name);
      }

      // Append gallery images
      formData.gallery.forEach((image, index) => {
        formDataObj.append(`gallery`, image, image.name);
        console.log(`Added gallery image ${index}:`, image.name);
      });

      // Append documents
      formData.documents.forEach((doc, index) => {
        formDataObj.append(`documents`, doc, doc.name);
        console.log(`Added document ${index}:`, doc.name);
      });

      // Final check
      console.log("FormData entries:");
      for (const [key, value] of formDataObj.entries()) {
        console.log(
          key,
          ":",
          typeof value === "object" ? "File or Blob" : value
        );
      }

      // console.log(
      //   "Submitting FormData with",
      //   formDataObj.get("data"),
      // );
      const result = await addListing(formDataObj);

      if (result) {
        toast.success("Marketplace listing created successfully", {
          description: `${formData.title} has been added to the marketplace.`,
        });
        router.push("/dashboard/marketplace");
      } else {
        toast.error("Failed to create marketplace listing", {
          description:
            "Please try again or contact support if the issue persists.",
        });
      }
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      toast.error("Failed to create marketplace listing", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/marketplace");
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Jodit Editor configuration

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );
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
                      Listing Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium Product"
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
                    <div className="min-h-fit rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden text-black">
                      <JoditEditor
                        ref={editor}
                        value={formData.description}
                        config={config}
                        tabIndex={1}
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
                        placeholder="e.g. Lagos, Nigeria"
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
                          <Package className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Product Type
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
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physical">
                            Physical Product
                          </SelectItem>
                          <SelectItem value="Digital">
                            Digital Product
                          </SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
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
                                    "/placeholder.svg?height=20&width=20&query=company" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-emerald-500 dark:text-emerald-400" />
                          Regular Price (₦)
                        </div>
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g. 5000"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="discountedPrice"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-400" />
                          Discounted Price (₦)
                        </div>
                      </Label>
                      <Input
                        id="discountedPrice"
                        name="discountedPrice"
                        type="number"
                        value={formData.discountedPrice}
                        onChange={handleInputChange}
                        placeholder="e.g. 4500 (optional)"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="quantity"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Quantity in Stock
                        </div>
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="e.g. 100"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required
                      />
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="sku"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          SKU (Stock Keeping Unit)
                        </div>
                      </Label>
                      <Input
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="e.g. PROD-001 (optional)"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="barcode"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <Barcode className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Barcode
                        </div>
                      </Label>
                      <Input
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        placeholder="e.g. 123456789012 (optional)"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                      />
                    </div>
                  </div>

                  {formData.type === "Physical" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="weight"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center">
                            <Weight className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                            Weight (kg)
                          </div>
                        </Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="e.g. 1.5 (optional)"
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="dimensions"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center">
                            <Ruler className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                            Dimensions (cm)
                          </div>
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            id="length"
                            name="dimensions.length"
                            type="number"
                            value={formData.dimensions.length}
                            onChange={handleInputChange}
                            placeholder="Length"
                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                          />
                          <Input
                            id="width"
                            name="dimensions.width"
                            type="number"
                            value={formData.dimensions.width}
                            onChange={handleInputChange}
                            placeholder="Width"
                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                          />
                          <Input
                            id="height"
                            name="dimensions.height"
                            type="number"
                            value={formData.dimensions.height}
                            onChange={handleInputChange}
                            placeholder="Height"
                            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.type === "Digital" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="downloadUrl"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-violet-500 dark:text-violet-400" />
                          Download URL
                        </div>
                      </Label>
                      <Input
                        id="downloadUrl"
                        name="downloadUrl"
                        value={formData.downloadUrl}
                        onChange={handleInputChange}
                        placeholder="e.g. https://example.com/download/file.pdf"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                        required={formData.type === "Digital"}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="featured"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center"
                    >
                      <Star className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-400" />
                      Featured Listing
                    </Label>
                    <div className="flex items-center justify-between h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Highlight this listing on the marketplace
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

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Admin Access Only
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Only administrators can create and manage marketplace
                        listings. Make sure all information is accurate before
                        submitting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="shadow-md rounded-2xl border border-slate-200 dark:border-slate-800 mt-6">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                    <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Categories & Tags
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Categories
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {[
                        "Electronics",
                        "Fashion",
                        "Home & Garden",
                        "Health & Beauty",
                        "Sports",
                        "Toys & Games",
                        "Books & Media",
                        "Automotive",
                        "Office Supplies",
                        "Food & Beverages",
                      ].map((category) => (
                        <div
                          key={category}
                          className={`flex items-center space-x-2 p-3 rounded-xl border ${
                            formData.categories.includes(category)
                              ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                          } cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors`}
                          onClick={() => {
                            const checked =
                              !formData.categories.includes(category);
                            setFormData((prev) => ({
                              ...prev,
                              categories: checked
                                ? [...prev.categories, category]
                                : prev.categories.filter((c) => c !== category),
                            }));
                          }}
                        >
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              value={category}
                              checked={formData.categories.includes(category)}
                              onChange={handleCategoryChange}
                              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                          </div>
                          <Label
                            htmlFor={`category-${category}`}
                            className={`text-sm font-medium ${
                              formData.categories.includes(category)
                                ? "text-violet-700 dark:text-violet-300"
                                : "text-slate-700 dark:text-slate-300"
                            } cursor-pointer`}
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="tags"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Tags (Press Enter to add)
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2 max-h-[120px] overflow-y-auto p-1">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-200 px-3 py-1 flex items-center"
                        >
                          <span className="truncate max-w-[150px]">{tag}</span>
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer flex-shrink-0"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      id="tags"
                      placeholder="Add tags (e.g. new, sale, premium)"
                      className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-visible:ring-violet-500"
                      onKeyDown={handleTagsChange}
                    />
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
                    Media & Documents
                  </h2>
                </div>

                <Tabs defaultValue="thumbnail" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger
                      value="thumbnail"
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
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
                      value="documents"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Documents
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
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt="Listing thumbnail"
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
                            Main Listing Thumbnail
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
                            <ImageIcon className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                          Upload listing thumbnail
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          This will be the main image displayed for your listing
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
                          listing images
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
                              alt={`Listing image ${index + 1}`}
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

                  <TabsContent value="documents" className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddDocuments}
                        className="h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <Upload className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />{" "}
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
                          <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                          <div className="relative bg-gradient-to-br from-violet-400/30 to-purple-500/30 p-4 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                          Upload listing documents
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          Certificates, legal documents, brochures, etc.
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
                <div className="flex items-center mb-6">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-violet-400 rounded-full opacity-20 blur-[2px]"></div>
                    <div className="relative bg-gradient-to-br from-violet-400 to-purple-500 p-2 rounded-full">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Preview & Submit
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                      Listing Summary
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Title
                        </p>
                        <p className="text-base font-medium text-slate-900 dark:text-white">
                          {formData.title || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Price
                        </p>
                        <div className="flex items-center gap-2">
                          {formData.discountedPrice ? (
                            <>
                              <p className="text-base font-medium text-slate-900 dark:text-white">
                                ₦
                                {Number(
                                  formData.discountedPrice
                                ).toLocaleString()}
                              </p>
                              <p className="text-sm line-through text-slate-500 dark:text-slate-400">
                                ₦{Number(formData.price).toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-base font-medium text-slate-900 dark:text-white">
                              ₦
                              {Number(formData.price).toLocaleString() || "N/A"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Quantity
                        </p>
                        <p className="text-base font-medium text-slate-900 dark:text-white">
                          {formData.quantity || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Type
                        </p>
                        <p className="text-base font-medium text-slate-900 dark:text-white">
                          {formData.type || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Status
                        </p>
                        <Badge
                          className={`${
                            formData.status === "Available"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {formData.status || "N/A"}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Featured
                        </p>
                        <Badge
                          className={`${
                            formData.featured
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {formData.featured ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    {formData.categories.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                          Categories
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.categories.map((category) => (
                            <Badge
                              key={category}
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.tags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Ready to Submit?
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Please review all information before submitting. Once
                        submitted, the listing will be available on the
                        marketplace.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-10 max-w-full overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                <div className="mr-3 bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg shadow-md">
                  <Building className="h-6 w-6 text-white" />
                </div>
                Create Marketplace Listing
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
                Add a new product to the marketplace
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
              {currentStep === 3 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Listing
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
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard/marketplace"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Marketplace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    Create Listing
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
                  marketplace listing
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <div className="w-full max-w-3xl mx-auto flex">
                {[1, 2, 3].map((step) => (
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
                      {step === 3 && "Preview"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="overflow-visible">{renderStepContent()}</div>

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

          {currentStep < 3 ? (
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
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Listing
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
