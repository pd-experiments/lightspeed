import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import SidebarWrapper from "./SidebarWrapper"
import { z } from "zod"
import {
  BoltIcon,
  HomeIcon,
  RectangleStackIcon,
  MagnifyingGlassCircleIcon,
} from "@heroicons/react/20/solid"
import { type NavItemType, pageValidator } from "./Sidebar"
import { Beaker, PencilLine, Rocket, Sparkle, TextSelect } from "lucide-react"
import { Header } from "./Header"

const navItems: NavItemType[] = [
  {
    icon: <HomeIcon className="w-4 h-4 fill-black" />,
    label: "Home",
    href: "/",
  },
  {
    icon: <TextSelect className="w-4 h-4 fill-status-yellow" />,
    label: "Research",
    subItems: [
      {
        icon: <MagnifyingGlassCircleIcon className="w-4 h-4 fill-gray-600" />,
        label: "Search",
        href: "/research",
        newTab: false,
        beta: false,
      },
      {
        icon: <RectangleStackIcon className="w-4 h-4 fill-gray-600" />,
        label: "Ads",
        href: "/research/ads",
        newTab: false,
        beta: false,
      },
    ],
  },
  {
    icon: <PencilLine className="w-4 h-4 fill-primary" />,
    label: "Create",
    subItems: [
      {
        icon: <BoltIcon className="w-4 h-4 text-gray-600" />,
        label: "Ideation",
        href: "/create/ideation",
        newTab: false,
        beta: false,
      },
      {
        icon: <Sparkle className="w-4 h-4 fill-gray-600" />,
        label: "Generate",
        href: "/create/generate",
        newTab: false,
        beta: false,
      },
      {
        icon: <Beaker className="w-4 h-4 fill-gray-600" />,
        label: "Testing",
        href: "/create/testing",
        newTab: false,
        beta: false,
      },
    ],
  },
  {
    icon: <Rocket className="w-4 h-4 fill-blue-500"/>,
    label: "Deployments",
    href: "/deployment",
  },
]

export default function Navbar({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode | null {
  const router = useRouter()

  const collapsed = localStorage.getItem("sidebar-collapsed")
  const openMenus = localStorage.getItem("open-menus-real")

  const defaultCollapsed = collapsed
    ? z.boolean().parse(JSON.parse(collapsed))
    : undefined

  const defaultOpenMenus = openMenus
    ? z.record(pageValidator, z.boolean()).parse(JSON.parse(openMenus))
    : {}

  return (
    <div className="bg-neutral-100 antialiased relative overflow-hidden">
      <SidebarWrapper
        defaultCollapsed={defaultCollapsed}
        defaultOpenMenus={defaultOpenMenus}
        isLoading={false}
        navItems={navItems}
      >
        <Header/>

        <main className="pb-4 px-4">
          <Card className="flex flex-col bg-background shadow p-0 overflow-hidden h-[calc(100vh-135px)] md:h-[calc(100vh-70px)] xs:h-[70svh]">
            <div className="flex-grow lg:p-14 px-5 py-5 overflow-scroll">
              {children}
            </div>
          </Card>
        </main>
      </SidebarWrapper>
    </div>
  )
}