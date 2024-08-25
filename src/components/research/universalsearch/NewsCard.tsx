import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/lib/types/schema";
import { Calendar, Tag } from "lucide-react";

type NewsArticle = Database["public"]["Tables"]["news"]["Row"];

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow bg-white overflow-hidden">
      <CardHeader className="pb-2 border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{article.summary}</p>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(article.publish_date || '').toLocaleDateString()}
          </span>
          {article.source_url && (
            <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Source
            </a>
          )}
        </div>
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {article.keywords.slice(0, 3).map((keyword, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Tag className="w-3 h-3 mr-1" />
                {keyword}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}