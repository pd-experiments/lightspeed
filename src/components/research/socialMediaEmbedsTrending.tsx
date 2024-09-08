import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaThreads } from 'react-icons/fa6';
import { Badge } from "@/components/ui/badge";

interface EmbedProps {
  suggestion: any;
}

export const FacebookEmbed: React.FC<EmbedProps> = ({ suggestion }) => (
  <div className="border rounded-md p-4 bg-white shadow-sm w-full">
    <div className="flex items-center mb-2">
      <FaFacebook className="text-blue-600 w-6 h-6 mr-2" />
      <span className="font-bold">@facebook_account</span>
    </div>
    <p className="text-sm mb-2">{suggestion.textContent}</p>
    <div className="text-blue-600 text-sm mb-2">{suggestion.hashtags.join(' ')}</div>
    <div className="bg-gray-200 h-40 flex items-center justify-center mb-2 rounded-md">
      <span className="text-gray-500">{suggestion.imageDescription}</span>
    </div>
    <Badge variant="outline" className="mr-2">{suggestion.politicalLeaning}</Badge>
    <Badge variant="secondary">{suggestion.callToAction}</Badge>
  </div>
);

export const InstagramEmbed: React.FC<EmbedProps> = ({ suggestion }) => (
  <div className="border rounded-md bg-white shadow-sm w-full">
    <div className="flex items-center p-2">
      <FaInstagram className="text-pink-600 w-6 h-6 mr-2" />
      <span className="font-bold">@instagram_account</span>
    </div>
    <div className="aspect-square w-full bg-gray-200 flex items-center justify-center">
      <span className="text-gray-500">{suggestion.imageDescription}</span>
    </div>
    <div className="p-3">
      <p className="text-sm mb-1">{suggestion.textContent}</p>
      <div className="text-blue-600 text-sm mb-2">{suggestion.hashtags.join(' ')}</div>
      <Badge variant="outline" className="mr-2">{suggestion.politicalLeaning}</Badge>
      <Badge variant="secondary">{suggestion.callToAction}</Badge>
    </div>
  </div>
);

export const TikTokEmbed: React.FC<EmbedProps> = ({ suggestion }) => (
  <div className="border rounded-md bg-white shadow-sm w-full">
    <div className="flex items-center p-2">
      <FaTiktok className="text-black w-6 h-6 mr-2" />
      <span className="font-bold">@tiktok_account</span>
    </div>
    <div className="aspect-[9/16] w-full bg-gray-200 flex items-center justify-center">
      <span className="text-gray-500">{suggestion.imageDescription}</span>
    </div>
    <div className="p-3">
      <p className="text-sm mb-1">{suggestion.textContent}</p>
      <div className="text-blue-600 text-sm mb-2">{suggestion.hashtags.join(' ')}</div>
      <Badge variant="outline" className="mr-2">{suggestion.politicalLeaning}</Badge>
      <Badge variant="secondary">{suggestion.callToAction}</Badge>
    </div>
  </div>
);

export const ThreadsEmbed: React.FC<EmbedProps> = ({ suggestion }) => (
  <div className="border rounded-md p-4 bg-white shadow-sm w-full">
    <div className="flex items-center mb-2">
      <FaThreads className="text-black w-6 h-6 mr-2" />
      <span className="font-bold">@threads_account</span>
    </div>
    <p className="text-sm mb-2">{suggestion.textContent}</p>
    <div className="text-blue-600 text-sm mb-2">{suggestion.hashtags.join(' ')}</div>
    <div className="bg-gray-200 h-40 flex items-center justify-center mb-2 rounded-md">
      <span className="text-gray-500">{suggestion.imageDescription}</span>
    </div>
    <Badge variant="outline" className="mr-2">{suggestion.politicalLeaning}</Badge>
    <Badge variant="secondary">{suggestion.callToAction}</Badge>
  </div>
);

export const ConnectedTVEmbed: React.FC<EmbedProps> = ({ suggestion }) => (
  <div className="border rounded-md p-4 bg-white shadow-sm w-full">
    <div className="flex items-center mb-2">
      <span className="font-bold text-lg">📺 Connected TV</span>
    </div>
    <p className="text-sm mb-2">{suggestion.description}</p>
    <div className="bg-gray-200 h-40 flex items-center justify-center mb-2 rounded-md">
      <span className="text-gray-500">{suggestion.imageDescription}</span>
    </div>
    <Badge variant="outline" className="mr-2">{suggestion.politicalLeaning}</Badge>
    <Badge variant="secondary">{suggestion.callToAction}</Badge>
  </div>
);