import { FaFacebook, FaInstagram, FaTiktok, FaThreads, FaHeart, FaComment, FaShare } from 'react-icons/fa6';
import { AdVersion } from '@/components/create/testing/AdVersionGenerator';
import Image from 'next/image';

interface EmbedProps {
  version: AdVersion;
}

export const FacebookEmbed: React.FC<EmbedProps> = ({ version }) => (
  <div className="w-full border-2 border-black p-1 rounded-md">
    <div className="border rounded-md p-4 bg-white shadow-sm w-full">
        <div className="flex items-center mb-2">
        <FaFacebook className="text-blue-600 w-6 h-6 mr-2" />
        <span className="font-bold">Facebook Page</span>
        </div>
        <p className="text-sm mb-2">{version.textContent}</p>
        {version.images && version.images.length > 0 && (
        <img src={version.images[0]} alt="Ad visual" className="w-full h-auto rounded-md mb-2" />
        )}
        <div className="text-blue-600 text-sm">{version.hashtags.join(' ')}</div>
    </div>
  </div>
);

export const InstagramPostEmbed: React.FC<EmbedProps> = ({ version }) => (
    <div className="w-full border-2 border-black p-1 rounded-md">
      <div className="border rounded-md bg-white shadow-sm w-full">
        <div className="flex items-center p-2">
          <FaInstagram className="text-pink-600 w-6 h-6 mr-2" />
          <span className="font-bold">Instagram User</span>
        </div>
        <div className="aspect-square w-full bg-gray-200 relative">
          {version.images && version.images.length > 0 ? (
            <img 
              src={version.images[0]} 
              alt="Ad visual" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm mb-1">{version.textContent}</p>
          <div className="text-blue-600 text-sm">{version.hashtags.join(' ')}</div>
        </div>
      </div>
    </div>
  );

export const InstagramStoryEmbed: React.FC<EmbedProps> = ({ version }) => (
    <div className="border-2 border-black p-1 rounded-md max-w-sm">
        <div className="rounded-md bg-white shadow-sm w-full max-w-sm overflow-hidden">
        <div className="relative" style={{ paddingBottom: '177.78%' }}>
            <div className="absolute inset-0 bg-gray-500/50">
            {version.image && (
                <img src={version.image} alt="Story visual" className="w-full h-full object-cover" />
            )}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 border-2 border-white"></div>
                <span className="text-white text-sm font-semibold">Your story</span>
                <span className="text-white text-xs ml-2 opacity-75">11h</span>
            </div>
            <div className="absolute top-12 left-4 bg-black bg-opacity-50 px-2 py-1 rounded">
                <span className="text-white text-xs">See translation</span>
            </div>
            <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-lg font-semibold mb-1">{version.textContent}</p>
                <div className="text-white text-sm">{version.hashtags.join(' ')}</div>
            </div>
            <div className="absolute bottom-4 left-4">
                <span className="text-white text-sm">AM RHEIN, KÖLN</span>
            </div>
            </div>
        </div>
        <div className="bg-black p-2 flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex space-x-4">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaHeart className="text-white w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaComment className="text-white w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaShare className="text-white w-5 h-5" />
            </div>
            </div>
            <div className="flex-1 flex justify-end">
            <span className="text-white text-xs">More</span>
            </div>
        </div>
        </div>
    </div>
  );

export const InstagramReelEmbed: React.FC<EmbedProps> = ({ version }) => (
    <div className="border-2 border-black rounded-md bg-white shadow-sm w-full max-w-sm p-1">
      <div className="relative" style={{ paddingBottom: '177.78%' }}>
        <div className="absolute inset-0 bg-black flex flex-col">
          <div className="flex-grow flex items-center justify-center text-white">
            <span className="text-lg font-bold">Instagram Reel</span>
          </div>
          <div className="absolute top-2 right-2 space-y-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <FaHeart className="text-white w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <FaComment className="text-white w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <FaShare className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-white text-sm line-clamp-3">{version.textContent}</p>
            <div className="text-white text-xs">{version.hashtags.join(' ')}</div>
          </div>
        </div>
      </div>
      <div className="p-2 flex justify-between items-center bg-white">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
          <span className="text-xs font-semibold">@username</span>
        </div>
        <FaTiktok className="text-black w-5 h-5" />
      </div>
    </div>
);

export const TikTokEmbed: React.FC<EmbedProps> = ({ version }) => (
    <div className="border-2 border-black rounded-md bg-white shadow-sm w-full max-w-sm p-1">
      <div className="relative" style={{ paddingBottom: '177.78%' }}>
        <div className="absolute inset-0 bg-black flex flex-col">
          <div className="flex-grow flex items-center justify-center text-white">
            <span className="text-lg font-bold">TikTok Video</span>
          </div>
          <div className="absolute top-2 right-2 space-y-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <FaHeart className="text-white w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <FaComment className="text-white w-5 h-5" />
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <FaShare className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-white text-sm line-clamp-3">{version.textContent}</p>
            <div className="text-white text-xs">{version.hashtags.join(' ')}</div>
          </div>
        </div>
      </div>
      <div className="p-2 flex justify-between items-center bg-white">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
          <span className="text-xs font-semibold">@username</span>
        </div>
        <FaTiktok className="text-black w-5 h-5" />
      </div>
    </div>
  );

export const ThreadsEmbed: React.FC<EmbedProps> = ({ version }) => (
    <div className="w-full border-2 border-black p-1 rounded-md">
    <div className="border rounded-md p-4 bg-white shadow-sm w-full">
        <div className="flex items-center mb-2">
        <FaThreads className="text-black w-6 h-6 mr-2" />
        <span className="font-bold">Threads User</span>
        </div>
        <p className="text-sm mb-2">{version.textContent}</p>
        {version.images && version.images.length > 0 && (
        <img src={version.images[0]} alt="Ad visual" className="w-full h-auto rounded-md mb-2" />
        )}
        <div className="text-blue-600 text-sm">{version.hashtags.join(' ')}</div>
    </div>
  </div>
);