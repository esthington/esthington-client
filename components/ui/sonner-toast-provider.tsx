"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function SonnerToastProvider() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? "hsl(var(--background))" : "white",
          color: isDark ? "hsl(var(--foreground))" : "black",
          border: "1px solid hsl(var(--border))",
        },
        className: "sonner-toast",
        descriptionClassName: "text-muted-foreground text-sm",
      }}
      closeButton
      richColors
    />
  )
}
