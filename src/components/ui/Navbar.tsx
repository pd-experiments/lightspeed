"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  CloudLightningIcon,
  CheckCircleIcon,
  User2Icon,
  Settings,
  Menu,
  X,
  Dot,
  PencilLine,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { FaBinoculars } from "react-icons/fa";

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Research",
    icon: <User2Icon className="w-4 h-4 mr-2" />,
    subItems: [
      { title: "Ad Search", icon: <Dot className="w-4 h-4 mr-2" />, href: "/research/adsearch" },
      { title: "Ads", icon: <Dot className="w-4 h-4 mr-2" />, href: "/research/ads" },
      { title: "Conversations", icon: <Dot className="w-4 h-4 mr-2" />, href: "/research/conversations" },
    ],
  },
  {
    title: "Create",
    icon: <PencilLine className="w-4 h-4 mr-2" />,
    subItems: [
      { title: "Ideate", icon: <Dot className="w-4 h-4 mr-2" />, href: "/create/ideation" },
      { title: "Generate & Test", icon: <Dot className="w-4 h-4 mr-2" />, href: "/create/testing" },
      { title: "Deploy", icon: <Dot className="w-4 h-4 mr-2" />, href: "/create/deployment" },
      { title: "Clip Search", icon: <Dot className="w-4 h-4 mr-2" />, href: "/create/clipsearch" },
      { title: "Television", icon: <Dot className="w-4 h-4 mr-2" />, href: "/create/television" },
      { title: "Compliance", icon: <Dot className="w-4 h-4 mr-2" />, href: "/create/compliance" },
    ],
  },
  {
    title: "Insights",
    icon: <FaBinoculars className="w-4 h-4 mr-2" />,
    subItems: [],
  },
];

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initialOpenMenus = navItems.reduce((acc, item) => {
      acc[item.title] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setOpenMenus(initialOpenMenus);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleExpanded = useCallback((title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }, []);

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item, index) => (
      <div key={index} className={`ml-${level * 4}`}>
        {item.href ? (
          <Link href={item.href} className="block">
            <motion.div
              className={`flex items-center px-3 py-2 rounded-md ${
                pathname === item.href ? "bg-gray-100" : ""
              }`}
              whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
              animate={{
                backgroundColor: pathname === item.href ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0)",
              }}
              onClick={() => isMobile && setIsMenuOpen(false)}
            >
              {item.icon}
              {item.title}
            </motion.div>
          </Link>
        ) : (
          <div>
            <motion.div
              className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer"
              whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
              onClick={() => toggleExpanded(item.title)}
            >
              <div className="flex items-center">
                {item.icon}
                <span>{item.title}</span>
              </div>
              {item.subItems && item.subItems.length > 0 && (
                openMenus[item.title] ?? false ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </motion.div>
            <AnimatePresence initial={false}>
              {/* {(openMenus[item.title] ?? false) && item.subItems && ( */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {renderNavItems(item.subItems, level + 1)}
                </motion.div>
              {/* )} */}
            </AnimatePresence>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-white z-30">
        <Link href="/" className="flex items-center">
          <CloudLightningIcon className="w-8 h-8 mr-2" />
          <h2 className="text-2xl font-semibold">lightspeed ads</h2>
        </Link>
        <div className="flex items-center">
          <Settings className="w-6 h-6 mr-4 cursor-pointer" />
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <button onClick={toggleMenu} className="ml-4 md:hidden">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>
      <div className="flex pt-16 flex-1">
        <AnimatePresence>
          {(isMenuOpen || !isMobile) && (
            <motion.nav
              initial={isMobile ? { y: -500 } : { x: -300 }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: -500 } : { x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`bg-white shadow-sm p-4 z-20 ${
                isMobile
                  ? "fixed top-16 left-0 right-0 bottom-0 overflow-y-auto"
                  : "w-64 fixed top-16 bottom-0 left-0 overflow-y-auto"
              }`}
            >
              <div className="flex flex-col space-y-2">
                {isDevMode && renderNavItems(navItems)}
                {isDevMode && (
                  <>
                    <hr className="my-2 border-gray-200" />
                    <div className="text-xs text-gray-500 my-2">DEV MODE</div>
                    <Link href="/todo" className="block">
                      <motion.div
                        className={`flex items-center px-3 py-2 rounded-md ${
                          pathname === "/todo" ? "bg-gray-100" : ""
                        }`}
                        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                        animate={{
                          backgroundColor: pathname === "/todo" ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0)",
                        }}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Todo
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
        <main className={`flex-1 p-8 bg-gray-100 overflow-y-auto ${isMobile ? 'w-full' : 'ml-64'} rounded-tl-3xl`}>
          {children}
        </main>
      </div>
    </div>
  );
}