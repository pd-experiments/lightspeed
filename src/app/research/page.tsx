"use client";

import { useState, useCallback, useEffect } from 'react';
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, ChevronDown, Image as ImageIcon, CloudLightningIcon } from "lucide-react";
import { getPlatformIcon, getNewsIcon } from "@/lib/helperUtils/create/utils";
import { SearchResults } from "@/lib/types/lightspeed-search";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsCard from "@/components/research/universalsearch/NewsCard";
import Image from 'next/image';
import { FaMeta, FaGoogle } from 'react-icons/fa6';
import AdSearchCard from "@/components/research/adsearch/AdSearchCard";
import { Skeleton } from "@/components/ui/skeleton";
import CardSkeleton from "@/components/research/adsearch/CardSkeleton";
import { MinNewsCard } from "@/components/research/newsearch/MinNewsCard";
import { MinAdSearchCard } from "@/components/research/newsearch/MinAdsCard";
import { ChevronRight } from "lucide-react";
import { Lightbulb, MessageSquare, FileText, Settings } from "lucide-react";
import { StreamedSearchResult } from "@/lib/types/lightspeed-search";
import { motion } from 'framer-motion';
import { Sparkle } from 'lucide-react';
import axios from 'axios';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function PerplexityStylePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ query: string; answer: string }[]>([]);
  const [currentChat, setCurrentChat] = useState<string>("New Chat");
  const [expandedSections, setExpandedSections] = useState<{
    news: boolean;
    ads: boolean;
  }>({
    news: false,
    ads: false,
  });
  const [sources, setSources] = useState<any[]>([]);
  const [adSuggestions, setAdSuggestions] = useState<Record<string, any>>({});

  const dummySearchResults = {
    perplexityAnswer: "This is a sample Perplexity-style answer with an inline citation[1].",
    sources: [
      { title: "Sample Source", url: "https://example.com", snippet: "This is a sample source snippet." }
    ],
    news: [
      { title: "Sample News", url: "https://news.example.com", snippet: "This is a sample news snippet.", publishDate: new Date() }
    ],
    images: [
      { url: "https://via.placeholder.com/150", alt: "Sample Image" }
    ]
  };

  const [streamedResults, setStreamedResults] = useState<StreamedSearchResult>({});
  const [searchStatus, setSearchStatus] = useState("");

  const handleSearch = async () => {
    setIsLoading(true);
    setStreamedResults({});
    setSearchStatus("Searching...");
    setChatHistory([...chatHistory, { query: searchQuery, answer: "" }]);
    setCurrentChat(searchQuery);

    const eventSource = new EventSource(
      `/api/search-engine/structured-search?query=${encodeURIComponent(searchQuery)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStreamedResults((prevResults) => ({ ...prevResults, ...data }));
      setIsLoading(false);
    };

    eventSource.addEventListener("newsStart", () => setSearchStatus("Starting news search"));
    eventSource.addEventListener("adStart", () => setSearchStatus("Starting ad search"));
    eventSource.addEventListener("newsSkipped", () => setSearchStatus("News search skipped"));
    eventSource.addEventListener("adSkipped", () => setSearchStatus("Ad search skipped"));

    eventSource.addEventListener("newsResults", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      setStreamedResults((prevResults) => ({ ...prevResults, news: data.data }));
    });

    eventSource.addEventListener("adResults", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      setStreamedResults((prevResults) => ({ ...prevResults, ads: data.data }));
    });

    eventSource.addEventListener("error", (event: Event) => {
      setIsLoading(false);
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data);
        setSearchStatus(`Error: ${data.error}`);
      } else {
        setSearchStatus("An error occurred");
      }
      eventSource.close();
      setIsLoading(false);
    });

    eventSource.addEventListener("summary", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      setStreamedResults((prevResults) => {
        const updatedSummary = prevResults.summary ? prevResults.summary + data.message : data.message;
        
        setChatHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          updatedHistory[updatedHistory.length - 1].answer = updatedSummary;
          return updatedHistory;
        });
    
        return {
          ...prevResults,
          summary: updatedSummary,
        };
      });
    });

    eventSource.addEventListener("adSuggestions", (event) => {
      const data = JSON.parse(event.data);
      if (data.data && data.data.platform && Array.isArray(data.data.suggestions)) {
        setAdSuggestions((prevSuggestions) => ({
          ...prevSuggestions,
          [data.data.platform]: data.data.suggestions
        }));
      } else {
        console.error("Received invalid ad suggestion data:", data);
      }
    });

    eventSource.addEventListener("done", () => {
      setSearchStatus("Search completed");
      eventSource.close();
      setSearchQuery("");
    });
  };

  const fetchSources = useCallback(async (citations: string[]) => {
    const { data, error } = await supabase
      .from('int_news')
      .select('id, title, url, ai_summary, publish_date')
      .in('id', citations);

    if (error) {
      console.error('Error fetching sources:', error);
    } else {
      setSources(data || []);
    }
  }, []);

  useEffect(() => {
    if (streamedResults.summary) {
      const citations = streamedResults.summary.match(/<begin>({[^}]+})<end>/g);
      if (citations) {
        const citationIds = citations.map(citation => {
          const parsed = JSON.parse(citation.replace(/<begin>|<end>/g, ''));
          return parsed.id;
        });
        fetchSources(citationIds);
      }
    }
  }, [streamedResults.summary, fetchSources]);
  
  const renderSummaryWithCitations = (summary: string) => {
    if (!summary) return null;
  
    const parts = summary.split(/(<begin>.*?<end>)/);
    return parts.map((part, index) => {
      if (part.startsWith('<begin>')) {
        try {
          const citation = JSON.parse(part.replace(/<begin>|<end>/g, ''));
          return (
            <sup 
              key={index} 
              className="text-blue-600 cursor-pointer ml-0.5 font-medium text-xs hover:text-blue-800 transition-colors duration-200"
              title="Click to view source" 
            >
              [{sources.findIndex(source => source.id === citation.id) + 1}]
            </sup>
          );
        } catch (error) {
          console.error("Error parsing citation:", error);
          return null;
        }
      } else {
        return (
          <span 
            key={index} 
            className="text-gray-800 leading-relaxed font-light"
          >
            {part}
          </span>
        );
      }
    });
  };

  const handleViewMore = (type: 'news' | 'ads') => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <Navbar>
      <div className="flex min-h-[95%] max-h-[95%] bg-white p-0 rounded-lg shadow-md">
        {/* Left sidebar */}
        <div className="w-64 bg-blue-50/30 text-gray-800 p-4 overflow-y-auto shadow-sm rounded-l-lg">
          <h2 className="text-lg font-medium mb-4 text-blue-500">History</h2>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => {setCurrentChat("New Chat"); setSearchResults(null); setSearchQuery(""); setChatHistory([])}} variant="ghost" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          {isLoading ? (
            <ul>
              {[...Array(5)].map((_, index) => (
                <li key={index} className="mb-2">
                  <Skeleton className="h-6 w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {chatHistory.map((chat, index) => (
                <li 
                  key={index} 
                  className="mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
                  title={chat.query}
                >
                  <p className="truncate text-sm">{chat.query}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
  
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-lg font-semibold p-4 text-blue-500">{currentChat}</h1>
          <main className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Skeleton isLoading={isLoading} className="h-64 w-full mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[...Array(3)].map((_, index) => (
                      <CardSkeleton key={index} isLoading={isLoading} />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[...Array(3)].map((_, index) => (
                      <CardSkeleton key={index} isLoading={isLoading} />
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, index) => (
                      <Skeleton key={index} isLoading={isLoading} className="h-32 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-[80px] h-[80px] bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <CloudLightningIcon className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-blue-500">Welcome to Lightspeed Ads</h2>
                <p className="text-gray-600 mb-8">Start a conversation or try one of these suggestions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { icon: <Lightbulb className="w-5 h-5" />, text: "Generate a summary of hot topics related to the 2024 election." },
                    { icon: <MessageSquare className="w-5 h-5" />, text: "What messaging would be most effective for a pro-choice candidate in a Pennsylvania swing district?" },
                    { icon: <FileText className="w-5 h-5" />, text: "What are people saying about Donald Trump's 2024 presidential campaign?" },
                    { icon: <Settings className="w-5 h-5" />, text: "What are the key policy positions of Kamala Harris' 2024 presidential campaign?" },
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex items-center justify-start space-x-2 p-4 h-auto text-left w-full"
                      onClick={() => setSearchQuery(suggestion.text)}
                    >
                      {suggestion.icon}
                      <span className="truncate flex-1">{suggestion.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
          ) : (streamedResults) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 max-md:col-span-2">
              <Card className="mb-6 shadow-sm rounded-lg overflow-hidden border-none">
                <CardContent className="p-2 border-none">
                  <motion.p 
                    className="text-md text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {renderSummaryWithCitations(streamedResults.summary || "")}
                  </motion.p>
                  {sources.length > 0 && !isLoading && streamedResults.summary && (
                    <motion.div 
                      className="mt-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <h3 className="text-md font-semibold mb-2 text-blue-500">Citations</h3>
                      <div className="relative">
                        <div className="overflow-x-auto pb-4">
                          <div className="grid grid-flow-col auto-cols-max gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(4, sources.length)}, minmax(250px, 1fr))` }}>
                            {sources.map((source, index) => (
                              <motion.div key={index} className="w-[250px]" variants={itemVariants}>
                                <MinNewsCard article={source} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        {sources.length > 4 && (
                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
  
              {streamedResults.news && streamedResults.summary && (
                <motion.div 
                  className="mb-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-lg font-medium mb-2 text-blue-500">Relevant News Articles</h3>
                  <div className="relative w-full">
                    <div className={`${expandedSections.news ? 'flex overflow-x-auto pb-2 space-x-4 no-scrollbar' : 'grid grid-cols-4 gap-4'}`}>
                    {streamedResults.news
                      .filter(article => !sources.some(source => source.id === article.id))
                      .slice(0, expandedSections.news ? undefined : 3)
                      .map((article, index) => (
                        <motion.div 
                          key={index} 
                          className={expandedSections.news ? "flex-shrink-0 w-64 mr-4" : ""}
                          variants={itemVariants}
                        >
                          <MinNewsCard article={article} />
                        </motion.div>
                      ))}
                      {streamedResults.news.length > 3 && (
                        <motion.div 
                          className={expandedSections.news ? "flex-shrink-0 w-64" : ""}
                          variants={itemVariants}
                        >
                          <Card className="h-full flex flex-col justify-between cursor-pointer hover:bg-gray-50" onClick={() => handleViewMore('news')}>
                            <CardContent className="p-3">
                              <p className="text-blue-500 font-medium text-sm">
                                {expandedSections.news ? 'Show less' : `View ${streamedResults.news.length - 3} more`}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
  
              {streamedResults.ads && streamedResults.summary && (
                <motion.div 
                  className="mb-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-lg font-semibold mb-2">Ads</h3>
                  <div className="relative w-full">
                    <div className={`${expandedSections.ads ? 'flex overflow-x-auto pb-2 space-x-4 no-scrollbar' : 'grid grid-cols-4 gap-4'}`}>
                      {streamedResults.ads.slice(0, expandedSections.ads ? undefined : 3).map((adSearchResult, index) => (
                        <motion.div 
                          key={index} 
                          className={expandedSections.ads ? "flex-shrink-0 w-64 mr-4" : ""}
                          variants={itemVariants}
                        >
                          <MinAdSearchCard ad={adSearchResult as any} />
                        </motion.div>
                      ))}
                      {streamedResults.ads.length > 3 && (
                        <motion.div 
                          className={expandedSections.ads ? "flex-shrink-0 w-64" : ""}
                          variants={itemVariants}
                        >
                          <Card className="h-full flex flex-col justify-between cursor-pointer hover:bg-gray-50" onClick={() => handleViewMore('ads')}>
                            <CardContent className="p-3">
                              <p className="text-blue-500 font-medium text-sm">
                                {expandedSections.ads ? 'Show less' : `View ${streamedResults.ads.length - 3} more`}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              </div>

            <div className="md:col-span-1 max-md:col-span-1">
            {streamedResults && streamedResults.summary && (
              <motion.div 
                // className=""
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-xl font-semibold mb-4 text-blue-500">Related Images</h2>
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  variants={containerVariants}
                >
                  {dummySearchResults.images.map((image, index) => (
                    <motion.div 
                      key={index} 
                      className="relative aspect-square rounded-lg overflow-hidden shadow-sm"
                      variants={itemVariants}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {Object.entries(adSuggestions).length > 0 && (
                <motion.div 
                  className="mt-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-semibold mb-4 text-blue-500">Trending Ad Creative Suggestions</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries(adSuggestions).map(([platform, suggestions]) => (
                      <Card key={platform} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg capitalize">{platform}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Carousel className="w-full">
                            <CarouselContent>
                              {suggestions.map((suggestion: any, index: number) => (
                                <CarouselItem key={index}>
                                  <div className="p-4">
                                    <h3 className="font-semibold">{suggestion.title}</h3>
                                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                                    {suggestion.hashtags && (
                                      <div className="mt-2">
                                        {suggestion.hashtags.map((tag: string) => (
                                          <Badge key={tag} variant="secondary" className="mr-1">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
              </div>
            ) : null}
          </main>
          <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Input
              placeholder="Ask anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 mr-2 rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200">
              <Search className="mr-2 h-5 w-5" /> Ask
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Navbar>
);
}