"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Download, Check, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import type { GeneratedDocument } from "@/lib/document-generator"

interface DocumentViewerProps {
  documents: GeneratedDocument[]
}

export default function DocumentViewer({ documents }: DocumentViewerProps) {
  const [activeDocId, setActiveDocId] = useState<string | null>(documents.length > 0 ? documents[0].id : null)

  const activeDocument = documents.find((doc) => doc.id === activeDocId) || null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "receipt":
        return <FileText className="h-5 w-5 text-green-500" />
      case "offer_letter":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "allocation":
        return <Check className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case "receipt":
        return "Payment Receipt"
      case "offer_letter":
        return "Offer Letter"
      case "allocation":
        return "Provisional Allocation"
      default:
        return "Document"
    }
  }

  return (
    <AnimatedCard className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generated Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`
                p-3 rounded-lg cursor-pointer transition-all flex items-center
                ${
                  activeDocId === doc.id
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800/80"
                }
              `}
              onClick={() => setActiveDocId(doc.id)}
            >
              <div className="mr-3 p-2 rounded-full bg-white dark:bg-gray-800">{getDocumentIcon(doc.type)}</div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{getDocumentTitle(doc.type)}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(doc.date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2">
          {activeDocument ? (
            <div className="border rounded-lg p-6 h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activeDocument.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generated on {formatDate(activeDocument.date)}
                  </p>
                </div>
                <Button variant="outline" className="flex items-center" asChild>
                  <a href={activeDocument.downloadUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg min-h-[200px] border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">{activeDocument.content}</p>

                {/* In a real app, this would be a PDF preview */}
                <div className="mt-6 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0.5, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-gray-500 dark:text-gray-400"
                  >
                    <FileText className="h-16 w-16 mx-auto mb-2 opacity-20" />
                    <p>Document preview would appear here</p>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Select a document to view</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedCard>
  )
}
