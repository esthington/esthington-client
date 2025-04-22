"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { successToast, errorToast } from "@/lib/toast"

// Types for verification
export type VerificationType = "identity" | "address" | "bank" | "business" | "phone" | "email"

export type VerificationStatus = "pending" | "verified" | "rejected" | "expired"

export type VerificationDocument = {
  id: string
  type: VerificationType
  documentType: string
  documentNumber?: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
  expiryDate?: string
  status: VerificationStatus
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
}

export type VerificationRequest = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  userAvatar?: string
  types: VerificationType[]
  status: VerificationStatus
  documents: VerificationDocument[]
  submittedAt: string
  updatedAt: string
  completedAt?: string
  notes?: string
}

// Context type
type VerificationContextType = {
  // State
  verificationStatus: Record<VerificationType, VerificationStatus>
  verificationDocuments: VerificationDocument[]
  verificationRequests: VerificationRequest[]
  activeRequest: VerificationRequest | null
  isLoading: boolean
  isSubmitting: boolean

  // User actions
  getVerificationStatus: () => Promise<Record<VerificationType, VerificationStatus>>
  getVerificationDocuments: () => Promise<VerificationDocument[]>
  uploadDocument: (
    type: VerificationType,
    documentType: string,
    file: File,
    documentNumber?: string,
    expiryDate?: string,
  ) => Promise<VerificationDocument | null>
  submitVerificationRequest: (types: VerificationType[]) => Promise<boolean>

  // Admin actions
  getVerificationRequests: (status?: VerificationStatus) => Promise<VerificationRequest[]>
  getVerificationRequest: (id: string) => Promise<VerificationRequest | null>
  approveVerification: (requestId: string, documentIds: string[]) => Promise<boolean>
  rejectVerification: (requestId: string, documentIds: string[], reason: string) => Promise<boolean>
  addVerificationNote: (requestId: string, note: string) => Promise<boolean>
}

// Mock data
const mockVerificationDocuments: VerificationDocument[] = [
  {
    id: "doc1",
    type: "identity",
    documentType: "National ID",
    documentNumber: "12345678",
    fileUrl: "#",
    fileType: "image/jpeg",
    fileSize: 1.5, // MB
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    status: "verified",
    verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    verifiedBy: "admin1",
  },
  {
    id: "doc2",
    type: "address",
    documentType: "Utility Bill",
    fileUrl: "#",
    fileType: "application/pdf",
    fileSize: 2.1,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "pending",
  },
  {
    id: "doc3",
    type: "bank",
    documentType: "Bank Statement",
    fileUrl: "#",
    fileType: "application/pdf",
    fileSize: 3.2,
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    status: "rejected",
    rejectionReason: "Document is not clear. Please upload a clearer version.",
  },
]

const mockVerificationRequests: VerificationRequest[] = [
  {
    id: "req1",
    userId: "user123",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    userPhone: "+234 123 456 7890",
    userAvatar: "/placeholder.svg?height=40&width=40",
    types: ["identity", "address"],
    status: "pending",
    documents: mockVerificationDocuments.slice(0, 2),
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "req2",
    userId: "user456",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    userPhone: "+234 987 654 3210",
    userAvatar: "/placeholder.svg?height=40&width=40",
    types: ["bank"],
    status: "rejected",
    documents: [mockVerificationDocuments[2]],
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    notes: "Document rejected due to poor quality. Please resubmit.",
  },
  {
    id: "req3",
    userId: "user789",
    userName: "Robert Johnson",
    userEmail: "robert.johnson@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    types: ["identity", "address", "bank"],
    status: "verified",
    documents: [],
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
  },
]

// Create context
const VerificationContext = createContext<VerificationContextType | undefined>(undefined)

