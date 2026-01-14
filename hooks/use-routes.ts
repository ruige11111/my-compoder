import { usePathname } from "next/navigation"
import { SquareTerminal } from "lucide-react"

export const routes = [
    {
      title: "Codegen",
      url: "/main/codegen",
      icon: SquareTerminal,
    }
]

export default function useRoutes() {
  const pathname = usePathname()
  return routes.map(route => ({
    ...route,
    isActive: pathname.startsWith(route.url),
  }))
}