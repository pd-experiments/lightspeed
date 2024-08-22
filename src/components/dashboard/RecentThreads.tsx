import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import { MessageSquare } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

type Thread = Database['public']['Tables']['threads']['Row'];

export default function RecentThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentThreads();
  }, []);

  const fetchRecentThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setThreads(data);
    } catch (error) {
      console.error('Error fetching recent tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
          Recent Threads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner className="w-6 h-6 text-blue-500" />
          </div>
        ) : (
          <ul className="space-y-4">
            {threads.map((thread) => (
              <li key={thread.id} className="border-b pb-2">
                <p className="font-medium text-sm text-gray-800">{thread.username}</p>
                <p className="text-sm text-gray-600 mt-1">{thread.text}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}