// Provider component
export function VerificationProvider({ children }: { children: ReactNode }) {
  const [verificationStatus, setVerificationStatus] = useState<Record<VerificationType, VerificationStatus>>({
    identity: "pending",
    address: "pending",
    bank: "pending",
    business: "pending",
    phone: "pending",
    email: "pending",
  })
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocument[]>([])
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [activeRequest, setActiveRequest] = useState<VerificationRequest | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize verification data
  useEffect(() => {
    const initVerification = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Set mock data for current user
        setVerificationDocuments(mockVerificationDocuments)

        // Set verification status based on documents
        const status: Record<VerificationType, VerificationStatus> = {
          identity: "pending",
          address: "pending",
          bank: "pending",
          business: "pending",
          phone: "pending",
          email: "pending",
        }

        mockVerificationDocuments.forEach((doc) => {
          status[doc.type] = doc.status
        })

        setVerificationStatus(status)

        // Set verification requests (for admin)
        setVerificationRequests(mockVerificationRequests)
      } catch (error) {
        console.error("Failed to initialize verification data:", error)
        errorToast("Failed to load verification data")
      } finally {
        setIsLoading(false)
      }
    }

    initVerification()
  }, [])

  // Get verification status
  const getVerificationStatus = async (): Promise<Record<VerificationType, VerificationStatus>> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      return verificationStatus
    } catch (error) {
      console.error("Failed to get verification status:", error)
      errorToast("Failed to load verification status")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get verification documents
  const getVerificationDocuments = async (): Promise<VerificationDocument[]> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      return verificationDocuments
    } catch (error) {
      console.error("Failed to get verification documents:", error)
      errorToast("Failed to load verification documents")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Upload document
  const uploadDocument = async (
    type: VerificationType,
    documentType: string,
    file: File,
    documentNumber?: string,
    expiryDate?: string,
  ): Promise<VerificationDocument | null> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to upload the file
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new document
      const newDocument: VerificationDocument = {
        id: `doc${Date.now()}`,
        type,
        documentType,
        documentNumber,
        fileUrl: URL.createObjectURL(file), // In a real app, this would be the URL from the server
        fileType: file.type,
        fileSize: file.size / (1024 * 1024), // Convert bytes to MB
        uploadedAt: new Date().toISOString(),
        expiryDate,
        status: "pending",
      }

      // Update state
      setVerificationDocuments((prev) => [...prev, newDocument])

      // Update verification status
      setVerificationStatus((prev) => ({
        ...prev,
        [type]: "pending",
      }))

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

  // Submit verification request
  const submitVerificationRequest = async (types: VerificationType[]): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if documents exist for all requested types
      const missingTypes = types.filter((type) => !verificationDocuments.some((doc) => doc.type === type))

      if (missingTypes.length > 0) {
        errorToast(`Missing documents for: ${missingTypes.join(", ")}`)
        return false
      }

      // Create new request
      const newRequest: VerificationRequest = {
        id: `req${Date.now()}`,
        userId: "currentUser", // In a real app, this would be the current user's ID
        userName: "Current User", // In a real app, this would be the current user's name
        userEmail: "current.user@example.com", // In a real app, this would be the current user's email
        userAvatar: "/placeholder.svg?height=40&width=40",
        types,
        status: "pending",
        documents: verificationDocuments.filter((doc) => types.includes(doc.type)),
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update state (in a real app, this would be handled by the server)
      setVerificationRequests((prev) => [...prev, newRequest])

      successToast("Verification request submitted successfully")
      return true
    } catch (error) {
      console.error("Failed to submit verification request:", error)
      errorToast("Failed to submit verification request")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get verification requests (admin only)
  const getVerificationRequests = async (status?: VerificationStatus): Promise<VerificationRequest[]> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Filter by status if provided
      if (status) {
        return verificationRequests.filter((req) => req.status === status)
      }

      return verificationRequests
    } catch (error) {
      console.error("Failed to get verification requests:", error)
      errorToast("Failed to load verification requests")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Get verification request by ID (admin only)
  const getVerificationRequest = async (id: string): Promise<VerificationRequest | null> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      const request = verificationRequests.find((req) => req.id === id) || null
      setActiveRequest(request)
      return request
    } catch (error) {
      console.error("Failed to get verification request:", error)
      errorToast("Failed to load verification request")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Approve verification (admin only)
  const approveVerification = async (requestId: string, documentIds: string[]): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update documents
      const now = new Date().toISOString()
      const updatedDocuments = verificationDocuments.map((doc) =>
        documentIds.includes(doc.id)
          ? {
              ...doc,
              status: "verified" as VerificationStatus,
              verifiedAt: now,
              verifiedBy: "currentAdmin",
              rejectionReason: undefined,
            }
          : doc,
      )

      setVerificationDocuments(updatedDocuments)

      // Update request
      const request = verificationRequests.find((req) => req.id === requestId)

      if (request) {
        // Check if all documents in the request are verified
        const allVerified = request.documents.every((doc) => documentIds.includes(doc.id) || doc.status === "verified")

        const updatedRequest: VerificationRequest = {
          ...request,
          status: allVerified ? "verified" : "pending",
          documents: request.documents.map((doc) =>
            documentIds.includes(doc.id)
              ? {
                  ...doc,
                  status: "verified",
                  verifiedAt: now,
                  verifiedBy: "currentAdmin",
                  rejectionReason: undefined,
                }
              : doc,
          ),
          updatedAt: now,
          completedAt: allVerified ? now : undefined,
        }

        setVerificationRequests((prev) => prev.map((req) => (req.id === requestId ? updatedRequest : req)))

        // Update active request if it's the one being approved
        if (activeRequest && activeRequest.id === requestId) {
          setActiveRequest(updatedRequest)
        }
      }

      // Update verification status for the user
      const updatedStatus = { ...verificationStatus }

      updatedDocuments.forEach((doc) => {
        if (doc.status === "verified") {
          updatedStatus[doc.type] = "verified"
        }
      })

      setVerificationStatus(updatedStatus)

      successToast("Verification approved successfully")
      return true
    } catch (error) {
      console.error("Failed to approve verification:", error)
      errorToast("Failed to approve verification")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reject verification (admin only)
  const rejectVerification = async (requestId: string, documentIds: string[], reason: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update documents
      const now = new Date().toISOString()
      const updatedDocuments = verificationDocuments.map((doc) =>
        documentIds.includes(doc.id)
          ? {
              ...doc,
              status: "rejected" as VerificationStatus,
              rejectionReason: reason,
              verifiedAt: undefined,
              verifiedBy: undefined,
            }
          : doc,
      )

      setVerificationDocuments(updatedDocuments)

      // Update request
      const request = verificationRequests.find((req) => req.id === requestId)

      if (request) {
        const updatedRequest: VerificationRequest = {
          ...request,
          status: "rejected",
          documents: request.documents.map((doc) =>
            documentIds.includes(doc.id)
              ? {
                  ...doc,
                  status: "rejected",
                  rejectionReason: reason,
                  verifiedAt: undefined,
                  verifiedBy: undefined,
                }
              : doc,
          ),
          updatedAt: now,
          completedAt: now,
          notes: reason,
        }

        setVerificationRequests((prev) => prev.map((req) => (req.id === requestId ? updatedRequest : req)))

        // Update active request if it's the one being rejected
        if (activeRequest && activeRequest.id === requestId) {
          setActiveRequest(updatedRequest)
        }
      }

      // Update verification status for the user
      const updatedStatus = { ...verificationStatus }

      updatedDocuments.forEach((doc) => {
        if (documentIds.includes(doc.id)) {
          updatedStatus[doc.type] = "rejected"
        }
      })

      setVerificationStatus(updatedStatus)

      successToast("Verification rejected successfully")
      return true
    } catch (error) {
      console.error("Failed to reject verification:", error)
      errorToast("Failed to reject verification")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add verification note (admin only)
  const addVerificationNote = async (requestId: string, note: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update request
      setVerificationRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                notes: req.notes ? `${req.notes}\n${note}` : note,
                updatedAt: new Date().toISOString(),
              }
            : req,
        ),
      )

      // Update active request if it's the one being updated
      if (activeRequest && activeRequest.id === requestId) {
        setActiveRequest((prev) =>
          prev
            ? {
                ...prev,
                notes: prev.notes ? `${prev.notes}\n${note}` : note,
                updatedAt: new Date().toISOString(),
              }
            : null,
        )
      }

      successToast("Note added successfully")
      return true
    } catch (error) {
      console.error("Failed to add note:", error)
      errorToast("Failed to add note")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    verificationStatus,
    verificationDocuments,
    verificationRequests,
    activeRequest,
    isLoading,
    isSubmitting,
    getVerificationStatus,
    getVerificationDocuments,
    uploadDocument,
    submitVerificationRequest,
    getVerificationRequests,
    getVerificationRequest,
    approveVerification,
    rejectVerification,
    addVerificationNote,
  }

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>
}

// Custom hook to use the context
export function useVerification() {
  const context = useContext(VerificationContext)
  if (context === undefined) {
    throw new Error("useVerification must be used within a VerificationProvider")
  }
  return context
}
