import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';  

type NewsArticle = Database['public']['Tables']['news']['Row'];

export default function NewsArticles() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewsArticles();
  }, []);

  const fetchNewsArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setArticles(data);
    } catch (error) {
      console.error('Error fetching news articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News Articles</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading news articles...</p>
        ) : (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.id} className="border-b pb-2">
                <a href={article.url ? article.url : ""} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                  {article.title}
                </a>
                <p className="text-sm text-gray-600">{article.summary}</p>
                <p className="text-xs text-gray-400">{article.publish_date ? new Date(article.publish_date).toLocaleDateString() : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}