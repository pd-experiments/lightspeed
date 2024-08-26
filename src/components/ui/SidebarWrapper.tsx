import { cn } from "@/lib/utils"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import { type NavItemType, Sidebar, type pageValidator } from "./Sidebar"
import type { z } from "zod"

export default function SidebarWrapper({
  children,
  defaultCollapsed = false,
  defaultOpenMenus,
  isLoading,
  navItems,
  isDevTools = false,
}: {
  children: ReactNode
  defaultCollapsed?: boolean
  defaultOpenMenus: Record<z.infer<typeof pageValidator>, boolean>
  isLoading: boolean
  navItems: NavItemType[]
  isDevTools?: boolean
}): ReactNode {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const handleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
    localStorage.setItem("sidebar-collapsed", (!isCollapsed).toString())
  }, [isCollapsed])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key === "e") {
        event.preventDefault()
        handleCollapse()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleCollapse])

  return (
    <div className="h-screen flex">
      <div
        className={cn(
          "flex-shrink-0 relative transition-all duration-200 ease-in-out",
          isCollapsed ? "w-14" : "w-[200px]",
          "hidden md:block",
        )}
      >
        <Sidebar
          isDevTools={isDevTools}
          items={navItems}
          isCollapsed={isCollapsed}
          isLoading={isLoading}
          toggleCollapse={handleCollapse}
          defaultOpenMenus={defaultOpenMenus}
        />
      </div>
      <div className={cn("flex-grow overflow-hidden", "block")}>{children}</div>
    </div>
  )
}
