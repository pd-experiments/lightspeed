import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaTiktok, FaNewspaper, FaComment } from 'react-icons/fa';
import { FaThreads } from "react-icons/fa6";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/types/schema';
import { uniq } from 'lodash';

type Thread = Database['public']['Tables']['threads']['Row'];
type TikTokVideo = Database['public']['Tables']['tiktok_videos']['Row'];
type NewsArticle = Database['public']['Tables']['news']['Row'];

interface TrendingTopic {
    topic: string;
    count: number;
    references: {
      source: 'threads' | 'tiktok' | 'news';
      data: Thread | TikTokVideo | NewsArticle;
    }[];
  }

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  isLoading: boolean;
}

export default function TrendingTopics({ topics, isLoading }: TrendingTopicsProps) {
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedRefs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'threads':
        return <FaThreads className="text-blue-400" />;
      case 'tiktok':
        return <FaTiktok className="text-black" />
      case 'news':
        return <FaNewspaper className="text-black" />;
      default:
        return null;
    }
  };

  const getUniqueSourceIcons = (references: TrendingTopic['references']) => {
    const uniqueSources = uniq(references.map(ref => ref.source));
    return uniqueSources.map(source => (
      <span key={source} className="mr-1">
        {getSourceIcon(source)}
      </span>
    ));
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-600">Loading trending topics...</p>
        ) : (
          <ul className="space-y-3">
            {topics.map((topic, index) => (
              <li key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm transition-all duration-300 hover:shadow-md">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setSelectedTopic(topic)}>
                      <span className="text-lg font-semibold text-gray-800">#{topic.topic}</span>
                      <Badge variant="secondary" className="text-xs">
                        {topic.count} mentions
                      </Badge>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>References for #{topic.topic}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                    {selectedTopic && selectedTopic.references && (
                    <ul className="space-y-4">
                        {selectedTopic.references.map((ref, index) => (
                        <li key={index} className="border-b p-2">
                            <div className="flex items-center space-x-2 mb-1">
                            {getSourceIcon(ref.source)}
                            <span className="text-sm font-medium text-gray-700 capitalize">
                                {ref.source} {ref.source === 'tiktok' && ('views' in ref.data ? 'Video' : 'Comment')}
                            </span>
                            </div>
                            {ref.source === 'threads' && (
                            <>
                                <p className="font-semibold">{(ref.data as Thread).username ?? "No username"}</p>
                                <a href={(ref.data as Thread).url ?? ''} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                                {(ref.data as Thread).url}
                                </a>
                                <p className="text-sm text-gray-600">
                                {expandedRefs.has(index) ? ref.data.text : truncateText(ref.data.text ?? '', 100)}
                                </p>
                            </>
                            )}
                            {ref.source === 'tiktok' && (
                            <>
                                <p className="font-semibold">{(ref.data as TikTokVideo).author}</p>
                                <p className="text-sm text-gray-600">
                                {expandedRefs.has(index) ? ref.data.text : truncateText(ref.data.text ?? '', 100)}
                                </p>
                                <p className="text-xs text-gray-400">Views: {(ref.data as TikTokVideo).views}</p>
                            </>
                            )}
                            {ref.source === 'news' && (
                            <>
                                <a href={(ref.data as NewsArticle).url ?? ''} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                                {(ref.data as NewsArticle).title}
                                </a>
                                <p className="text-sm text-gray-600">
                                {expandedRefs.has(index) ? (ref.data as NewsArticle).summary : truncateText((ref.data as NewsArticle).summary ?? '', 100)}
                                </p>
                                <p className="text-xs text-gray-400">{new Date((ref.data as NewsArticle).publish_date ?? '').toLocaleDateString()}</p>
                            </>
                            )}
                            {(((ref.data as Thread).text?.length ?? 0 > 100) ||
                            ((ref.data as TikTokVideo).text?.length ?? 0 > 100) ||
                            ((ref.data as NewsArticle).summary?.length ?? 0 > 100)) && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => toggleExpand(index)}
                                className="mt-1 p-0 h-auto text-blue-500 hover:text-blue-700"
                            >
                                {expandedRefs.has(index) ? 'Show less' : 'Show more'}
                            </Button>
                            )}
                        </li>
                        ))}
                    </ul>
                    )}
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center space-x-2">
                  {getUniqueSourceIcons(topic.references)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}