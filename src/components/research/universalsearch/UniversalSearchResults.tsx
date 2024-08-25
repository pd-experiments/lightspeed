import { SearchResults } from "@/lib/types/lightspeed-search";
import AdSearchCard from "@/components/research/adsearch/AdSearchCard";
import TikTokCard from "@/components/research/universalsearch/TikTokCard";
import ThreadCard from "@/components/research/universalsearch/ThreadsCard";
import NewsCard from "@/components/research/universalsearch/NewsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface UniversalSearchResultsProps {
  results: SearchResults | null;
  isLoading: boolean;
}

export default function UniversalSearchResults({ results, isLoading }: UniversalSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const hasResults = results.ads?.length || results.tikToks?.length || results.threads?.length || results.news?.length;

  if (!hasResults) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No results found. Try adjusting your search query.
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-6">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="ads">Ads</TabsTrigger>
        <TabsTrigger value="tiktoks">TikToks</TabsTrigger>
        <TabsTrigger value="threads">Threads</TabsTrigger>
        <TabsTrigger value="news">News</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.ads?.slice(0, 2).map((ad, idx) => (
            <AdSearchCard key={`ad-${idx}`} adSearchResult={ad} />
          ))}
          {results.tikToks?.slice(0, 2).map((tiktok, idx) => (
            <TikTokCard key={`tiktok-${idx}`} tiktok={tiktok} />
          ))}
          {results.threads?.slice(0, 2).map((thread, idx) => (
            <ThreadCard key={`thread-${idx}`} thread={thread} />
          ))}
          {results.news?.slice(0, 2).map((article, idx) => (
            <NewsCard key={`news-${idx}`} article={article} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ads">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.ads?.map((ad, idx) => (
            <AdSearchCard key={`ad-${idx}`} adSearchResult={ad} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="tiktoks">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.tikToks?.map((tiktok, idx) => (
            <TikTokCard key={`tiktok-${idx}`} tiktok={tiktok} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="threads">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.threads?.map((thread, idx) => (
            <ThreadCard key={`thread-${idx}`} thread={thread} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="news">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.news?.map((article, idx) => (
            <NewsCard key={`news-${idx}`} article={article} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}