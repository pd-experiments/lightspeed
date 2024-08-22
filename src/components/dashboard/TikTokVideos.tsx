import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import { Video } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

type TikTokVideo = Database['public']['Tables']['tiktok_videos']['Row'];

export default function TikTokVideos() {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTikTokVideos();
  }, []);

  const fetchTikTokVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('tiktok_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setVideos(data);
    } catch (error) {
      console.error('Error fetching TikTok videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Video className="w-5 h-5 mr-2 text-red-500" />
          Recent TikTok Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner className="w-6 h-6 text-red-500" />
          </div>
        ) : (
          <ul className="space-y-4">
            {videos.map((video) => (
              <li key={video.id} className="border-b pb-2">
                <p className="font-medium text-sm text-gray-800">{video.author}</p>
                <p className="text-sm text-gray-600 mt-1">{video.text}</p>
                <p className="text-xs text-gray-400 mt-1">Views: {video.views}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}