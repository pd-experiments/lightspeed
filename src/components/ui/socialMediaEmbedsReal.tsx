import { FaFacebook, FaInstagram, FaTiktok, FaThreads, FaHeart, FaComment, FaShare } from 'react-icons/fa6';
import { FaNewspaper } from 'react-icons/fa';
import { TikTok, Threads, News, Ads } from '@/lib/types/customTypes';
import { Newspaper } from 'lucide-react';

interface TikTokEmbedProps {
  data: TikTok;
}

interface ThreadsEmbedProps {
  data: Threads;
}

interface NewsEmbedProps {
  data: News;
}

interface AdEmbedProps {
  data: Ads;
}

export const TikTokEmbed: React.FC<TikTokEmbedProps> = ({ data }) => (
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
          <p className="text-white text-sm line-clamp-3">{data.text}</p>
          <div className="text-white text-xs">#{data.hashtag}</div>
        </div>
      </div>
    </div>
    <div className="p-2 flex justify-between items-center bg-white">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
        <span className="text-xs font-semibold">@{data.author}</span>
      </div>
      <FaTiktok className="text-black w-5 h-5" />
    </div>
  </div>
);

export const ThreadsEmbed: React.FC<ThreadsEmbedProps> = ({ data }) => (
  <div className="w-full border-2 border-black p-1 rounded-md">
    <div className="border rounded-md p-4 bg-white shadow-sm w-full">
      <div className="flex items-center mb-2">
        <FaThreads className="text-black w-6 h-6 mr-2" />
        <span className="font-bold">{data.username}</span>
      </div>
      <p className="text-sm mb-2">{data.text}</p>
      {data.image_urls && data.image_urls.length > 0 && (
        <img src={data.image_urls[0]} alt="Thread visual" className="w-full h-auto rounded-md mb-2" />
      )}
      <div className="text-gray-500 text-xs">{new Date(data.created_at || '').toLocaleString()}</div>
    </div>
  </div>
);

export const NewsEmbed: React.FC<NewsEmbedProps> = ({ data }) => (
  <div className="w-full border-2 border-black p-1 rounded-md">
    <div className="border rounded-md p-4 bg-white shadow-sm w-full">
      <div className="flex items-center mb-2">
        <FaNewspaper className="text-gray-600 w-6 h-6 mr-2" />
        <span className="font-bold">{data.source_url}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
      <p className="text-sm mb-2">{data.summary}</p>
      {data.url && (
        <div className="text-blue-600 text-sm">
          <a href={data.url} target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      )}
      <div className="text-gray-500 text-xs mt-2">{new Date(data.publish_date || '').toLocaleString()}</div>
    </div>
  </div>
);

export const AdEmbed: React.FC<AdEmbedProps> = ({ data }) => (
  <div className="w-full border-2 border-black p-1 rounded-md">
    <div className="border rounded-md p-4 bg-white shadow-sm w-full">
      <div className="flex items-center mb-2">
        <Newspaper className="text-blue-600 w-6 h-6 mr-2" />
        <span className="font-bold">{data.advertiser_name}</span>
      </div>
      <p className="text-sm mb-2">{data.content}</p>
      {data.format && (
        <div className="text-gray-500 text-xs">Format: {data.format}</div>
      )}
      <div className="text-gray-500 text-xs">
        First shown: {new Date(data.first_shown || '').toLocaleDateString()}
      </div>
      <div className="text-gray-500 text-xs">
        Last shown: {new Date(data.last_shown || '').toLocaleDateString()}
      </div>
    </div>
  </div>
);