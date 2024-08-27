import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Tag, TrendingUp, TrendingDown, Minus, Newspaper } from 'lucide-react';
import { Database } from '@/lib/types/schema';
import { Spinner } from '@/components/ui/Spinner';

type NewsArticle = Database['public']['Tables']['news']['Row'] & {
  summary: string;
  key_points: string[];
  potential_impact: string;
  related_topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
};

interface NewsArticlesProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

export default function NewsArticles({ articles, isLoading }: NewsArticlesProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'negative': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Newspaper className="w-5 h-5 mr-2 text-blue-500" />
          Latest News Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner className="w-6 h-6 text-blue-500" />
          </div>
        ) : articles.length > 0 ? (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.id} className="border-b pb-4">
                <a
                  href={article.url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-base hover:underline flex items-center text-gray-800"
                >
                  {article.title}
                  <ExternalLink className="ml-1 w-3 h-3" />
                </a>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                <div className="flex flex-wrap items-center mt-2 space-x-2">
                  {article.publish_date && (
                    <Badge variant="secondary" className="text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(article.publish_date).toLocaleDateString()}
                    </Badge>
                  )}
                  {article.sentiment && (
                    <Badge variant="secondary" className="text-xs flex items-center">
                      {getSentimentIcon(article.sentiment)}
                      <span className="ml-1 capitalize">{article.sentiment}</span>
                    </Badge>
                  )}
                  {article.related_topics && article.related_topics.length > 0 && (
                    <Badge variant="secondary" className="text-xs flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {article.related_topics.slice(0, 1).join(', ')}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center h-48 text-gray-500"> 
              No news articles available
            </div>
          )}
      </CardContent>
    </Card>
  );
}