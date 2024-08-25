import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { Platform } from "@/lib/types/customTypes";

export function getPlatformIcon(platform: Platform): React.ReactNode {
    switch (platform) {
      case 'Facebook': return <FaFacebook className="w-4 h-4" />;
      case 'Instagram Post':
      case 'Instagram Story':
      case 'Instagram Reel':
        return <FaInstagram className="w-4 h-4" />;
      case 'TikTok': return <FaTiktok className="w-4 h-4" />;
      case 'Threads': return <FaThreads className="w-4 h-4" />;
    }
  }
