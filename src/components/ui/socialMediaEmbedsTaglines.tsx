import { FaFacebook, FaInstagram, FaTiktok, FaThreads } from 'react-icons/fa6';
import Image from 'next/image';

interface TaglineEmbedProps {
  platform: string;
  postText: string;
  postHashtags: string[];
  imageUrl?: string;
}

export const TaglineEmbed: React.FC<TaglineEmbedProps> = ({ platform, postText, postHashtags, imageUrl }) => {
  const PlatformIcon = getPlatformIcon(platform);

  return (
    <div className="w-full border rounded-md p-4 bg-white shadow-sm">
      <div className="flex items-center mb-2">
        <PlatformIcon className={`w-6 h-6 mr-2 ${getPlatformColor(platform)}`} />
        <span className="font-bold">{getPlatformName(platform)}</span>
      </div>
      <p className="text-sm mb-2">{postText}</p>
      {imageUrl && (
        <div className="mb-2">
          <Image 
            src={imageUrl}
            alt="Ad visual"
            width={400}
            height={300}
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}
      <div className={`text-sm my-2 ${getPlatformColor(platform)}`}>
        {postHashtags.join(' ')}
      </div>
    </div>
  );
};

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return FaFacebook;
    case 'instagram':
      return FaInstagram;
    case 'tiktok':
      return FaTiktok;
    case 'threads':
      return FaThreads;
    default:
      return FaFacebook;
  }
}

function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return 'text-blue-600';
    case 'instagram':
      return 'text-pink-600';
    case 'tiktok':
      return 'text-black';
    case 'threads':
      return 'text-black';
    default:
      return 'text-blue-600';
  }
}

function getPlatformName(platform: string) {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return 'Facebook Page';
    case 'instagram':
      return 'Instagram User';
    case 'tiktok':
      return 'TikTok User';
    case 'threads':
      return 'Threads User';
    default:
      return 'Social Media User';
  }
}