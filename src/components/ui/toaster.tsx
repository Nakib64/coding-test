"use client"

import * as React from "react"
import { Toast } from "./toast"

export type ToastMessage = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToasterContextType {
  toasts: ToastMessage[]
  toast: (message: Omit<ToastMessage, "id">) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within ToasterProvider")
  }
  return context
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const toast = React.useCallback((message: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...message, id }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, toast }}>
      {children}
      <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

