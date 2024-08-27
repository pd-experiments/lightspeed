"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import TrendingTopics from '@/components/research/conversations/TrendingTopics';
import RecentThreads from '@/components/research/conversations/RecentThreads';
import TikTokVideos from '@/components/research/conversations/TikTokVideos';
import NewsArticles from '@/components/research/conversations/NewsArticles';
import HotIssues from '@/components/research/conversations/HotIssues';
import TikTokComments from '@/components/research/conversations/TikTokComments';
import ContentThemes from '@/components/research/conversations/ContentThemes';
import InfluentialFigures from '@/components/research/conversations/InfluentialFigures';
import { supabase } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/ui/pageHeader';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';

export default function DashboardPage() {
  const [data, setData] = useState({
    trendingTopics: [],
    hotIssues: [],
    contentThemes: [],
    influentialFigures: [],
    newsArticles: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
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
        console.log("latestData")
        setData({
          trendingTopics: latestData.trending_topics,
          hotIssues: latestData.hot_issues,
          contentThemes: latestData.content_themes,
          influentialFigures: latestData.influential_figures,
          newsArticles: latestData.news_articles
        });
      } else {
        console.log("updating data")
        await updateData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async () => {
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

      setData({
        trendingTopics,
        hotIssues,
        contentThemes,
        influentialFigures,
        newsArticles
      });
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <Navbar>
      <main className="bg-gray-100 min-h-screen">
        <div className="max-w-[1500px] mx-auto">
          <PageHeader
            text="What&apos;s everyone talking about?"
            rightItem={
              <>
                {getPlatformIcon("TikTok", 6)}
                {getPlatformIcon("Threads", 6)}
                {getPlatformIcon("Facebook", 6)}
                {getPlatformIcon("Instagram Post", 6)}
              </>
            }
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="h-[600px]">
                <TrendingTopics topics={data.trendingTopics} isLoading={isLoading} />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-[600px]">
                <HotIssues issues={data.hotIssues} isLoading={isLoading} />
              </div>
            </div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <ContentThemes themes={data.contentThemes} isLoading={isLoading} />
            <InfluentialFigures figures={data.influentialFigures} isLoading={isLoading} />
            <NewsArticles articles={data.newsArticles} isLoading={isLoading} />
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <RecentThreads />
            <TikTokVideos />
            <TikTokComments />
          </div>
        </div>
      </main>
    </Navbar>
  );
}