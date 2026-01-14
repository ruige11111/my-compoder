"use client"

import { LLMSelectorProvider } from "@/app/commons/LLMSelectorProvider"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ComponentDetailContainer } from "./container"

const InitialLoadingSkeleton = () => {
    return (
      <div className="h-screen">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-1/6" />
          <Skeleton className="h-8 w-1/4" />
          <div className="flex gap-4">
            <Skeleton className="h-[calc(100vh-12rem)] w-1/2" />
            <Skeleton className="h-[calc(100vh-12rem)] w-1/2" />
            <Skeleton className="h-[calc(100vh-12rem)] w-1/2" />
          </div>
        </div>
      </div>
    )
}

export default function ComponentPage() {
  return (
    <LLMSelectorProvider>
      <Suspense fallback={<InitialLoadingSkeleton />}>
        <ComponentDetailContainer />
      </Suspense>
    </LLMSelectorProvider>
  )
}