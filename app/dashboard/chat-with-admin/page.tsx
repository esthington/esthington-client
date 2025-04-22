"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ChatWithAdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to WhatsApp
    window.open("https://wa.me/1234567890?text=Hello%20Esthington%20Support,%20I%20need%20assistance.", "_blank")
    // Go back to dashboard
    router.push("/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to WhatsApp...</h1>
        <p className="text-gray-500">If you are not redirected automatically, please click the button below.</p>
        <button
          onClick={() =>
            window.open(
              "https://wa.me/1234567890?text=Hello%20Esthington%20Support,%20I%20need%20assistance.",
              "_blank",
            )
          }
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Open WhatsApp
        </button>
      </div>
    </div>
  )
}
