"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/ui/pageHeader';
import { getPlatformIcon, getPoliticalIcon } from '@/lib/helperUtils/create/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaMeta, FaGoogle } from 'react-icons/fa6';

// Import components from conversations page
import TrendingTopics from '@/components/research/conversations/TrendingTopics';
import RecentThreads from '@/components/research/conversations/RecentThreads';
import TikTokVideos from '@/components/research/conversations/TikTokVideos';
import NewsArticles from '@/components/research/conversations/NewsArticles';
import HotIssues from '@/components/research/conversations/HotIssues';
import TikTokComments from '@/components/research/conversations/TikTokComments';
import ContentThemes from '@/components/research/conversations/ContentThemes';
import InfluentialFigures from '@/components/research/conversations/InfluentialFigures';

// Import components from ads page
import TopAdvertisers from '@/components/research/ads/TopAdvertisers';
import RecentAds from '@/components/research/ads/RecentAds';
import AdFormats from '@/components/research/ads/AdFormats';
import PoliticalLeanings from '@/components/research/ads/PoliticalLeanings';
import KeywordAnalysis from '@/components/research/ads/KeywordAnalysis';
import ToneAnalysis from '@/components/research/ads/ToneAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from 'lucide-react';

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversationsData, setConversationsData] = useState({
    trendingTopics: [],
    hotIssues: [],
    contentThemes: [],
    influentialFigures: [],
    newsArticles: []
  });
  const [adsData, setAdsData] = useState({
    topAdvertisers: [],
    recentAds: [],
    adFormats: [],
    politicalLeanings: [],
    keywordAnalysis: [],
    toneAnalysis: [],
    dateRangeAnalysis: {
      averageDuration: 0,
      longestRunningAd: { days_ran_for: 0 },
      mostRecentAd: { last_shown: '' },
      oldestAd: { first_shown: '' },
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'conversations') {
        await fetchConversationsData();
      } else {
        await fetchAdsData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationsData = async () => {
    try {
      const { data: latestData, error } = await supabase
        .from('ai_conversations_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const now = new Date();
      const lastUpdate = latestData ? new Date(latestData.created_at) : new Date(0);
      const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (latestData && hoursSinceLastUpdate < 24) {
        setConversationsData({
          trendingTopics: latestData.trending_topics,
          hotIssues: latestData.hot_issues,
          contentThemes: latestData.content_themes,
          influentialFigures: latestData.influential_figures,
          newsArticles: latestData.news_articles
        });
      } else {
        await updateConversationsData();
      }
    } catch (error) {
      console.error('Error fetching conversations data:', error);
    }
  };

  const updateConversationsData = async () => {
    try {
      const [trendingTopics, hotIssues, contentThemes, influentialFigures, newsArticles] = await Promise.all([
        fetch('/api/research/conversations/trending-topics').then(res => res.json()),
        fetch('/api/research/conversations/hot-issues').then(res => res.json()),
        fetch('/api/research/conversations/content-themes').then(res => res.json()),
        fetch('/api/research/conversations/influential-figures').then(res => res.json()),
        fetch('/api/research/conversations/news-articles').then(res => res.json())
      ]);

      const newData = {
        trending_topics: trendingTopics,
        hot_issues: hotIssues,
        content_themes: contentThemes,
        influential_figures: influentialFigures,
        news_articles: newsArticles
      };

      const { error } = await supabase
        .from('ai_conversations_data')
        .insert(newData);

      if (error) throw error;

      setConversationsData({
        trendingTopics,
        hotIssues,
        contentThemes,
        influentialFigures,
        newsArticles
      });
    } catch (error) {
      console.error('Error updating conversations data:', error);
    }
  };

  const fetchAdsData = async () => {
    try {
      const { data: latestData, error } = await supabase
        .from('ai_ads_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!latestData || !latestData.created_at) {
        await updateAdsData();
      } else {
        const now = new Date();
        const lastUpdate = new Date(latestData.created_at);
        const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastUpdate < 24) {
          setAdsData({
            topAdvertisers: latestData.top_advertisers,
            recentAds: latestData.recent_ads,
            adFormats: latestData.ad_formats,
            politicalLeanings: latestData.political_leanings,
            keywordAnalysis: latestData.keyword_analysis,
            toneAnalysis: latestData.tone_analysis,
            dateRangeAnalysis: latestData.date_range_analysis,
          });
        } else {
          await updateAdsData();
        }
      }
    } catch (error) {
      console.error('Error fetching ads data:', error);
      await updateAdsData();
    }
  };

  const updateAdsData = async () => {
    try {
      const [
        topAdvertisers,
        recentAds,
        adFormats,
        politicalLeanings,
        keywordAnalysis,
        toneAnalysis,
        dateRangeAnalysis,
      ] = await Promise.all([
        fetch('/api/research/ads/top-advertisers').then(res => res.json()),
        fetch('/api/research/ads/recent-ads').then(res => res.json()),
        fetch('/api/research/ads/ad-formats').then(res => res.json()),
        fetch('/api/research/ads/political-leanings').then(res => res.json()),
        fetch('/api/research/ads/keyword-analysis').then(res => res.json()),
        fetch('/api/research/ads/tone-analysis').then(res => res.json()),
        fetch('/api/research/ads/date-range-analysis').then(res => res.json()),
      ]);

      const newData = {
        top_advertisers: topAdvertisers,
        recent_ads: recentAds,
        ad_formats: adFormats,
        political_leanings: politicalLeanings,
        keyword_analysis: keywordAnalysis,
        tone_analysis: toneAnalysis,
        date_range_analysis: dateRangeAnalysis,
      };

      const { error } = await supabase
        .from('ai_ads_data')
        .insert(newData);

      if (error) throw error;

      setAdsData({
        topAdvertisers,
        recentAds,
        adFormats,
        politicalLeanings,
        keywordAnalysis,
        toneAnalysis,
        dateRangeAnalysis,
      });
    } catch (error) {
      console.error('Error updating ads data:', error);
    }
  };

  return (
    <Navbar>
      <main className="bg-gray-100 min-h-screen">
        <div className="max-w-[1500px] mx-auto p-4">
          <PageHeader
            text={activeTab === 'conversations' ? "What's everyone talking about?" : "What ads are my competitors running?"}
            rightItem={
              activeTab === 'conversations' ? (
                <>
                  {getPlatformIcon("TikTok", 6)}
                  {getPlatformIcon("Threads", 6)}
                  {getPlatformIcon("Facebook", 6)}
                  {getPlatformIcon("Instagram Post", 6)}
                </>
              ) : (
                <>
                  {getPoliticalIcon("Democrat", 6)}
                  {getPoliticalIcon("Republican", 6)}
                  {getPoliticalIcon("Independent", 6)}
                  <FaMeta className={`w-6 h-6`} />
                  <FaGoogle className={`w-6 h-6`} />
                </>
              )
            }
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="ads">Advertisements</TabsTrigger>
            </TabsList>
            <TabsContent value="conversations">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <div className="h-[600px]">
                    <TrendingTopics topics={conversationsData.trendingTopics} isLoading={isLoading} />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="h-[600px]">
                    <HotIssues issues={conversationsData.hotIssues} isLoading={isLoading} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <ContentThemes themes={conversationsData.contentThemes} isLoading={isLoading} />
                <InfluentialFigures figures={conversationsData.influentialFigures} isLoading={isLoading} />
                <NewsArticles articles={conversationsData.newsArticles} isLoading={isLoading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <RecentThreads />
                <TikTokVideos />
                <TikTokComments />
              </div>
            </TabsContent>
            <TabsContent value="ads">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <TopAdvertisers advertisers={adsData.topAdvertisers} isLoading={isLoading} />
                <RecentAds ads={adsData.recentAds} isLoading={isLoading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="col-span-1">
                  <AdFormats formats={adsData.adFormats} isLoading={isLoading} />
                </div>
                <div className="col-span-2">
                  <PoliticalLeanings leanings={adsData.politicalLeanings} isLoading={isLoading} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <KeywordAnalysis keywords={adsData.keywordAnalysis} isLoading={isLoading} />
                <ToneAnalysis tones={adsData.toneAnalysis} isLoading={isLoading} />
              </div>
              <div className="mt-6">
                <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="border-b bg-gray-50 p-4">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Ad Campaign Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isLoading ? (
                      <Skeleton className="w-full h-24" />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold">Average Duration</h3>
                          <p>{adsData.dateRangeAnalysis.averageDuration.toFixed(2)} days</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Longest Running Ad</h3>
                          <p>{adsData.dateRangeAnalysis.longestRunningAd.days_ran_for} days</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Most Recent Ad</h3>
                          <p>{new Date(adsData.dateRangeAnalysis.mostRecentAd.last_shown).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Oldest Ad</h3>
                          <p>{new Date(adsData.dateRangeAnalysis.oldestAd.first_shown).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Navbar>
  );
}