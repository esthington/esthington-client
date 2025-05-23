"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProfileCompletionModal } from "./profile-completion-modal"

interface ProfileCompletionProviderProps {
  children: ReactNode
}

export function ProfileCompletionProvider({ children }: ProfileCompletionProviderProps) {
  const { user, isLoading } = useAuth()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Only show the modal if:
    // 1. User is loaded
    // 2. User is a buyer or agent
    // 3. Profile is incomplete
    if (
      !isLoading &&
      user &&
      (user.role === "buyer" ||
        user.role === "agent" ||
        user.role === "admin" ||
        user.role === "super_admin") &&
      (!user.firstName || !user.lastName)
    ) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user, isLoading])

  return (
    <>
      {children}
      {showModal && <ProfileCompletionModal />}
    </>
  )
}
