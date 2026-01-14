"use client"

import { AppHeader } from "@/components/biz/AppHeader"
import { CodegenFilterContainer } from "@/components/biz/CodegenFilterContainer"
import { useState } from "react"
import { StackType } from "@/components/biz/CodegenList/interface"
import { useGetCodegenList } from "./server-store/selectors"
import { useFirstLoading } from "@/hooks/use-first-loading"
import { Skeleton } from "@/components/ui/skeleton"
import { CodegenList } from "@/components/biz/CodegenList"
import { useRouter } from "next/navigation"

export default function Codegen() {

  const [filters, setFilters] = useState<{
    pageSize: number
    selectedStack?: StackType | "All"
    searchKeyword?: string
  }>({
    pageSize: 10,
    selectedStack: undefined,
    searchKeyword: undefined,
  })

  const { fetchNextPage, isLoading, hasNextPage, data } = useGetCodegenList({
    pageSize: filters.pageSize,
    name: filters.searchKeyword,
    fullStack:
      filters.selectedStack === "All" ? undefined : filters.selectedStack,
  })

  const isFirstLoading = useFirstLoading(isLoading)

  const router = useRouter()


  const handleStackChange = (stack: StackType) => {
    setFilters(prev => ({
      ...prev,
      selectedStack: stack,
    }))
  }

  const handleSearchChange = (keyword: string) => {
    setFilters(prev => ({
      ...prev,
      searchKeyword: keyword,
    }))
  }

  const handleLoadMore = () => {
    fetchNextPage()
  }


  const handleItemClick = (id: string) => {
    router.push(`/main/codegen/${id}`)
  }

  return (
    <div>
      <AppHeader breadcrumbs={[{ label: "Codegen" }]} />
      <CodegenFilterContainer
        selectedStack={filters.selectedStack}
        onStackChange={handleStackChange}
        onSearchChange={handleSearchChange}
        onLoadMore={handleLoadMore}
        isLoading={isLoading}
        hasMore={hasNextPage}
      >
        {isFirstLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <CodegenList items={data?.data ?? []} onItemClick={handleItemClick} />
        )}
      </CodegenFilterContainer>
    </div>
  )
}