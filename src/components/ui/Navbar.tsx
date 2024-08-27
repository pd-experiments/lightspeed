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
import { Beaker, Megaphone, Newspaper, PencilLine, Rocket, Sparkle, TextSelect } from "lucide-react"
import { Header } from "./Header"
import { useState, useEffect } from "react"

const navItems: NavItemType[] = [
  {
    icon: <HomeIcon className="w-6 h-6 text-black" />,
    label: "Home",
    href: "/",
  },
  {
    icon: <TextSelect className="w-6 h-6 text-yellow-700" />,
    label: "Research",
    subItems: [
      {
        icon: <MagnifyingGlassCircleIcon className="w-5 h-5 text-gray-600" />,
        label: "Search",
        href: "/research",
        newTab: false,
        beta: false,
      },
      {
        icon: <Newspaper className="w-5 h-5 text-gray-600" />,
        label: "Ads",
        href: "/research/ads",
        newTab: false,
        beta: false,
      },
      {
        icon: <Megaphone className="w-5 h-5 text-gray-600" />,
        label: "Conversations",
        href: "/research/conversations",
        newTab: false,
        beta: false,
      },
    ],
  },
  {
    icon: <PencilLine className="w-6 h-6 text-blue-500" />,
    label: "Create",
    subItems: [
      {
        icon: <BoltIcon className="w-5 h-5 text-gray-600" />,
        label: "Ideation",
        href: "/create/ideation",
        newTab: false,
        beta: false,
      },
      {
        icon: <Sparkle className="w-5 h-5 text-gray-600" />,
        label: "Generate",
        href: "/create/generate",
        newTab: false,
        beta: false,
      },
      {
        icon: <Beaker className="w-5 h-5 text-gray-600" />,
        label: "Testing",
        href: "/create/testing",
        newTab: false,
        beta: false,
      },
    ],
  },
  {
    icon: <Rocket className="w-6 h-6 text-purple-500"/>,
    label: "Deployments",
    href: "/deployment",
  },
]

export default function Navbar({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode | null {
  const router = useRouter();
  const [defaultCollapsed, setDefaultCollapsed] = useState<boolean | undefined>(undefined);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const collapsed = localStorage.getItem("sidebar-collapsed");
    const storedOpenMenus = localStorage.getItem("open-menus-real");

    setDefaultCollapsed(collapsed ? JSON.parse(collapsed) : undefined);
    setOpenMenus(storedOpenMenus ? JSON.parse(storedOpenMenus) : {});
  }, []);

  const handleOpenMenusChange = (newOpenMenus: Record<string, boolean>) => {
    setOpenMenus(newOpenMenus);
    localStorage.setItem("open-menus-real", JSON.stringify(newOpenMenus));
  };

  return (
    <div className="bg-neutral-100 antialiased relative overflow-hidden">
      <SidebarWrapper
        defaultCollapsed={defaultCollapsed}
        openMenus={openMenus}
        onOpenMenusChange={handleOpenMenusChange}
        isLoading={false}
        navItems={navItems}
      >
        <Header/>

        <main className="pb-4 px-4">
          <Card className="flex flex-col bg-background shadow p-0 overflow-hidden h-[calc(100vh-135px)] md:h-[calc(100vh-70px)] xs:h-[70svh]">
            <div className="flex-grow bg-gray-100 lg:p-14 overflow-y-scroll">
              {children}
            </div>
          </Card>
        </main>
      </SidebarWrapper>
    </div>
  )
}