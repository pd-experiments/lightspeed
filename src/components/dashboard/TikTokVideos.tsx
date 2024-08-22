import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';  

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
    <Card>
      <CardHeader>
        <CardTitle>Recent TikTok Videos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading TikTok videos...</p>
        ) : (
          <ul className="space-y-4">
            {videos.map((video) => (
              <li key={video.id} className="border-b pb-2">
                <p className="font-semibold">{video.author}</p>
                <p className="text-sm text-gray-600">{video.text}</p>
                <p className="text-xs text-gray-400">Views: {video.views}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}