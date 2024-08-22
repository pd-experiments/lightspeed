"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import TrendingTopics from '@/components/dashboard/TrendingTopics';
import RecentThreads from '@/components/dashboard/RecentThreads';
import TikTokVideos from '@/components/dashboard/TikTokVideos';
import NewsArticles from '@/components/dashboard/NewsArticles';
import HotIssues from '@/components/dashboard/HotIssues';
import TikTokComments from '@/components/dashboard/TikTokComments';
import ContentThemes from '@/components/dashboard/ContentThemes';
import InfluentialFigures from '@/components/dashboard/InfluentialFigures';

export default function DashboardPage() {
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [hotIssues, setHotIssues] = useState([]);
    const [contentThemes, setContentThemes] = useState([]);
    const [influentialFigures, setInfluentialFigures] = useState([]);
    const [newsArticles, setNewsArticles] = useState([]);

    const [isLoadingTopics, setIsLoadingTopics] = useState(true);
    const [isLoadingIssues, setIsLoadingIssues] = useState(true);
    const [isLoadingThemes, setIsLoadingThemes] = useState(true);
    const [isLoadingFigures, setIsLoadingFigures] = useState(true);
    const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
    fetchHotIssues();
    fetchContentThemes();
    fetchInfluentialFigures();
    fetchNewsArticles();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch('/api/dashboard/trending-topics');
      const data = await response.json();
      setTrendingTopics(data);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const fetchHotIssues = async () => {
    try {
      const response = await fetch('/api/dashboard/hot-issues');
      const data = await response.json();
      setHotIssues(data);
    } catch (error) {
      console.error('Error fetching hot issues:', error);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const fetchContentThemes = async () => {
    try {
      const response = await fetch('/api/dashboard/content-themes');
      const data = await response.json();
      setContentThemes(data);
    } catch (error) {
      console.error('Error fetching content themes:', error);
    } finally {
      setIsLoadingThemes(false);
    }
  };

  const fetchInfluentialFigures = async () => {
    try {
      const response = await fetch('/api/dashboard/influential-figures');
      const data = await response.json();
      setInfluentialFigures(data);
    } catch (error) {
      console.error('Error fetching influential figures:', error);
    } finally {
      setIsLoadingFigures(false);
    }
  };

  const fetchNewsArticles = async () => {
    try {
      const response = await fetch('/api/dashboard/news-articles');
      const data = await response.json();
      setNewsArticles(data);
    } catch (error) {
      console.error('Error fetching news articles:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-4xl font-bold mb-8">Political Pulse Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TrendingTopics topics={trendingTopics} isLoading={isLoadingTopics} />
            <HotIssues issues={hotIssues} isLoading={isLoadingIssues} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ContentThemes themes={contentThemes} isLoading={isLoadingThemes} />
            <InfluentialFigures figures={influentialFigures} isLoading={isLoadingFigures} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <RecentThreads />
            <TikTokVideos />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TikTokComments />
            <NewsArticles articles={newsArticles} isLoading={isLoadingNews} />
          </div>
        </div>
      </main>
    </>
  );
}