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
import { Button } from '@/components/ui/button';

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
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    fetchTrendingTopics();
    fetchHotIssues();
    fetchContentThemes();
    fetchInfluentialFigures();
    fetchNewsArticles();
  }

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch('/api/research/conversations/trending-topics');
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
      const response = await fetch('/api/research/conversations/hot-issues');
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
      const response = await fetch('/api/research/conversations/content-themes');
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
      const response = await fetch('/api/research/conversations/influential-figures');
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
      const response = await fetch('/api/research/conversations/news-articles');
      const data = await response.json();
      setNewsArticles(data);
    } catch (error) {
      console.error('Error fetching news articles:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <Navbar>
        <main className="bg-gray-100 min-h-screen">
        <div className="max-w-[1500px] mx-auto">
        <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                What&apos;s everyone talking about?
              </h1>
            </div>
          </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
                <div className="h-[600px]">
                <TrendingTopics topics={trendingTopics} isLoading={isLoadingTopics} />
                </div>
            </div>
            <div className="lg:col-span-3">
                <div className="h-[600px]">
                <HotIssues issues={hotIssues} isLoading={isLoadingIssues} />
                </div>
            </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <ContentThemes themes={contentThemes} isLoading={isLoadingThemes} />
            <InfluentialFigures figures={influentialFigures} isLoading={isLoadingFigures} />
            <NewsArticles articles={newsArticles} isLoading={isLoadingNews} />
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