"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiConfig } from "@/lib/api";
import { apiConfigFile } from "@/lib/api";
import { toast } from "sonner";

// Types
export interface PropertyPlot {
  _id?: string;
  plotId: string;
  size: string;
  price: string | number;
  status: "Available" | "Reserved" | "Sold";
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  plotSize: string;
  totalPlots: number;
  availablePlots: number;
  type: "Land" | "Residential" | "Commercial";
  status: "Available" | "Sold Out" | "Coming Soon";
  featured: boolean;
  companyId: {
    _id: string;
  };
  companyName?: string;
  companyLogo?: string;
  amenities: string[];
  plots: PropertyPlot[];
  thumbnail?: string; // Main property image URL
  gallery?: string[]; // Additional property images URLs
  planFile?: string; // Property layout/plan file URL
  documents?: string[]; // Property document file URLs
  createdAt: string;
  updatedAt: string;
}

export interface PropertyResponse {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Define the context type
interface PropertyContextType {
  // Properties
  properties: Property[];
  filteredProperties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  isPurchasing: boolean; // Separate loading state for purchases

  // Filters
  searchQuery: string;
  locationFilter: string;
  typeFilter: string;
  sortOption: string;
  viewMode: "grid" | "list";

  // CRUD operations
  getPropertyById: (id: string) => Promise<Property | null>;
  createProperty: (property: FormData) => Promise<Property | null>;
  updateProperty: (id: string, property: FormData) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;

  // Media operations
  uploadThumbnail: (id: string, thumbnail: File) => Promise<string>;
  uploadGalleryImages: (id: string, images: File[]) => Promise<string[]>;
  uploadPlanFile: (id: string, planFile: File) => Promise<string>;
  uploadDocuments: (id: string, documents: File[]) => Promise<string[]>;
  deleteThumbnail: (id: string) => Promise<boolean>;
  deleteGalleryImage: (id: string, imageUrl: string) => Promise<boolean>;
  deletePlanFile: (id: string) => Promise<boolean>;
  deleteDocument: (id: string, documentUrl: string) => Promise<boolean>;

  // Property purchase
  initiatePropertyPurchase: (id: string, plotIds: string[]) => Promise<any>;

  // Filter operations
  setSearchQuery: (query: string) => void;
  setLocationFilter: (location: string) => void;
  setTypeFilter: (type: string) => void;
  setSortOption: (option: string) => void;
  setViewMode: (mode: "grid" | "list") => void;

  // Selection
  selectProperty: (property: Property | null) => void;

