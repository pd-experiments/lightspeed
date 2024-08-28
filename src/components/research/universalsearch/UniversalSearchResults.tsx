import { useState } from "react";
import { SearchResults } from "@/lib/types/lightspeed-search";
import AdSearchCard from "@/components/research/adsearch/AdSearchCard";
import { TikTokEmbed, ThreadsEmbed, NewsEmbed, AdEmbed } from "@/components/ui/socialMediaEmbedsReal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Loader2, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TikTok } from "@/lib/types/customTypes";
import { FaTiktok } from "react-icons/fa";
import { FaNewspaper, FaThreads } from "react-icons/fa6";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/20/solid";

type TikTokWithCaption = TikTok & { caption: string };

interface UniversalSearchResultsProps {
  query: string;
  results: SearchResults | null;
  isLoading: boolean;
}

export default function UniversalSearchResults({ query, results, isLoading }: UniversalSearchResultsProps) {
  const [activeTab, setActiveTab] = useState("all");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const hasResults = results?.ads?.length || results?.tikToks?.length || results?.threads?.length || results?.news?.length;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <div className="text-4xl mb-2">
        {type === 'ads' && <Newspaper className="w-8 h-8 text-blue-500" />}
        {type === 'tiktoks' && <FaTiktok className="w-8 h-8 text-blue-500" />}
        {type === 'threads' && <FaThreads className="w-8 h-8 text-blue-500" />}
        {type === 'news' && <FaNewspaper className="w-8 h-8 text-blue-500" />}
        {type === 'all' &&  <MagnifyingGlassCircleIcon className="w-8 h-8 text-blue-500" />}
      </div>
      {query ? (
        <>
          <p className="text-xl font-semibold">No {type} found</p>
          <p className="text-lg">Try adjusting your search query</p>
        </>
      ) : (
        <p className="text-lg">Welcome to Lightspeed&apos;s Universal Search! Start searching across all platforms. More to come!</p>
      )}
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="inline-flex h-14 items-center w-full space-x-1">
        <TabsTrigger value="all" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'all' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
          All
        </TabsTrigger>
        <TabsTrigger value="ads" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'ads' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
          Ads
        </TabsTrigger>
        <TabsTrigger value="tiktoks" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'tiktoks' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
          TikToks
        </TabsTrigger>
        <TabsTrigger value="threads" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'threads' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
          Threads
        </TabsTrigger>
        <TabsTrigger value="news" className={`w-full bg-white rounded-t-md rounded-b-none ${activeTab === 'news' ? 'bg-white text-blue-500 border-b border-blue-500' : 'bg-gray-200'} data-[state=active]:text-blue-600 inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5`}>
          News
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        {!hasResults ? (
          <EmptyState type="all" />
        ) : (
          <>
            {results.ads && results.ads.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold mr-2">Ads</h3>
                  <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">{results.ads.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.ads.slice(0, 3).map((ad, idx) => (
                    <AdSearchCard key={`ad-${idx}`} adSearchResult={ad} />
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 text-blue-600" onClick={() => handleTabChange("ads")}>
                  View all Ads <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            {results.tikToks && results.tikToks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold mr-2">TikToks</h3>
                  <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">{results.tikToks.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.tikToks.slice(0, 3).map((tiktok, idx) => ( 
                    <TikTokEmbed key={`tiktok-${idx}`} data={tiktok as TikTokWithCaption} />
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 text-blue-600" onClick={() => handleTabChange("tiktoks")}>
                  View all TikToks <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            {results.threads && results.threads.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold mr-2">Threads</h3>
                  <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">{results.threads.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.threads.slice(0, 3).map((thread, idx) => (
                    <ThreadsEmbed key={`thread-${idx}`} data={thread} />
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 text-blue-600" onClick={() => handleTabChange("threads")}>
                  View all Threads <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            {results.news && results.news.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold mr-2">News</h3>
                  <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">{results.news.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.news.slice(0, 3).map((article, idx) => (
                    <NewsEmbed key={`news-${idx}`} data={article} />
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 text-blue-600" onClick={() => handleTabChange("news")}>
                  View all News <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="ads">
        {!results?.ads?.length ? (
          <EmptyState type="ads" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.ads.map((ad, idx) => (
              <AdSearchCard key={`ad-${idx}`} adSearchResult={ad} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="threads">
        {!results?.threads?.length ? (
          <EmptyState type="threads" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.threads.map((thread, idx) => (
              <ThreadsEmbed key={`thread-${idx}`} data={thread} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="tiktoks">
        {!results?.tikToks?.length ? (
          <EmptyState type="tiktoks" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.tikToks.map((tiktok, idx) => (
              <TikTokEmbed key={`tiktok-${idx}`} data={tiktok as TikTokWithCaption} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="news">
        {!results?.news?.length ? (
          <EmptyState type="news" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.news.map((article, idx) => (
              <NewsEmbed key={`news-${idx}`} data={article} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}