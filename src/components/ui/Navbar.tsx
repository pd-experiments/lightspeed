import { Accessibility, Search, BookOpenIcon, VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Accessibility className="w-8 h-8 mr-2" />
          <h2 className="text-2xl font-semibold">lightspeed</h2>
        </Link>
        <div className="ml-8 flex items-center">
          <NavItem href="/directory" icon={<VideoIcon className="w-4 h-4 mr-2" />} text="Directory" isActive={pathname === '/directory'} />
          <NavItem href="/clipsearch" icon={<Search className="w-4 h-4 mr-2" />} text="Clip Search" isActive={pathname === '/clip-search'} />
          <NavItem href="/outline" icon={<BookOpenIcon className="w-4 h-4 mr-2" />} text="Outline" isActive={pathname === '/outline'} />
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
}

function NavItem({ href, icon, text, isActive }: NavItemProps) {
  return (
    <Link href={href} className="relative mr-4">
      <motion.div
        className={`flex items-center px-3 py-2 rounded-md ${isActive ? 'bg-gray-100' : ''}`}
        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        animate={{ backgroundColor: isActive ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0)' }}
      >
        {icon}
        {text}
      </motion.div>
    </Link>
  );
}