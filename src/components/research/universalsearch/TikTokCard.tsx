import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/lib/types/schema";
import { TrendingUp, MessageCircle, ThumbsUp, Share2 } from "lucide-react";

type TikTok = Database["public"]["Tables"]["tiktok_videos"]["Row"];

interface TikTokCardProps {
  tiktok: TikTok;
}

export default function TikTokCard({ tiktok }: TikTokCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow bg-white overflow-hidden">
      <CardHeader className="pb-2 border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>{tiktok.author}</span>
          {tiktok.is_trending && (
            <TrendingUp className="w-5 h-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tiktok.text}</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {tiktok.likes?.toLocaleString() || 'N/A'}
          </span>
          <span className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            {tiktok.comments_count?.toLocaleString() || 'N/A'}
          </span>
          <span className="flex items-center">
            <Share2 className="w-4 h-4 mr-1" />
            {tiktok.shares?.toLocaleString() || 'N/A'}
          </span>
        </div>
        {tiktok.hashtag && (
          <div className="mt-2 text-xs text-blue-500">
            #{tiktok.hashtag}
          </div>
        )}
      </CardContent>
    </Card>
  );
}