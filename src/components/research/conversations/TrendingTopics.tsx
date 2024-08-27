import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaTiktok, FaNewspaper } from 'react-icons/fa';
import { FaThreads } from "react-icons/fa6";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database } from '@/lib/types/schema';
import { uniq } from 'lodash';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';

type Thread = Database['public']['Tables']['threads']['Row'];
type TikTokVideo = Database['public']['Tables']['tiktok_videos']['Row'];
type NewsArticle = Database['public']['Tables']['int_news']['Row'];

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
          case 'threads': return <FaThreads className="text-gray-600" />;
          case 'tiktok': return <FaTiktok className="text-gray-600" />;
          case 'news': return <FaNewspaper className="text-gray-600" />;
          default: return null;
        }
      };
    
    const getUniqueSourceIcons = (references: TrendingTopic['references']) => {
        const uniqueSources = uniq(references.map(ref => ref.source));
        return uniqueSources.map(source => (
            <span key={source} className="mr-1">{getSourceIcon(source)}</span>
        ));
    };
  
    const truncateText = (text: string, maxLength: number) => {
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };
    const getRefUrl = (ref: TrendingTopic['references'][0]) => {
      switch (ref.source) {
        case 'threads':
          return (ref.data as Thread).url ?? '';
        case 'tiktok':
          return `https://www.tiktok.com/@${(ref.data as TikTokVideo).author}/video/${(ref.data as TikTokVideo).video_id}`;
        case 'news':
          return (ref.data as NewsArticle).url ?? '';
        default:
          return '';
      }
    };
  
    return (
        <div className="h-full min-h-[600px]">
        <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="border-b bg-gray-50 p-4">
          <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Spinner className="w-6 h-6 text-blue-500" />
            </div>
          ) : Array.isArray(topics) && topics.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-md p-3 cursor-pointer transition-all hover:bg-gray-100"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <p className="font-medium text-gray-800 truncate">#{topic.topic}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                    <div className="flex space-x-1">
                      {getUniqueSourceIcons(topic.references)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-48 text-gray-500">
              No trending topics available
            </div>
          )}
        </CardContent>
        {selectedTopic && (
          <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>#{selectedTopic.topic}</DialogTitle>
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
                              <a href={getRefUrl(ref)} target="_blank" rel="noopener noreferrer">
                                  <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 transition-colors">
                                  <ExternalLink size={12} className="mr-1" />
                                  View
                                  </Badge>
                              </a>
                              </div>
                              {ref.source === 'threads' && (
                              <>
                                  <p className="font-semibold">{(ref.data as Thread).username ?? "No username"}</p>
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
        )}
        </Card>
        </div>
    );
  }