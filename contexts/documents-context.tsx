"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for documents
export type DocumentType =
  | "deed"
  | "certificate_of_occupancy"
  | "survey_plan"
  | "building_plan"
  | "tax_clearance"
  | "receipt"
  | "contract"
  | "other"

export type DocumentStatus = "pending" | "verified" | "rejected"

export type Document = {
  id: string
  title: string
  type: DocumentType
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: string
  uploadedAt: string
  propertyId?: string
  investmentId?: string
  userId?: string
  status: DocumentStatus
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  expiryDate?: string
  isPublic: boolean
  tags?: string[]
}

export type DocumentFilter = {
  type?: DocumentType
  status?: DocumentStatus
  propertyId?: string
  investmentId?: string
  userId?: string
  searchQuery?: string
}

// Context type
type DocumentsContextType = {
  // Documents state
  documents: Document[]
  filteredDocuments: Document[]
  selectedDocument: Document | null
  filters: DocumentFilter
  isLoading: boolean
  isSubmitting: boolean

  // CRUD operations
  getDocuments: (filters?: DocumentFilter) => Promise<Document[]>
  getDocumentById: (id: string) => Promise<Document | null>
  uploadDocument: (file: File, data: Partial<Document>) => Promise<Document | null>
  updateDocument: (id: string, data: Partial<Document>) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>

  // Document actions
  verifyDocument: (id: string) => Promise<boolean>
  rejectDocument: (id: string, reason: string) => Promise<boolean>
  downloadDocument: (id: string) => Promise<boolean>
  shareDocument: (id: string, recipientEmail: string) => Promise<boolean>

  // Filter operations
  setFilters: (filters: Partial<DocumentFilter>) => void
  clearFilters: () => void
  selectDocument: (document: Document | null) => void

  // Document generation
  generateContract: (propertyId: string, buyerId: string) => Promise<Document | null>
  generateDeed: (propertyId: string, buyerId: string) => Promise<Document | null>
}

// Mock documents
const mockDocuments: Document[] = [
  {
    id: "doc1",
    title: "Certificate of Occupancy - Lekki Property",
    type: "certificate_of_occupancy",
    fileUrl: "#",
    fileSize: 2.4, // MB
    fileType: "application/pdf",
    uploadedBy: "user123",
    uploadedAt: "2023-05-15T10:30:00Z",
    propertyId: "prop1",
    status: "verified",
    verifiedAt: "2023-05-16T14:20:00Z",
    verifiedBy: "admin1",
    isPublic: false,
    tags: ["lekki", "residential"],
  },
  {
    id: "doc2",
    title: "Survey Plan - Victoria Island Property",
    type: "survey_plan",
    fileUrl: "#",
    fileSize: 3.1,
    fileType: "application/pdf",
    uploadedBy: "user456",
    uploadedAt: "2023-05-20T09:15:00Z",
    propertyId: "prop2",
    status: "pending",
    isPublic: false,
    tags: ["victoria island", "commercial"],
  },
  {
    id: "doc3",
    title: "Purchase Receipt - Ikoyi Apartment",
    type: "receipt",
    fileUrl: "#",
    fileSize: 1.2,
    fileType: "application/pdf",
    uploadedBy: "user789",
    uploadedAt: "2023-05-25T16:45:00Z",
    propertyId: "prop3",
    status: "verified",
    verifiedAt: "2023-05-26T11:30:00Z",
    verifiedBy: "admin2",
    isPublic: false,
    tags: ["ikoyi", "apartment", "receipt"],
  },
  {
    id: "doc4",
    title: "Investment Contract - Royal Gardens Estate",
    type: "contract",
    fileUrl: "#",
    fileSize: 2.8,
    fileType: "application/pdf",
    uploadedBy: "user123",
    uploadedAt: "2023-06-01T14:20:00Z",
    investmentId: "inv1",
    status: "verified",
    verifiedAt: "2023-06-02T10:15:00Z",
    verifiedBy: "admin1",
    isPublic: false,
    tags: ["investment", "contract"],
  },
  {
    id: "doc5",
    title: "Tax Clearance Certificate",
    type: "tax_clearance",
    fileUrl: "#",
    fileSize: 1.5,
    fileType: "application/pdf",
    uploadedBy: "user456",
    uploadedAt: "2023-06-05T11:30:00Z",
    userId: "user456",
    status: "rejected",
    rejectionReason: "Document expired",
    isPublic: false,
    tags: ["tax", "clearance"],
  },
]

