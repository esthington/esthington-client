"use client"

import { useParams } from "next/navigation"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <ResetPasswordForm  />
    </div>
  )
}
