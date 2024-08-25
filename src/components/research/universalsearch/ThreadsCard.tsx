import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/lib/types/schema";
import { ThumbsUp, MessageCircle, Repeat, User, Calendar, Link } from "lucide-react";

type Thread = Database["public"]["Tables"]["threads"]["Row"];

interface ThreadCardProps {
  thread: Thread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow bg-white overflow-hidden">
      <CardHeader className="pb-2 border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center">
            {thread.user_profile_pic_url && (
              <img
                src={thread.user_profile_pic_url}
                alt={thread.username || "User"}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <span>{thread.username || "Anonymous"}</span>
          </div>
          {thread.is_verified && (
            <span className="text-blue-500 text-sm">Verified</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{thread.text}</p>
        {thread.image_urls && thread.image_urls.length > 0 && (
          <div className="mb-3">
            <img
              src={thread.image_urls[0]}
              alt="Thread image"
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span className="flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {thread.likes?.toLocaleString() || '0'}
          </span>
          <span className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            {thread.replies?.toLocaleString() || '0'}
          </span>
          <span className="flex items-center">
            <Repeat className="w-4 h-4 mr-1" />
            {thread.reposts?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(thread.created_at || '').toLocaleDateString()}
          </span>
          {thread.url && (
            <a
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 hover:underline"
            >
              <Link className="w-3 h-3 mr-1" />
              View Thread
            </a>
          )}
        </div>
        {thread.hashtag && (
          <div className="mt-2 text-xs text-blue-500">
            #{thread.hashtag}
          </div>
        )}
      </CardContent>
    </Card>
  );
}