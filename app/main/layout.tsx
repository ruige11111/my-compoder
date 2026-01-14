"use client"

import { AppSidebarLayout } from "@/components/biz/AppSidebarLayout"
import useRoutes from "@/hooks/use-routes"
import { type NavMainItem } from "@/components/biz/AppSidebarLayout/interface"
import { signOut, useSession } from "next-auth/react"
import { useCallback } from "react"
import {
  useProviderModelModal,
} from "@/app/commons/ProviderModelModal"
import { useEffect } from "react"
import { redirect } from "next/navigation"

function MainLayoutContent({
    children,
    user,
  }: {
    children: React.ReactNode
    user: {
      name: string
      email: string
      avatar: string
    }
  }) {
  const routes = useRoutes()

  const { openModal } = useProviderModelModal()

  const handleNavItemClick = useCallback(
    (url: string) => {
      if (url === "/main/settings") {
        openModal()
        return true
      }
      return false
    },
    [openModal],
  )

    return (
        <AppSidebarLayout
            navMain={routes as NavMainItem[]}
            user={user}
            onLogout={signOut}
            onNavItemClick={handleNavItemClick}
        >
            {children}
        </AppSidebarLayout>
    )
  }

export default function MainLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const { data, status } = useSession()

    const user = {
      name: data?.user?.name || "",
      email: data?.user?.email || "",
      avatar: data?.user?.image || "",
    }

    useEffect(() => {
      if (status === "unauthenticated") {
        redirect("/login")
      }
    }, [status])

    return (
      <MainLayoutContent user={user}>{children}</MainLayoutContent>
    )
  }