"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { supabase } from '@/lib/supabaseClient';
import TrendingTopics from '@/components/dashboard/TrendingTopics';
import RecentThreads from '@/components/dashboard/RecentThreads';
import TikTokVideos from '@/components/dashboard/TikTokVideos';
import NewsArticles from '@/components/dashboard/NewsArticles';
import HotIssues from '@/components/dashboard/HotIssues';
import TikTokComments from '@/components/dashboard/TikTokComments';
import ContentThemes from '@/components/dashboard/ContentThemes';
import InfluentialFigures from '@/components/dashboard/InfluentialFigures';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [hotIssues, setHotIssues] = useState([]);
    const [contentThemes, setContentThemes] = useState([]);
    const [influentialFigures, setInfluentialFigures] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        topicsResponse,
        issuesResponse,
        themesResponse,
        figuresResponse
      ] = await Promise.all([
        fetch('/api/dashboard/trending-topics'),
        fetch('/api/dashboard/hot-issues'),
        fetch('/api/dashboard/content-themes'),
        fetch('/api/dashboard/influential-figures'),
      ]);
  
      const [topics, issues, themes, figures] = await Promise.all([
        topicsResponse.json(),
        issuesResponse.json(),
        themesResponse.json(),
        figuresResponse.json(),
      ]);
  
      setTrendingTopics(topics);
      setHotIssues(issues);
      setContentThemes(themes);
      setInfluentialFigures(figures);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-4xl font-bold mb-8">Political Pulse Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TrendingTopics topics={trendingTopics} isLoading={isLoading} />
            <HotIssues issues={hotIssues} isLoading={isLoading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ContentThemes themes={contentThemes} isLoading={isLoading} />
            <InfluentialFigures figures={influentialFigures} isLoading={isLoading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <RecentThreads />
            <TikTokVideos />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TikTokComments />
            <NewsArticles />
          </div>
        </div>
      </main>
    </>
  );
}