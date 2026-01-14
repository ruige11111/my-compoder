import { useEffect, useState } from "react"

export function useShowOnFirstData<T>(data: T[] | undefined): boolean {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (!shouldShow) {
      setShouldShow(!!data?.length)
    }
  }, [data, shouldShow])

  return shouldShow
}