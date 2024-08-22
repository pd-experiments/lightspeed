import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import { MessageCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

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
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <MessageCircle className="w-5 h-5 mr-2 text-pink-500" />
          Recent TikTok Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner className="w-6 h-6 text-pink-500" />
          </div>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border-b pb-2">
                <p className="font-medium text-sm text-gray-800">{comment.author}</p>
                <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                <p className="text-xs text-gray-400 mt-1">Likes: {comment.likes}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}