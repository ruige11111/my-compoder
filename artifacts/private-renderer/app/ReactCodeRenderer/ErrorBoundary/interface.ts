import { ReactNode } from "react"
import { ErrorInfo } from "react"

export interface ErrorBoundaryProps {
    children: ReactNode
    onError: (errorMessage: string) => void
    files: {
      [key: string]: string
    }
  }
  
export interface ErrorBoundaryState {
    hasError: boolean
    errorMessage?: string | null
    errorInfo?: ErrorInfo | null
}