  // Data fetching
  getProperties: (params?: {
    page?: number;
    limit?: number;
    featured?: boolean;
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    search?: string;
  }) => Promise<PropertyResponse>;
  getPropertyTypes: () => Promise<string[]>;
  getPropertyLocations: () => Promise<string[]>;
  getCompanies: () => Promise<any[]>;
  getAmenities: () => Promise<string[]>;
  refreshPropertyData: () => Promise<void>;
}

// Create the context with a default value
const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

// Provider props
interface PropertyProviderProps {
  children: ReactNode;
}

// Provider component
export function PropertyProvider({ children }: PropertyProviderProps) {
  // State for properties
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false); // Separate loading state for purchases

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load initial data
  useEffect(() => {
    refreshPropertyData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...properties];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply location filter
    if (locationFilter !== "all") {
      result = result.filter((property) =>
        property.location.includes(locationFilter)
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((property) => property.type === typeFilter);
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setFilteredProperties(result);
  }, [properties, searchQuery, locationFilter, typeFilter, sortOption]);

  // Refresh property data
  const refreshPropertyData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getProperties({ limit: 20 });
      setProperties(response.properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get properties with pagination and filters
  const getProperties = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      featured?: boolean;
      type?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      status?: string;
      search?: string;
    }): Promise<PropertyResponse> => {
      try {
        const response = await apiConfig.get("/properties", {
          params,
          withCredentials: true,
        });

        if (response.status === 200) {
          return {
            properties: response.data.data || [],
            totalCount: response.data.total || 0,
            totalPages: response.data.totalPages || 0,
            currentPage: response.data.currentPage || 1,
          };
        }
        return { properties: [], totalCount: 0, totalPages: 0, currentPage: 1 };
      } catch (error: any) {
        console.error("Error fetching properties:", error);
        return { properties: [], totalCount: 0, totalPages: 0, currentPage: 1 };
      }
    },
    []
  );

  // Get property by ID
  const getPropertyById = useCallback(
    async (id: string): Promise<Property | null> => {
      // Don't set global loading for individual property fetches
      try {
        const response = await apiConfig.get(`/properties/${id}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          return response.data.data;
        }
        return null;
      } catch (error: any) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property details", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return null;
      }
    },
    []
  );

  // Get property types
  const getPropertyTypes = useCallback(async (): Promise<string[]> => {
    try {
      const response = await apiConfig.get("/properties/types", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.types || [];
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching property types:", error);
      return [];
    }
  }, []);

  // Get property locations
  const getPropertyLocations = useCallback(async (): Promise<string[]> => {
    try {
      const response = await apiConfig.get("/properties/locations", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.locations || [];
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching property locations:", error);
      return [];
    }
  }, []);

  // Get companies
  const getCompanies = useCallback(async (): Promise<any[]> => {
    try {
      const response = await apiConfig.get("/companies", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      return [];
    }
  }, []);

  // Get amenities
  const getAmenities = useCallback(async (): Promise<string[]> => {
    try {
      const response = await apiConfig.get("/properties/amenities", {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.amenities || [];
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching amenities:", error);
      return [];
    }
  }, []);

  // Create property
  const createProperty = useCallback(
    async (formData: FormData): Promise<Property | null> => {
      setIsLoading(true);
      try {
        const response = await apiConfigFile.post("/properties", formData, {
          withCredentials: true,
        });

        if (response.status === 201) {
          const newProperty = response.data.data;

          // Update local state
          setProperties((prev) => [...prev, newProperty]);

          toast.success("Property created successfully", {
            description: `${newProperty.title} has been added to your properties.`,
          });

          return newProperty;
        }
        return null;
      } catch (error: any) {
        console.error("Error creating property:", error);
        toast.error("Failed to create property", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update property
  const updateProperty = useCallback(
    async (id: string, formData: FormData): Promise<Property | null> => {
      setIsLoading(true);
      try {
        const response = await apiConfigFile.put(
          `/properties/${id}`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          const updatedProperty = response.data.data;

          // Update local state
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Property updated successfully", {
            description: `Changes to ${updatedProperty.title} have been saved.`,
          });

          return updatedProperty;
        }
        return null;
      } catch (error: any) {
        console.error("Error updating property:", error);
        toast.error("Failed to update property", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete property
  const deleteProperty = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.delete(`/properties/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        setProperties((prev) => prev.filter((property) => property._id !== id));

        toast.success("Property deleted successfully", {
          description: "The property has been removed from your listings.",
        });

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload thumbnail
  const uploadThumbnail = useCallback(
    async (id: string, thumbnail: File): Promise<string> => {
      try {
        const formData = new FormData();
        formData.append("thumbnail", thumbnail);

        const response = await apiConfigFile.post(
          `/properties/${id}/thumbnail`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          // Update local state
          const updatedProperty = response.data.data;
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Thumbnail uploaded successfully", {
            description: "The main property image has been updated.",
          });

          return updatedProperty.thumbnail || "";
        }
        return "";
      } catch (error: any) {
        console.error("Error uploading thumbnail:", error);
        toast.error("Failed to upload thumbnail", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return "";
      }
    },
    []
  );

  // Upload gallery images
  const uploadGalleryImages = useCallback(
    async (id: string, images: File[]): Promise<string[]> => {
      try {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("gallery", image);
        });

        const response = await apiConfigFile.post(
          `/properties/${id}/gallery`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          // Update local state
          const updatedProperty = response.data.data;
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Gallery images uploaded successfully", {
            description: `${images.length} images have been added to the property gallery.`,
          });

          return updatedProperty.gallery || [];
        }
        return [];
      } catch (error: any) {
        console.error("Error uploading gallery images:", error);
        toast.error("Failed to upload gallery images", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return [];
      }
    },
    []
  );

  // Upload plan file
  const uploadPlanFile = useCallback(
    async (id: string, planFile: File): Promise<string> => {
      try {
        const formData = new FormData();
        formData.append("planFile", planFile);

        const response = await apiConfigFile.post(
          `/properties/${id}/plan`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          // Update local state
          const updatedProperty = response.data.data;
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Property plan uploaded successfully", {
            description: "The property layout plan has been updated.",
          });

          return updatedProperty.planFile || "";
        }
        return "";
      } catch (error: any) {
        console.error("Error uploading plan file:", error);
        toast.error("Failed to upload plan file", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return "";
      }
    },
    []
  );

  // Upload documents
  const uploadDocuments = useCallback(
    async (id: string, documents: File[]): Promise<string[]> => {
      try {
        const formData = new FormData();
        documents.forEach((doc) => {
          formData.append("documents", doc);
        });

        const response = await apiConfigFile.post(
          `/properties/${id}/documents`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          // Update local state
          const updatedProperty = response.data.data;
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Documents uploaded successfully", {
            description: `${documents.length} documents have been added to the property.`,
          });

          return updatedProperty.documents || [];
        }
        return [];
      } catch (error: any) {
        console.error("Error uploading documents:", error);
        toast.error("Failed to upload documents", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return [];
      }
    },
    []
  );

  // Delete thumbnail
  const deleteThumbnail = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await apiConfig.delete(`/properties/${id}/thumbnail`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        const updatedProperty = response.data.data;
        setProperties((prev) =>
          prev.map((property) =>
            property._id === id ? updatedProperty : property
          )
        );

        toast.success("Thumbnail deleted successfully", {
          description: "The main property image has been removed.",
        });

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting thumbnail:", error);
      toast.error("Failed to delete thumbnail", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return false;
    }
  }, []);

  // Delete gallery image
  const deleteGalleryImage = useCallback(
    async (id: string, imageUrl: string): Promise<boolean> => {
      try {
        const response = await apiConfig.delete(`/properties/${id}/gallery`, {
          data: { imageUrl },
          withCredentials: true,
        });

        if (response.status === 200) {
          // Update local state
          const updatedProperty = response.data.data;
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Gallery image deleted successfully", {
            description:
              "The image has been removed from the property gallery.",
          });

          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error deleting gallery image:", error);
        toast.error("Failed to delete gallery image", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return false;
      }
    },
    []
  );

  // Delete plan file
  const deletePlanFile = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await apiConfig.delete(`/properties/${id}/plan`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        const updatedProperty = response.data.data;
        setProperties((prev) =>
          prev.map((property) =>
            property._id === id ? updatedProperty : property
          )
        );

        toast.success("Property plan deleted successfully", {
          description: "The property layout plan has been removed.",
        });

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting plan file:", error);
      toast.error("Failed to delete plan file", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return false;
    }
  }, []);

  // Delete document
  const deleteDocument = useCallback(
    async (id: string, documentUrl: string): Promise<boolean> => {
      try {
        const response = await apiConfig.delete(`/properties/${id}/documents`, {
          data: { documentUrl },
          withCredentials: true,
        });

        if (response.status === 200) {
          // Update local state
          const updatedProperty = response.data.data;
          setProperties((prev) =>
            prev.map((property) =>
              property._id === id ? updatedProperty : property
            )
          );

          toast.success("Document deleted successfully", {
            description: "The document has been removed from the property.",
          });

          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return false;
      }
    },
    []
  );

  // Initiate property purchase - Use separate loading state
  const initiatePropertyPurchase = useCallback(
    async (id: string, plotIds: string[]): Promise<any> => {
      setIsPurchasing(true); // Use separate loading state
      try {
        const response = await apiConfig.post(
          `/properties/${id}/purchase/initiate`,
          { plotIds },
          {
            withCredentials: true,
          }
        );

        console.log("hit", { id, plotIds });

        if (response.status === 200) {
          toast.success("Purchase initiated successfully", {
            description: "Your property purchase has been initiated.",
          });

          return response.data.data;
        }
        return null;
      } catch (error: any) {
        console.error("Error initiating property purchase:", error);
        toast.error("Failed to initiate purchase", {
          description:
            error.response?.data?.message ||
            "Please try again or contact support if the issue persists.",
        });
        return null;
      } finally {
        setIsPurchasing(false); // Reset separate loading state
      }
    },
    []
  );

  const selectProperty = useCallback((property: Property | null) => {
    setSelectedProperty(property);
  }, []);

  // Filter operations with useCallback
  const setSearchQueryCallback = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const setLocationFilterCallback = useCallback((location: string) => {
    setLocationFilter(location);
  }, []);

  const setTypeFilterCallback = useCallback((type: string) => {
    setTypeFilter(type);
  }, []);

  const setSortOptionCallback = useCallback((option: string) => {
    setSortOption(option);
  }, []);

  const setViewModeCallback = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  // Context value
  const value: PropertyContextType = {
    properties,
    filteredProperties,
    selectedProperty,
    isLoading,
    isPurchasing,

    searchQuery,
    locationFilter,
    typeFilter,
    sortOption,
    viewMode,

    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,

    uploadThumbnail,
    uploadGalleryImages,
    uploadPlanFile,
    uploadDocuments,
    deleteThumbnail,
    deleteGalleryImage,
    deletePlanFile,
    deleteDocument,

    initiatePropertyPurchase,

    setSearchQuery: setSearchQueryCallback,
    setLocationFilter: setLocationFilterCallback,
    setTypeFilter: setTypeFilterCallback,
    setSortOption: setSortOptionCallback,
    setViewMode: setViewModeCallback,

    selectProperty,

    getProperties,
    getPropertyTypes,
    getPropertyLocations,
    getCompanies,
    getAmenities,
    refreshPropertyData,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

// Custom hook to use the property context
export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
}
