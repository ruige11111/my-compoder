import { useState, useEffect } from "react"

export function useFirstLoading(isLoading: boolean): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(true)

  useEffect(() => {
    if (shouldShowLoading && !isLoading) {
      setShouldShowLoading(false)
    }
  }, [isLoading, shouldShowLoading])

  return shouldShowLoading && isLoading
}