import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';

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
    <Card>
      <CardHeader>
        <CardTitle>Recent Threads</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading recent & relevant threads...</p>
        ) : (
          <ul className="space-y-4">
            {threads.map((thread) => (
              <li key={thread.id} className="border-b pb-2">
                <p className="font-semibold">{thread.username}</p>
                <p className="text-sm text-gray-600">{thread.text}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}