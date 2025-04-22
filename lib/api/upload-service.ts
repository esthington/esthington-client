import { apiConfigFile } from "./api-config-file"

export const UploadService = {
  uploadProfileImage: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await apiConfigFile.post("/users/profile-image", formData)
      return { success: true, imageUrl: response.data.imageUrl }
    } catch (error) {
      console.error("Profile image upload error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to upload profile image.",
      }
    }
  },

  uploadPropertyImages: async (propertyId: string, files: File[]) => {
    try {
      const formData = new FormData()

      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file)
      })

      const response = await apiConfigFile.post(`/properties/${propertyId}/images`, formData)
      return { success: true, images: response.data.images }
    } catch (error) {
      console.error("Property images upload error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to upload property images.",
      }
    }
  },

  uploadDocument: async (documentType: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append("document", file)
      formData.append("type", documentType)

      const response = await apiConfigFile.post("/documents/upload", formData)
      return { success: true, document: response.data.document }
    } catch (error) {
      console.error("Document upload error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to upload document.",
      }
    }
  },
}
