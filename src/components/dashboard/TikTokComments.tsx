import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';

type TikTokComment = Database['public']['Tables']['tiktok_comments']['Row'];

export default function TikTokComments() {
  const [comments, setComments] = useState<TikTokComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTikTokComments();
  }, []);

  const fetchTikTokComments = async () => {
    try {
      const { data, error } = await supabase
        .from('tiktok_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('Error fetching TikTok comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent TikTok Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading TikTok comments...</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border-b pb-2">
                <p className="font-semibold">{comment.author}</p>
                <p className="text-sm text-gray-600">{comment.text}</p>
                <p className="text-xs text-gray-400">Likes: {comment.likes}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}