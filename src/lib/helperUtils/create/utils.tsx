import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { Platform } from "@/lib/types/customTypes";

export function getPlatformIcon(platform: Platform, size: number = 4): React.ReactNode {
    switch (platform) {
      case 'Facebook': return <FaFacebook className={`w-${size} h-${size}`} />;
      case 'Instagram Post':
      case 'Instagram Story':
      case 'Instagram Reel':
        return <FaInstagram className={`w-${size} h-${size}`} />;
      case 'TikTok': return <FaTiktok className={`w-${size} h-${size}`} />;
      case 'Threads': return <FaThreads className={`w-${size} h-${size}`} />;
    }
  }
