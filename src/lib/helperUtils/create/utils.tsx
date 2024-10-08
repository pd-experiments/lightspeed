import { FaFacebook, FaInstagram, FaTiktok, FaNewspaper } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { FaDemocrat, FaRepublican} from "react-icons/fa6";
import { Tv, Vote } from "lucide-react"
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

type PlatformChat = 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'connectedtv';

export function getPlatformIconChat(platform: PlatformChat, size: number = 4): React.ReactNode {
    switch (platform) {
      case 'facebook': return <FaFacebook className={`text-blue-500 w-${size} h-${size}`} />;
      case 'instagram': return <FaInstagram className={`text-blue-500 w-${size} h-${size}`} />;
      case 'tiktok': return <FaTiktok className={`text-blue-500 w-${size} h-${size}`} />;
      case 'threads': return <FaThreads className={`text-blue-500 w-${size} h-${size}`} />;
      case 'connectedtv': return <Tv className={`text-blue-500 w-${size} h-${size}`} />;
  }
}

export function getNewsIcon(provider: string, size: number = 4): React.ReactNode {
  switch (provider) {
    case 'CNN': return <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`w-${size} h-${size}`}><title>CNN</title><path d="M23.9962 15.514c0 2.0638-2.6676 3.0547-4.0789.6576-.1012-.173-2.3252-4.0032-2.3252-4.0032v3.3457c0 2.0637-2.6663 3.0546-4.0776.6575-.1025-.173-2.3253-4.0032-2.3253-4.0032v3.1547c0 1.4318-.8498 2.2073-2.1791 2.2073H5.5299a5.5299 5.5299 0 010-11.0598h1.7946v1.328H5.5299a4.2019 4.2019 0 100 8.4038h3.4494a.8973.8973 0 00.8794-.878V8.524a.2692.2692 0 01.1935-.273c.141-.0384.2897.0487.3987.2333l2.1522 3.7084c1.251 2.1573 2.0728 3.5738 2.083 3.5892.2807.4742.6986.5576.9973.4755a.7973.7973 0 00.582-.787v-6.945a.2705.2705 0 01.191-.2744c.1397-.0384.287.0487.3947.2333l1.9946 3.4366 2.242 3.8648c.2191.3717.5242.5038.7896.5038a.7691.7691 0 00.2063-.0282.7986.7986 0 00.591-.791V6.4707H24zM8.0026 13.9695V8.4857c0-2.0638 2.6675-3.0546 4.0788-.6563.1025.173 2.3253 4.002 2.3253 4.002V8.4856c0-2.0638 2.6662-3.0546 4.0775-.6563.1026.173 2.3253 4.002 2.3253 4.002V6.4705H22.14v8.9999a.2705.2705 0 01-.1935.2743c-.141.0384-.2897-.0487-.3987-.2333a1360.4277 1360.4277 0 01-2.2406-3.8622l-1.9946-3.434c-.2794-.4744-.696-.5577-.9921-.477a.7986.7986 0 00-.5833.7858v6.9464a.2718.2718 0 01-.1935.2743c-.1423.0384-.291-.0487-.3987-.2333-.0192-.032-1.069-1.8407-2.083-3.5892a6211.7971 6211.7971 0 00-2.1535-3.711c-.2794-.4755-.6973-.5575-.996-.4768a.7999.7999 0 00-.5845.7858v6.8002a.3717.3717 0 01-.3487.3474h-3.452a3.6712 3.6712 0 010-7.3424H7.322v1.328H5.5427a2.3432 2.3432 0 100 4.6864H7.636a.364.364 0 00.3666-.3705Z"/></svg>;
    case 'FOX': return <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`w-${size} h-${size}`}><title>FOX</title><path d="M3.069 9.7h3.42L6.3 6.932H0v10.136h3.069V13.8h2.789v-2.778H3.069ZM24 6.932h-3.291L19.48 9.1l-1.231-2.168h-3.292l2.871 5.076-2.871 5.06h3.308l1.215-2.142 1.213 2.142H24l-2.871-5.06Zm-12.592 0A5.067 5.067 0 1 0 16.475 12a5.067 5.067 0 0 0-5.067-5.065Zm.888 7.146a.867.867 0 0 1-.873.847.847.847 0 0 1-.837-.858V9.919a.882.882 0 0 1 .837-.9.913.913 0 0 1 .873.9Z"/></svg>;
    case 'NYT': return <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`w-${size} h-${size}`}><title>New York Times</title><path d="M21.272,14.815h-0.098c-0.747,2.049-2.335,3.681-4.363,4.483v-4.483l2.444-2.182l-2.444-2.182V7.397 c2.138,0.006,3.885-1.703,3.927-3.84c0-2.629-2.509-3.556-3.927-3.556c-0.367-0.007-0.734,0.033-1.091,0.12v0.131h0.556 c0.801-0.141,1.565,0.394,1.706,1.195C17.99,1.491,17.996,1.537,18,1.583c-0.033,0.789-0.7,1.401-1.488,1.367 c-0.02-0.001-0.041-0.002-0.061-0.004c-2.444,0-5.323-1.985-8.454-1.985C5.547,0.83,3.448,2.692,3.284,5.139 C3.208,6.671,4.258,8.031,5.76,8.346v-0.12C5.301,7.931,5.041,7.407,5.084,6.862c0.074-1.015,0.957-1.779,1.973-1.705 C7.068,5.159,7.08,5.16,7.091,5.161c2.629,0,6.872,2.182,9.501,2.182h0.098v3.142l-2.444,2.182l2.444,2.182v4.549 c-0.978,0.322-2.003,0.481-3.033,0.469c-1.673,0.084-3.318-0.456-4.614-1.516l4.429-1.985V7.451l-6.196,2.727 c0.592-1.75,1.895-3.168,3.589-3.905V6.175c-4.516,1.004-8.138,4.243-8.138,8.705c0,5.193,4.025,9.12,9.818,9.12 c6.011,0,8.727-4.363,8.727-8.814V14.815z M8.858,18.186c-1.363-1.362-2.091-3.235-2.007-5.16c-0.016-0.88,0.109-1.756,0.371-2.596 l2.051-0.938v8.476L8.858,18.186z"/></svg>;
    case 'Reuters': return <FaNewspaper className={`w-${size} h-${size}`} />;
  }
}

export function getPoliticalIcon(party: string, size: number=4): React.ReactNode {
  switch (party) {
    case 'Democrat': return <FaDemocrat className={`w-${size} h-${size}`} />;
    case 'Republican': return <FaRepublican className={`w-${size} h-${size}`} />;
    case 'Independent': return <Vote className={`w-${size} h-${size}`} />;
  }
}