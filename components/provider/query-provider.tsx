"use client"

import { type ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

interface QueryProviderProps {
    children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                  queries: {
                    retry: false,
                    staleTime: 200,
                    refetchOnWindowFocus: false,
                  },
                },
            }),
    )

    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}