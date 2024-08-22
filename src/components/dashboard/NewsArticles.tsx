import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Tag, User, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Database } from '@/lib/types/schema';

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
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Latest News Articles</CardTitle>
        <p className="text-sm text-red-500">*This is all being done live server-side, but gonna run a script on all the news articles whenever I generate them from now on. But I need to update the articles db first before I do that bc this has a lot of spam.</p>
      </CardHeader>
      <CardContent className=" max-h-[1200px] overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading news articles...</p>
        ) : (
          <ul className="space-y-6">
            {articles.map((article) => (
              <li key={article.id} className="border-b pb-4">
                <a
                  href={article.url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lg hover:underline flex items-center"
                >
                  {article.title}
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
                <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                {article.key_points && article.key_points.length > 0 && (
                    <div className="mt-2">
                        <h4 className="font-semibold text-sm">Key Points:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                        {article.key_points.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                        </ul>
                    </div>
                )}
                {article.potential_impact && (
                <p className="text-sm text-gray-600 mt-2"><strong>Potential Impact:</strong> {article.potential_impact}</p>
                )}
                <div className="flex flex-wrap items-center mt-2 space-x-2">
                {article.publish_date && (
                    <Badge variant="secondary" className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(article.publish_date).toLocaleDateString()}
                    </Badge>
                )}
                {article.sentiment && (
                    <Badge variant="secondary" className="flex items-center">
                    {getSentimentIcon(article.sentiment)}
                    <span className="ml-1 capitalize">{article.sentiment}</span>
                    </Badge>
                )}
                {article.related_topics && article.related_topics.length > 0 && (
                    <Badge variant="secondary" className="flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    {article.related_topics.slice(0, 3).join(', ')}
                    </Badge>
                )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}