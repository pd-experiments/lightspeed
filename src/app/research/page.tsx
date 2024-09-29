"use client";

import React, { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  ChevronDown,
  Image as ImageIcon,
  CloudLightningIcon,
} from "lucide-react";
import { getPlatformIcon, getNewsIcon } from "@/lib/helperUtils/create/utils";
import {
  PairedSearchResult,
  SearchResults,
} from "@/lib/types/lightspeed-search";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsCard from "@/components/research/universalsearch/NewsCard";
import Image from "next/image";
import { FaMeta, FaGoogle } from "react-icons/fa6";
import AdSearchCard from "@/components/research/adsearch/AdSearchCard";
import { Skeleton } from "@/components/ui/skeleton";
import CardSkeleton from "@/components/research/adsearch/CardSkeleton";
import { MinNewsCard } from "@/components/research/newsearch/MinNewsCard";
import { MinAdSearchCard } from "@/components/research/newsearch/MinAdsCard";
import { MinTiktokCard } from "@/components/research/newsearch/MinTikTokCard";
import { ChevronRight } from "lucide-react";
import { Lightbulb, MessageSquare, FileText, Settings } from "lucide-react";
import { StreamedSearchResult } from "@/lib/types/lightspeed-search";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle } from "lucide-react";
import axios from "axios";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  FacebookEmbed,
  InstagramEmbed,
  TikTokEmbed,
  ThreadsEmbed,
  ConnectedTVEmbed,
} from "@/components/research/socialMediaEmbedsTrending";
import { AdSuggestionCollapsible } from "@/components/research/AdSuggestionCollapsible";
import { Loader2, CheckCircle2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function PerplexityStylePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<
    { query: string; answer: string }[]
  >([]);
  const [openaiClientHistoryId, setOpenaiClientHistoryId] = useState<string>(
    uuidv4()
  );
  
  const [messageHistory, setMessageHistory] = useState<PairedSearchResult[]>([]);
  const [currentChat, setCurrentChat] = useState<string>("New Chat");
  const [expandedSections, setExpandedSections] = useState<{
    news: boolean;
    ads: boolean;
    tiktoks: boolean;
  }>({
    news: false,
    ads: false,
    tiktoks: false,
  });
  const [sources, setSources] = useState<any[]>([]);
  const [adSuggestions, setAdSuggestions] = useState<Record<string, any>>({});
  
  const [streamedResults, setStreamedResults] = useState<{
    summary: string;
    news: Map<string, any>;
    ads: Map<string, any>;
    tiktoks: Map<string, any>;
  }>({
    summary: "",
    news: new Map(),
    ads: new Map(),
    tiktoks: new Map(),
  });
  const [searchStatus, setSearchStatus] = useState("");

  const platformOrder = [
    "tiktok",
    "facebook",
    "instagram",
    "connectedTV",
    // "threads",
  ];
  const [loadedPlatforms, setLoadedPlatforms] = useState<string[]>([]);
  const [currentlyLoadingPlatform, setCurrentlyLoadingPlatform] = useState<
    string | null
  >(null);

  const LoadingAnimation = React.memo(({
    completedPlatforms,
    currentlyLoading,
  }: {
    completedPlatforms: string[];
    currentlyLoading: string | null;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mb-4"
    >
      <p className="text-sm text-blue-500 font-medium mb-2">
        Generating suggestions for:
      </p>
      <div className="space-y-2">
        {platformOrder.map((platform) => (
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center p-2 rounded-md ${
              completedPlatforms.includes(platform)
                ? "bg-blue-50"
                : platform === currentlyLoading
                ? "bg-blue-50"
                : "bg-gray-50"
            }`}
          >
            <span className="flex-grow text-sm capitalize text-blue-700">
              {platform}
            </span>
            {completedPlatforms.includes(platform) ? (
              <CheckCircle2 className="w-5 h-5 fill-blue-500 text-white" />
            ) : platform === currentlyLoading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <div className="w-5 h-5" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  ));
  
  LoadingAnimation.displayName = 'LoadingAnimation';

  const [searching, setSearching] = useState(false);
  const [completedPlatforms, setCompletedPlatforms] = useState<string[]>([]);

  const updateResults = (type: 'news' | 'ads' | 'tiktoks', newData: any[]) => {
    setStreamedResults((prevResults) => {
      const updatedMap = new Map(prevResults[type]);
      newData.forEach((item) => {
        if (!updatedMap.has(item.id)) {
          updatedMap.set(item.id, item);
        }
      });
      return {
        ...prevResults,
        [type]: updatedMap,
      };
    });
  };

  const handleSearch = async () => {
    setSearching(true);
    setIsLoading(true);
    setStreamedResults({
      summary: "",
      news: new Map(),
      ads: new Map(),
      tiktoks: new Map(),
    });
    setChatHistory([...chatHistory, { query: searchQuery, answer: "" }]);
    setCurrentChat(searchQuery);

    const eventSource = new EventSource(
      `/api/search-engine/structured-search?query=${encodeURIComponent(
        searchQuery
      )}&openai_client_history_id=${openaiClientHistoryId}`
    );

    setSearchQuery("");

    eventSource.onmessage = (event) => {
      setSearchStatus("Searching...");
      const data = JSON.parse(event.data);
      setStreamedResults((prevResults) => ({ ...prevResults, ...data }));
      setIsLoading(false);
      setSearchStatus(
        "Grabbing relevant data from social media, ads, and the web..."
      );
    };

    // eventSource.addEventListener("newsStart", () => setSearchStatus("Fetching news articles"));
    // eventSource.addEventListener("adStart", () => setSearchStatus("Fetching political ads"));
    // eventSource.addEventListener("newsSkipped", () => setSearchStatus("News search skipped"));
    // eventSource.addEventListener("adSkipped", () => setSearchStatus("Ad search skipped"));

    eventSource.addEventListener("newsResults", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      updateResults('news', data.data || []);
    });
    
    eventSource.addEventListener("adResults", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      updateResults('ads', data.data || []);
    });
    
    eventSource.addEventListener("tiktokResults", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      updateResults('tiktoks', data.data || []);
    });

    eventSource.addEventListener("error", (event: Event) => {
      setIsLoading(false);
      console.log("eventSource.addEventListener error", event);
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data);
        setSearchStatus(`Error: ${data.error}`);
      } else {
        setSearchStatus("An error occurred");
      }
      eventSource.close();
      setIsLoading(false);
    });

    eventSource.addEventListener("summaryStart", () => {
      console.log("summaryStart");
      setSearchStatus("Generating summary and suggestions...");
    });

    eventSource.addEventListener("summary", (event) => {
      setIsLoading(false);
      const data = JSON.parse(event.data);
      setStreamedResults((prevResults) => {
        const updatedSummary = (prevResults.summary || "") + (data.message || "");
        setChatHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          if (updatedHistory.length > 0) {
            updatedHistory[updatedHistory.length - 1].answer = updatedSummary;
          }
          return updatedHistory;
        });
        return {
          ...prevResults,
          summary: updatedSummary,
        };
      });
    });

    eventSource.addEventListener("adSuggestionsStart", () => {
      setSearchStatus("Generating ad creative suggestions");
      setCurrentlyLoadingPlatform(platformOrder[0]);
      setCompletedPlatforms([]);
    });

    eventSource.addEventListener("adSuggestions", (event) => {
      const data = JSON.parse(event.data);
      if (data.data && data.data.platform) {
        setAdSuggestions((prevSuggestions) => ({
          ...prevSuggestions,
          [data.data.platform]: data.data.suggestions || [],
        }));
        
        setCompletedPlatforms((prev) => [...prev, data.data.platform]);
        
        const nextPlatformIndex = platformOrder.indexOf(data.data.platform) + 1;
        if (nextPlatformIndex < platformOrder.length) {
          setCurrentlyLoadingPlatform(platformOrder[nextPlatformIndex]);
        } else {
          setCurrentlyLoadingPlatform(null);
        }
      }
    });

    eventSource.addEventListener("adSuggestionsError", (event) => {
      const data = JSON.parse(event.data);
      console.error("Ad suggestion error:", data);
    });

    eventSource.addEventListener("done", () => {
      setSearchStatus("Search completed");
      eventSource.close();
      setSearchQuery("");
      setSearching(false);
      setCurrentlyLoadingPlatform(null);
    });
  }

  const SearchStatusAnimation = ({ status }: { status: string }) => (
    <motion.div
      // initial={{ opacity: 0, y: -20 }}
      // animate={{ opacity: 1, y: 0 }}
      // exit={{ opacity: 0, y: -20 }}
      className="mb-4"
    >
      <div className="flex items-center p-2 rounded-md bg-blue-50">
        <span className="flex-grow text-sm text-blue-600">{status}</span>
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      </div>
    </motion.div>
  );

  const fetchSources = useCallback(async (citations: string[]) => {
    const { data, error } = await supabase
      .from("int_news")
      .select("id, title, url, ai_summary, publish_date")
      .in("id", citations);
  
    if (error) {
      console.error("Error fetching sources:", error);
    } else {
      setSources((prevSources) => {
        const newSources = data?.filter((source) => !prevSources.some((prevSource) => prevSource.id === source.id)) || [];
        return [...prevSources, ...newSources];
      });
    }
  }, []);

  useEffect(() => {
    if (streamedResults.summary) {
      const citations = streamedResults.summary.match(/<begin>({[^}]+})<end>/g);
      if (citations) {
        const citationIds = citations.map((citation) => {
          const parsed = JSON.parse(citation.replace(/<begin>|<end>/g, ""));
          return parsed.id;
        });
        const newCitationIds = citationIds.filter(id => !sources.some(source => source.id === id));
        if (newCitationIds.length > 0) {
          fetchSources(newCitationIds);
        }
      }
    }
  }, [streamedResults.summary, fetchSources, sources]);

  const renderSummaryWithCitations = (summary: string) => {
    if (!summary) return null;

    const parts = summary.split(/(<begin>|<end>|\*\*)/);
    let citationCounter = 0;
    const citationMap = new Map();
    let isInCitation = false;
    let currentCitation = '';
    let isBold = false;

    return parts.map((part, index) => {
      if (part === '<begin>') {
        isInCitation = true;
        currentCitation = '';
        return null;
      } else if (part === '<end>') {
        isInCitation = false;
        try {
          const citation = JSON.parse(currentCitation);
          if (!citationMap.has(citation.id)) {
            citationMap.set(citation.id, ++citationCounter);
          }
          const citationNumber = citationMap.get(citation.id);
          return (
            <sup
              key={index}
              className="text-blue-600 cursor-pointer ml-0.5 font-medium text-xs hover:text-blue-800 transition-colors duration-200"
              title="Click to view source"
            >
              [{citationNumber}]
            </sup>
          );
        } catch (error) {
          console.error("Error parsing citation:", error);
          return null;
        }
      } else if (part === '**') {
        isBold = !isBold;
        return null;
      } else if (isInCitation) {
        currentCitation += part;
        return null;
      } else {
        return (
          <span
            key={index}
            className={`text-gray-800 leading-relaxed ${
              isBold ? 'font-semibold' : 'font-light'
            }`}
          >
            {part}
          </span>
        );
      }
    }).filter(Boolean);
  };

  const handleViewMore = (type: "news" | "ads" | "tiktoks") => {
    setExpandedSections((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <Navbar>
      <div className="flex flex-col md:flex-row min-h-full max-h-full bg-white rounded-lg shadow-md">
        {/* Left sidebar */}
        <div className="w-full md:w-64 bg-blue-50/30 text-gray-800 p-4 overflow-y-auto shadow-sm md:rounded-l-lg">
          <h2 className="text-lg font-medium mb-4 text-blue-500">History</h2>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                setCurrentChat("New Chat");
                setSearchResults(null);
                setSearchQuery("");
                setChatHistory([]);
                setOpenaiClientHistoryId(uuidv4());
              }}
              variant="ghost"
              className="w-full justify-start"
            >
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
          <h1 className="text-lg font-semibold p-4 text-blue-500">
            {currentChat}
          </h1>
          <main className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="md:col-span-2">
    <Card className="mb-6 shadow-sm rounded-lg overflow-hidden border-none">
      <CardContent className="p-2 border-none">
        <Skeleton isLoading={isLoading} className="h-6 w-3/4 mb-2" />
        <Skeleton isLoading={isLoading} className="h-4 w-full mb-2" />
        <Skeleton isLoading={isLoading} className="h-4 w-full mb-2" />
        <Skeleton isLoading={isLoading} className="h-4 w-5/6" />
      </CardContent>
    </Card>
    <div className="mb-6">
      <Skeleton className="h-6 w-48 mb-2" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-3">
              <Skeleton isLoading={isLoading} className="h-24 w-full mb-2" />
              <Skeleton isLoading={isLoading} className="h-4 w-3/4 mb-1" />
              <Skeleton isLoading={isLoading} className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <Skeleton className="h-6 w-64 mb-2" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-3">
              <Skeleton isLoading={isLoading} className="h-24 w-full mb-2" />
              <Skeleton isLoading={isLoading} className="h-4 w-3/4 mb-1" />
              <Skeleton isLoading={isLoading} className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
  <div className="md:col-span-1">
    <Skeleton className="h-6 w-48 mb-4" />
    {[...Array(5)].map((_, index) => (
      <Card key={index} className="mb-4">
        <CardContent className="p-3">
          <Skeleton isLoading={isLoading} className="h-4 w-1/3 mb-2" />
          <Skeleton isLoading={isLoading} className="h-3 w-full mb-1" />
          <Skeleton isLoading={isLoading} className="h-3 w-5/6 mb-1" />
          <Skeleton isLoading={isLoading} className="h-3 w-4/5" />
        </CardContent>
      </Card>
    ))}
  </div>
</div>
            ) : chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-[80px] h-[80px] bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <CloudLightningIcon className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-blue-500">
                  Welcome to Lightspeed
                </h2>
                <p className="text-gray-600 mb-8">
                  Start a conversation or try one of these suggestions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    {
                      icon: <Lightbulb className="w-5 h-5" />,
                      text: "Generate a summary of hot topics related to the 2024 election.",
                    },
                    {
                      icon: <MessageSquare className="w-5 h-5" />,
                      text: "What messaging would be most effective for a pro-choice candidate in a Pennsylvania swing district?",
                    },
                    {
                      icon: <FileText className="w-5 h-5" />,
                      text: "What are people saying about Donald Trump's 2024 presidential campaign?",
                    },
                    {
                      icon: <Settings className="w-5 h-5" />,
                      text: "What are people saying about the 2024 Paris Olympics??",
                    },
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
            ) : streamedResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="mb-6 shadow-sm rounded-lg overflow-hidden border-none">
                      <CardContent className="p-2 border-none">
                        {searchStatus &&
                          completedPlatforms.length < platformOrder.length && (
                            <AnimatePresence>
                              <SearchStatusAnimation status={searchStatus} />
                            </AnimatePresence>
                          )}
                        <motion.div
                          className="text-md text-gray-800 space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {renderSummaryWithCitations(streamedResults.summary || "")}
                        </motion.div>
                        {sources.length > 0 &&
                          !isLoading &&
                          streamedResults.summary && (
                            <motion.div
                              className="mt-4"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <h3 className="text-md font-semibold mb-2 text-blue-500">
                                Citations
                              </h3>
                              <div className="relative">
                                <div className="overflow-x-auto pb-4">
                                  <div
                                    className="grid grid-flow-col auto-cols-max gap-4"
                                    style={{
                                      gridTemplateColumns: `repeat(${Math.max(
                                        4,
                                        sources.length
                                      )}, minmax(250px, 1fr))`,
                                    }}
                                  >
                                    {sources.map((source, index) => (
                                      <motion.div
                                        key={index}
                                        className="w-[250px]"
                                        variants={itemVariants}
                                      >
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
                    {streamedResults.news.size > 0 && streamedResults.summary && (
                      <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
                        <h3 className="text-lg font-medium mb-2 text-blue-500">Relevant News Articles</h3>
                        <div className="relative w-full">
                          <div className={expandedSections.news ? "flex overflow-x-auto pb-2 space-x-4 no-scrollbar" : "grid grid-cols-4 gap-4"}>
                            {Array.from(streamedResults.news.values())
                              .slice(0, expandedSections.news ? undefined : 3)
                              .map((article, index) => (
                                <motion.div
                                  key={article.id}
                                  className={expandedSections.news ? "flex-shrink-0 w-64 mr-4" : ""}
                                  variants={itemVariants}
                                >
                                  <MinNewsCard article={article} />
                                </motion.div>
                              ))}
                            {streamedResults.news.size > 3 && (
                              <motion.div
                                className={expandedSections.news ? "flex-shrink-0 w-64" : ""}
                                variants={itemVariants}
                              >
                                <Card
                                  className="h-full flex flex-col justify-between cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleViewMore("news")}
                                >
                                  <CardContent className="p-3">
                                    <p className="text-blue-500 font-medium text-sm">
                                      {expandedSections.news
                                        ? "Show less"
                                        : `View ${streamedResults.news.size - 3} more`}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {streamedResults.ads.size > 0 && streamedResults.summary && (
                      <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
                        <h3 className="text-lg font-medium mb-2 text-blue-500">Relevant Political Advertisements</h3>
                        <div className="relative w-full">
                          <div className={expandedSections.ads ? "flex overflow-x-auto pb-2 space-x-4 no-scrollbar" : "grid grid-cols-4 gap-4"}>
                            {Array.from(streamedResults.ads.values())
                              .slice(0, expandedSections.ads ? undefined : 3)
                              .map((adSearchResult, index) => (
                                <motion.div
                                  key={adSearchResult.id}
                                  className={expandedSections.ads ? "flex-shrink-0 w-64 mr-4" : ""}
                                  variants={itemVariants}
                                >
                                  <MinAdSearchCard ad={adSearchResult as any} />
                                </motion.div>
                              ))}
                            {streamedResults.ads.size > 3 && (
                              <motion.div
                                className={expandedSections.ads ? "flex-shrink-0 w-64" : ""}
                                variants={itemVariants}
                              >
                                <Card
                                  className="h-full flex flex-col justify-between cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleViewMore("ads")}
                                >
                                  <CardContent className="p-3">
                                    <p className="text-blue-500 font-medium text-sm">
                                      {expandedSections.ads
                                        ? "Show less"
                                        : `View ${streamedResults.ads.size - 3} more`}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {streamedResults.tiktoks.size > 0 && streamedResults.summary && (
                      <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
                        <h3 className="text-lg font-medium mb-2 text-blue-500">Relevant TikToks</h3>
                        <div className="relative w-full">
                          <div className={expandedSections.tiktoks ? "flex overflow-x-auto pb-2 space-x-4 no-scrollbar" : "grid grid-cols-4 gap-4"}>
                            {Array.from(streamedResults.tiktoks.values())
                              .slice(0, expandedSections.tiktoks ? undefined : 3)
                              .map((tiktok, index) => (
                                <motion.div
                                  key={tiktok.id}
                                  className={expandedSections.tiktoks ? "flex-shrink-0 w-64 mr-4" : ""}
                                  variants={itemVariants}
                                >
                                  <MinTiktokCard tiktok={tiktok} />
                                </motion.div>
                              ))}
                            {streamedResults.tiktoks.size > 3 && (
                              <motion.div
                                className={expandedSections.tiktoks ? "flex-shrink-0 w-64" : ""}
                                variants={itemVariants}
                              >
                                <Card
                                  className="h-full flex flex-col justify-between cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleViewMore("tiktoks")}
                                >
                                  <CardContent className="p-3">
                                    <p className="text-blue-500 font-medium text-sm">
                                      {expandedSections.tiktoks
                                        ? "Show less"
                                        : `View ${streamedResults.tiktoks.size - 3} more`}
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

                  <div className="lg:col-span-1">
                    {(completedPlatforms.length > 0 || currentlyLoadingPlatform) && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <h2 className="text-xl font-semibold mb-4 text-blue-500">
                          Ad Creative Suggestions
                        </h2>
                        {completedPlatforms.length < platformOrder.length && (
                          <LoadingAnimation
                            completedPlatforms={completedPlatforms}
                            currentlyLoading={currentlyLoadingPlatform}
                          />
                        )}
                        <div className="space-y-4">
                          {Object.entries(adSuggestions).map(
                            ([platform, suggestions]) => (
                              <motion.div key={platform} variants={itemVariants}>
                                <AdSuggestionCollapsible
                                  platform={platform}
                                  suggestions={suggestions}
                                />
                              </motion.div>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : null}
          </main>
          <div className="sticky top-0 z-10 bg-transparent backdrop-filter backdrop-blur-lg">
            <div className="p-4 border-b border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Ask anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full h-12 pl-4 pr-12 rounded-lg border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200"
                  />
                  <Button
                    disabled={searching}
                    onClick={handleSearch}
                    className="absolute right-1 top-1 h-10 w-10 p-0 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-400 rounded-md transition-colors duration-200 flex items-center justify-center"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}