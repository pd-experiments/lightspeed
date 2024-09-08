import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, Hash, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MinTiktokCardProps {
  tiktok: {
    author: string | null;
    caption: string | null;
    created_at: string | null;
    hashtags: string[] | null;
    views: number | null;
    video_id: string | null;
  };
}

function formatDate(inputDate: string | null): string {
  if (inputDate === null) return "Unknown";
  const date = new Date(inputDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatViews(views: number | null): string {
  if (views === null) return "Unknown views";
  return views.toLocaleString() + " views";
}

export function MinTiktokCard({ tiktok }: MinTiktokCardProps) {
  return (
    <Card className="w-full h-full bg-white overflow-hidden">
      <CardContent className="p-4">
        <Link
          href={`https://www.tiktok.com/@${tiktok.author}/video/${tiktok.video_id}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center mb-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          @{tiktok.author}
          <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{tiktok.caption}</p>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(tiktok.created_at)}
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Eye className="w-3 h-3 mr-1" />
          {formatViews(tiktok.views)}
        </div>
        {tiktok.hashtags && tiktok.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tiktok.hashtags.slice(0, 3).map((hashtag, index) => (
              <span key={index} className="inline-flex items-center text-xs text-blue-500">
                <Hash className="w-3 h-3 mr-1" />
                {hashtag}
              </span>
            ))}
            {tiktok.hashtags.length > 3 && (
              <span className="text-xs text-gray-500">+{tiktok.hashtags.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}