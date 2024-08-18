'use client';

import { Search, VideoIcon, CloudLightningIcon, FileStackIcon, PencilRuler, CloudCog, LucideSwitchCamera, CheckCircleIcon, FileText, User2Icon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <CloudLightningIcon className="w-8 h-8 mr-2" />
          <h2 className="text-2xl font-semibold">lightspeed</h2>
        </Link>
        <div className="ml-8 flex items-center">
          <NavItem href="/directory" icon={<VideoIcon className="w-4 h-4 mr-2" />} text="Directory" isActive={pathname === '/directory'} />
          <NavItem href="/clipsearch" icon={<Search className="w-4 h-4 mr-2" />} text="Clip Search" isActive={pathname === '/clipsearch'} />
          <NavItem href="/outline" icon={<PencilRuler className="w-4 h-4 mr-2" />} text="Outline" isActive={pathname === '/outline'} />
          <NavItem href="/compliance" icon={<FileText className="w-4 h-4 mr-2" />} text="Compliance" isActive={pathname === '/compliance'} />
          
          {isDevMode && (
            <>
            <NavItem href="/personalization" icon={<User2Icon className="w-4 h-4 mr-2" />} text="Personalization (DEVMODE)" isActive={pathname === '/personalization'} />
            <NavItem href="/todo" icon={<CheckCircleIcon className="w-4 h-4 mr-2" />} text="Todo (DEVMODE)" isActive={pathname === '/todo'} />
            </>
          )}

          {/* throwing some ideas here */}
          {/* <NavItem href="/" icon={<FileStackIcon className="w-4 h-4 mr-2" />} text="Pipeline (TBD)" isActive={pathname === '/'} />
          <NavItem href="/" icon={<CloudCog className="w-4 h-4 mr-2" />} text="Airtime (TBD)" isActive={pathname === '/'} />
          <NavItem href="/" icon={<LucideSwitchCamera className="w-4 h-4 mr-2" />} text="Testing (TBD)" isActive={pathname === '/'} /> */}
        </div>
      </div>
    </nav>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  color?: string;
}

function NavItem({ href, icon, text, isActive, color }: NavItemProps) {
  return (
    <Link href={href} className="relative mr-4">
      <motion.div
        className={`flex items-center px-3 py-2 rounded-md ${isActive ? 'bg-gray-100' : ''} ${color}`}
        whileHover={{ backgroundColor: color ? color : 'rgba(0, 0, 0, 0.05)' }}
        animate={{ backgroundColor: isActive ? 'rgba(0, 0, 0, 0.05)' : color ? color : 'rgba(0, 0, 0, 0)' }}
      >
        {icon}
        {text}
      </motion.div>
    </Link>
  );
}