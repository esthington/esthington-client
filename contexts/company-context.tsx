"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiConfig } from "@/lib/api";
import { apiConfigFile } from "@/lib/api";
import { toast } from "sonner";

// Company interface
export interface Company {
  _id: string;
  name: string;
  description: string;
  logo: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Company response interface
export interface CompanyResponse {
  companies: Company[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Define the context type
interface CompanyContextType {
  // Companies
  companies: Company[];
  filteredCompanies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;

  // Filters
  searchQuery: string;
  sortOption: string;

  // CRUD operations
  getCompanyById: (id: string) => Promise<Company | null>;
  createCompany: (company: FormData) => Promise<Company | null>;
  updateCompany: (id: string, company: FormData) => Promise<Company | null>;
  deleteCompany: (id: string) => Promise<boolean>;

  // Logo operations
  uploadLogo: (id: string, logo: File) => Promise<string>;
  deleteLogo: (id: string) => Promise<boolean>;

  // Filter operations
  setSearchQuery: (query: string) => void;
  setSortOption: (option: string) => void;

  // Selection
  selectCompany: (company: Company | null) => void;

  // Data fetching
  getCompanies: (params?: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }) => Promise<CompanyResponse>;
  refreshCompanyData: () => Promise<void>;
}

// Create the context with a default value
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Provider props
interface CompanyProviderProps {
  children: ReactNode;
}

// Provider component
export function CompanyProvider({ children }: CompanyProviderProps) {
  // State for companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Load initial data
  useEffect(() => {
    refreshCompanyData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...companies];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredCompanies(result);
  }, [companies, searchQuery, sortOption]);

  // Refresh company data
  const refreshCompanyData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getCompanies({ limit: 20 });
      setCompanies(response.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get companies with pagination and filters
  const getCompanies = async (params?: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }): Promise<CompanyResponse> => {
    try {
      const response = await apiConfig.get("/companies", {
        params,
        withCredentials: true,
      });

      if (response.status === 200) {
        return {
          companies: response.data.data || [],
          totalCount: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1,
        };
      }
      return { companies: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return { companies: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
  };

  // Get company by ID
  const getCompanyById = async (id: string): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.get(`/companies/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching company:", error);
      toast.error("Failed to load company details", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create company
  const createCompany = async (formData: FormData): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const response = await apiConfigFile.post("/companies", formData, {
        withCredentials: true,
      });

      if (response.status === 201) {
        const newCompany = response.data.data;

        // Update local state
        setCompanies((prev) => [...prev, newCompany]);

        toast.success("Company created successfully", {
          description: `${newCompany.name} has been added to your companies.`,
        });

        return newCompany;
      }
      return null;
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error("Failed to create company", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update company
  const updateCompany = async (
    id: string,
    formData: FormData
  ): Promise<Company | null> => {
    setIsLoading(true);
    try {
      const response = await apiConfigFile.put(`/companies/${id}`, formData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const updatedCompany = response.data.data;

        // Update local state
        setCompanies((prev) =>
          prev.map((company) => (company._id === id ? updatedCompany : company))
        );

        toast.success("Company updated successfully", {
          description: `Changes to ${updatedCompany.name} have been saved.`,
        });

        return updatedCompany;
      }
      return null;
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete company
  const deleteCompany = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.delete(`/companies/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        setCompanies((prev) => prev.filter((company) => company._id !== id));

        toast.success("Company deleted successfully", {
          description: "The company has been removed from your listings.",
        });

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload logo
  const uploadLogo = async (id: string, logo: File): Promise<string> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("logo", logo);

      const response = await apiConfigFile.post(
        `/companies/${id}/logo`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        const updatedCompany = response.data.data;
        setCompanies((prev) =>
          prev.map((company) => (company._id === id ? updatedCompany : company))
        );

        toast.success("Logo uploaded successfully", {
          description: "The company logo has been updated.",
        });

        return updatedCompany.logo || "";
      }
      return "";
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  // Delete logo
  const deleteLogo = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiConfig.delete(`/companies/${id}/logo`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Update local state
        const updatedCompany = response.data.data;
        setCompanies((prev) =>
          prev.map((company) => (company._id === id ? updatedCompany : company))
        );

        toast.success("Logo deleted successfully", {
          description: "The company logo has been removed.",
        });

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting logo:", error);
      toast.error("Failed to delete logo", {
        description:
          error.response?.data?.message ||
          "Please try again or contact support if the issue persists.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const selectCompany = (company: Company | null) => {
    setSelectedCompany(company);
  };

  // Context value
  const value: CompanyContextType = {
    companies,
    filteredCompanies,
    selectedCompany,
    isLoading,

    searchQuery,
    sortOption,

    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,

    uploadLogo,
    deleteLogo,

    setSearchQuery,
    setSortOption,

    selectCompany,

    getCompanies,
    refreshCompanyData,
  };

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

// Custom hook to use the company context
export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
