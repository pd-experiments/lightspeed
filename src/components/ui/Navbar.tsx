"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  VideoIcon,
  CloudLightningIcon,
  PencilRuler,
  CheckCircleIcon,
  FileText,
  User2Icon,
  Megaphone,
  Settings,
  Menu,
  X,
  Dot,
  PencilLine
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { FaBinoculars } from "react-icons/fa";

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                {isDevMode && (
                  <>
                    <motion.div
                      className={`flex items-center px-3 py-2 rounded-md`}
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                      animate={{
                        backgroundColor: "rgba(0, 0, 0, 0)",
                      }}
                    >
                      <User2Icon className="w-4 h-4 mr-2" />
                      Research
                    </motion.div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <NavItem
                        href="/research/adsearch"
                        icon={<Dot className="w-4 h-4 mr-2" />}
                        text="Ad Search"
                        isActive={pathname === '/research/adsearch'}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      />
                      <NavItem
                        href="/research/ads"
                        icon={<Dot className="w-4 h-4 mr-2" />}
                        text="Ads"
                        isActive={pathname === '/research/ads'}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      />
                      <NavItem
                        href="/research/conversations"
                        icon={<Dot className="w-4 h-4 mr-2" />}
                        text="Conversations"
                        isActive={pathname === '/research/conversations'}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      />
                    </div>

                    <motion.div
                      className={`flex items-center px-3 py-2 rounded-md`}
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                      animate={{
                        backgroundColor: "rgba(0, 0, 0, 0)",
                      }}
                    >
                      <PencilLine className="w-4 h-4 mr-2" />
                      Create
                    </motion.div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <NavItem
                        href="/create/clipsearch"
                        icon={<Dot className="w-4 h-4 mr-2" />}
                        text="Clip Search"
                        isActive={pathname === '/create/clipsearch'}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      />
                      <NavItem
                        href="/create/outline"
                        icon={<Dot className="w-4 h-4 mr-2" />}
                        text="Outline"
                        isActive={pathname === '/create/outline'}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      />
                      <NavItem
                        href="/create/compliance"
                        icon={<Dot className="w-4 h-4 mr-2" />}
                        text="Compliance"
                        isActive={pathname === '/create/compliance'}
                        onClick={() => isMobile && setIsMenuOpen(false)}
                      />
                    </div>

                    <motion.div
                      className={`flex items-center px-3 py-2 rounded-md`}
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                      animate={{
                        backgroundColor: "rgba(0, 0, 0, 0)",
                      }}
                    >
                      <FaBinoculars className="w-4 h-4 mr-2" />
                      Insights
                    </motion.div>
                  </>
                )}
                {/* <NavItem
                  href="/directory"
                  icon={<VideoIcon className="w-4 h-4 mr-2" />}
                  text="Directory"
                  isActive={pathname === "/directory"}
                  onClick={() => isMobile && setIsMenuOpen(false)}
                /> */}

                {isDevMode && (
                  <>
                    <hr />
                    <div className="text-xs text-gray-500 my-2">DEV MODE</div>
                    <NavItem
                      href="/todo"
                      icon={<CheckCircleIcon className="w-4 h-4 mr-2" />}
                      text="Todo"
                      isActive={pathname === "/todo"}
                      onClick={() => isMobile && setIsMenuOpen(false)}
                    />
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
        <main className={`flex-1 p-8 bg-gray-100 overflow-y-auto ${isMobile ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ href, icon, text, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href} className="block" onClick={onClick}>
      <motion.div
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive ? "bg-gray-100" : ""
        }`}
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
        animate={{
          backgroundColor: isActive ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0)",
        }}
      >
        {icon}
        {text}
      </motion.div>
    </Link>
  );
}