// Create context
const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

// Provider component
export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [filters, setFiltersState] = useState<DocumentFilter>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize documents
  useEffect(() => {
    const initDocuments = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setDocuments(mockDocuments)
      } catch (error) {
        console.error("Failed to initialize documents:", error)
        errorToast("Failed to load documents")
      } finally {
        setIsLoading(false)
      }
    }

    initDocuments()
  }, [])

  // Filter documents based on filters
  const filteredDocuments = documents.filter((doc) => {
    // Filter by type
    if (filters.type && doc.type !== filters.type) {
      return false
    }

    // Filter by status
    if (filters.status && doc.status !== filters.status) {
      return false
    }

    // Filter by propertyId
    if (filters.propertyId && doc.propertyId !== filters.propertyId) {
      return false
    }

    // Filter by investmentId
    if (filters.investmentId && doc.investmentId !== filters.investmentId) {
      return false
    }

    // Filter by userId
    if (filters.userId && doc.userId !== filters.userId) {
      return false
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(query)))
      )
    }

    return true
  })

  // Set filters
  const setFilters = (newFilters: Partial<DocumentFilter>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }

  // Clear filters
  const clearFilters = () => {
    setFiltersState({})
  }

  // Select document
  const selectDocument = (document: Document | null) => {
    setSelectedDocument(document)
  }

  // Get documents
  const getDocuments = async (filters?: DocumentFilter): Promise<Document[]> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call with filters
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!filters) {
        return documents
      }

      // Apply filters
      return documents.filter((doc) => {
        // Filter by type
        if (filters.type && doc.type !== filters.type) {
          return false
        }

        // Filter by status
        if (filters.status && doc.status !== filters.status) {
          return false
        }

        // Filter by propertyId
        if (filters.propertyId && doc.propertyId !== filters.propertyId) {
          return false
        }

        // Filter by investmentId
        if (filters.investmentId && doc.investmentId !== filters.investmentId) {
          return false
        }

        // Filter by userId
        if (filters.userId && doc.userId !== filters.userId) {
          return false
        }

        // Filter by search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          return (
            doc.title.toLowerCase().includes(query) ||
            doc.type.toLowerCase().includes(query) ||
            (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(query)))
          )
        }

        return true
      })
    } catch (error) {
      console.error("Failed to get documents:", error)
      errorToast("Failed to load documents")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Get document by ID
  const getDocumentById = async (id: string): Promise<Document | null> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const document = documents.find((doc) => doc.id === id) || null
      setSelectedDocument(document)
      return document
    } catch (error) {
      console.error("Failed to get document:", error)
      errorToast("Failed to load document")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Upload document
  const uploadDocument = async (file: File, data: Partial<Document>): Promise<Document | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to upload the file
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new document
      const newDocument: Document = {
        id: `doc${documents.length + 1}`,
        title: data.title || file.name,
        type: data.type || "other",
        fileUrl: URL.createObjectURL(file), // In a real app, this would be the URL from the server
        fileSize: file.size / (1024 * 1024), // Convert bytes to MB
        fileType: file.type,
        uploadedBy: data.uploadedBy || "currentUser",
        uploadedAt: new Date().toISOString(),
        propertyId: data.propertyId,
        investmentId: data.investmentId,
        userId: data.userId,
        status: "pending",
        isPublic: data.isPublic || false,
        tags: data.tags || [],
      }

      // Update state
      setDocuments((prev) => [...prev, newDocument])

      successToast("Document uploaded successfully")
      return newDocument
    } catch (error) {
      console.error("Failed to upload document:", error)
      errorToast("Failed to upload document")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update document
  const updateDocument = async (id: string, data: Partial<Document>): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update document
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...data } : doc)))

      // Update selected document if it's the one being updated
      if (selectedDocument && selectedDocument.id === id) {
        setSelectedDocument((prev) => (prev ? { ...prev, ...data } : null))
      }

      successToast("Document updated successfully")
      return true
    } catch (error) {
      console.error("Failed to update document:", error)
      errorToast("Failed to update document")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete document
  const deleteDocument = async (id: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Delete document
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))

      // Clear selected document if it's the one being deleted
      if (selectedDocument && selectedDocument.id === id) {
        setSelectedDocument(null)
      }

      successToast("Document deleted successfully")
      return true
    } catch (error) {
      console.error("Failed to delete document:", error)
      errorToast("Failed to delete document")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verify document
  const verifyDocument = async (id: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update document
      const now = new Date().toISOString()
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                status: "verified",
                verifiedAt: now,
                verifiedBy: "currentAdmin",
                rejectionReason: undefined,
              }
            : doc,
        ),
      )

      // Update selected document if it's the one being verified
      if (selectedDocument && selectedDocument.id === id) {
        setSelectedDocument((prev) =>
          prev
            ? {
                ...prev,
                status: "verified",
                verifiedAt: now,
                verifiedBy: "currentAdmin",
                rejectionReason: undefined,
              }
            : null,
        )
      }

      successToast("Document verified successfully")
      return true
    } catch (error) {
      console.error("Failed to verify document:", error)
      errorToast("Failed to verify document")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reject document
  const rejectDocument = async (id: string, reason: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update document
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                status: "rejected",
                rejectionReason: reason,
                verifiedAt: undefined,
                verifiedBy: undefined,
              }
            : doc,
        ),
      )

      // Update selected document if it's the one being rejected
      if (selectedDocument && selectedDocument.id === id) {
        setSelectedDocument((prev) =>
          prev
            ? {
                ...prev,
                status: "rejected",
                rejectionReason: reason,
                verifiedAt: undefined,
                verifiedBy: undefined,
              }
            : null,
        )
      }

      successToast("Document rejected successfully")
      return true
    } catch (error) {
      console.error("Failed to reject document:", error)
      errorToast("Failed to reject document")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Download document
  const downloadDocument = async (id: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call to get the download URL
      await new Promise((resolve) => setTimeout(resolve, 500))

      const document = documents.find((doc) => doc.id === id)

      if (!document) {
        errorToast("Document not found")
        return false
      }

      // Simulate download by opening the URL in a new tab
      window.open(document.fileUrl, "_blank")

      successToast("Document download started")
      return true
    } catch (error) {
      console.error("Failed to download document:", error)
      errorToast("Failed to download document")
      return false
    }
  }

  // Share document
  const shareDocument = async (id: string, recipientEmail: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      successToast(`Document shared with ${recipientEmail}`)
      return true
    } catch (error) {
      console.error("Failed to share document:", error)
      errorToast("Failed to share document")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate contract
  const generateContract = async (propertyId: string, buyerId: string): Promise<Document | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new document
      const newDocument: Document = {
        id: `doc${documents.length + 1}`,
        title: `Purchase Contract - Property ${propertyId}`,
        type: "contract",
        fileUrl: "#", // In a real app, this would be the URL from the server
        fileSize: 1.5, // Mock size
        fileType: "application/pdf",
        uploadedBy: "system",
        uploadedAt: new Date().toISOString(),
        propertyId,
        userId: buyerId,
        status: "verified",
        verifiedAt: new Date().toISOString(),
        verifiedBy: "system",
        isPublic: false,
        tags: ["contract", "purchase", `property-${propertyId}`],
      }

      // Update state
      setDocuments((prev) => [...prev, newDocument])

      successToast("Contract generated successfully")
      return newDocument
    } catch (error) {
      console.error("Failed to generate contract:", error)
      errorToast("Failed to generate contract")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate deed
  const generateDeed = async (propertyId: string, buyerId: string): Promise<Document | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new document
      const newDocument: Document = {
        id: `doc${documents.length + 1}`,
        title: `Deed of Assignment - Property ${propertyId}`,
        type: "deed",
        fileUrl: "#", // In a real app, this would be the URL from the server
        fileSize: 2.0, // Mock size
        fileType: "application/pdf",
        uploadedBy: "system",
        uploadedAt: new Date().toISOString(),
        propertyId,
        userId: buyerId,
        status: "verified",
        verifiedAt: new Date().toISOString(),
        verifiedBy: "system",
        isPublic: false,
        tags: ["deed", "assignment", `property-${propertyId}`],
      }

      // Update state
      setDocuments((prev) => [...prev, newDocument])

      successToast("Deed generated successfully")
      return newDocument
    } catch (error) {
      console.error("Failed to generate deed:", error)
      errorToast("Failed to generate deed")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    documents,
    filteredDocuments,
    selectedDocument,
    filters,
    isLoading,
    isSubmitting,
    getDocuments,
    getDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
    verifyDocument,
    rejectDocument,
    downloadDocument,
    shareDocument,
    setFilters,
    clearFilters,
    selectDocument,
    generateContract,
    generateDeed,
  }

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>
}

// Custom hook to use the context
export function useDocuments() {
  const context = useContext(DocumentsContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider")
  }
  return context
}
