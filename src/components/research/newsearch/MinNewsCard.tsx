import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Globe, Link } from "lucide-react";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface MinNewsCardProps {
  article: {
    title: string;
    ai_summary: string;
    publish_date: string | null;
    url: string | null;
  };
}

const cleanUrl = (url: string): string => {
  let cleanedUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  return cleanedUrl.split('/')[0];
};

export function MinNewsCard({ article }: MinNewsCardProps) {
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavicon = async () => {
      if (!article.url) {
        setIsLoading(false);
        return;
      }

      const domain = cleanUrl(article.url);
      try {
        const { data } = await axios.get(`https://favicongrabber.com/api/grab/${domain}`);
        if (data.icons && data.icons[0] && data.icons[0].src) {
          setFavicon(data.icons[0].src);
        } else {
          throw new Error("No favicon found");
        }
      } catch (error) {
        console.error("Error fetching favicon:", error);
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&size=32`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavicon();
  }, [article.url]);

  return (
    <Card className="w-full h-full bg-white overflow-hidden">
      <CardContent className="p-4">
        {article.url && (
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline">
              {isLoading ? (
                <Globe className="w-4 h-4 mr-1 animate-pulse" />
              ) : favicon ? (
                <img
                  src={favicon}
                  alt="Source favicon"
                  width={16}
                  height={16}
                  className="mr-1"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${cleanUrl(article.url!)}&size=16`;
                  }}
                />
              ) : (
                <Globe className="w-4 h-4 mr-1" />
              )}
              Source
            </a>
            <Link className="w-4 h-4 mr-1" />
          </div>
        )}
        <h3 className="text-sm font-semibold mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-3">{article.ai_summary}</p>
        <span className="flex items-center mb-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(article.publish_date || '').toLocaleDateString()}
            </span>
      </CardContent>
    </Card>
  );
}
