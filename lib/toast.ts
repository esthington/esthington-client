import { toast } from "sonner"
import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function showToast(message: string, type: ToastType = "info", options?: ToastOptions) {
  const { description, duration, action } = options || {}

  const icons = {
    success: `<Check className="h-4 w-4" />`,
    error: `<AlertCircle className="h-4 w-4" />`,
    info: `<Info className="h-4 w-4" />`,
    warning: `<AlertTriangle className="h-4 w-4" />`,
  }

  const toastFn = toast[type] || toast

  toastFn(message, {
    icon: icons[type],
    description,
    duration: duration || 4000,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  })
}

// Convenience methods
export const successToast = (message: string, options?: ToastOptions) => showToast(message, "success", options)

export const errorToast = (message: string, options?: ToastOptions) => showToast(message, "error", options)

export const infoToast = (message: string, options?: ToastOptions) => showToast(message, "info", options)

export const warningToast = (message: string, options?: ToastOptions) => showToast(message, "warning", options)
