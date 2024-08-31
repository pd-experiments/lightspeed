"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import TopAdvertisers from '@/components/research/ads/TopAdvertisers';
import RecentAds from '@/components/research/ads/RecentAds';
import AdFormats from '@/components/research/ads/AdFormats';
import AgeTargeting from '@/components/research/ads/AgeTargeting';
import GenderTargeting from '@/components/research/ads/GenderTargeting';
import PoliticalLeanings from '@/components/research/ads/PoliticalLeanings';
import GeoTargeting from '@/components/research/ads/GeoTargeting';
import { supabase } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/ui/pageHeader';
import { getPoliticalIcon } from '@/lib/helperUtils/create/utils';
import { FaMeta } from 'react-icons/fa6';
import { FaGoogle } from 'react-icons/fa';
import KeywordAnalysis from '@/components/research/ads/KeywordAnalysis';
import ToneAnalysis from '@/components/research/ads/ToneAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from 'lucide-react';

export default function AdsDashboardPage() {
  const [data, setData] = useState({
    topAdvertisers: [],
    recentAds: [],
    adFormats: [],
    // ageTargeting: [],
    // genderTargeting: [],
    // geoTargeting: [],
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
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
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
        console.log('No data found, updating...');
        await updateData();
      } else {
        const now = new Date();
        console.log('Latest data found, checking update time...');
        console.log(latestData);
        const lastUpdate = new Date(latestData.created_at);
        const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastUpdate < 24) {
          console.log('Using cached data');
          setData({
            topAdvertisers: latestData.top_advertisers,
            recentAds: latestData.recent_ads,
            adFormats: latestData.ad_formats,
            // ageTargeting: latestData.age_targeting,
            // genderTargeting: latestData.gender_targeting,
            // geoTargeting: latestData.geo_targeting,
            politicalLeanings: latestData.political_leanings, 
            keywordAnalysis: latestData.keyword_analysis,
            toneAnalysis: latestData.tone_analysis,
            dateRangeAnalysis: latestData.date_range_analysis,
          });
        } else {
          await updateData();
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      await updateData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async () => {
    try {
      const [
        topAdvertisers,
        recentAds,
        adFormats,
        // ageTargeting,
        // genderTargeting,
        // geoTargeting,
        politicalLeanings, 
        keywordAnalysis,
        toneAnalysis,
        dateRangeAnalysis,
      ] = await Promise.all([
        fetch('/api/research/ads/top-advertisers').then(res => res.json()),
        fetch('/api/research/ads/recent-ads').then(res => res.json()),
        fetch('/api/research/ads/ad-formats').then(res => res.json()),
        // fetch('/api/research/ads/age-targeting').then(res => res.json()),
        // fetch('/api/research/ads/gender-targeting').then(res => res.json()),
        // fetch('/api/research/ads/geo-targeting').then(res => res.json()),
        fetch('/api/research/ads/political-leanings').then(res => res.json()),
        fetch('/api/research/ads/keyword-analysis').then(res => res.json()),
        fetch('/api/research/ads/tone-analysis').then(res => res.json()),
        fetch('/api/research/ads/date-range-analysis').then(res => res.json()),
      ]);

      const newData = {
        top_advertisers: topAdvertisers,
        recent_ads: recentAds,
        ad_formats: adFormats,
        // age_targeting: ageTargeting,
        // gender_targeting: genderTargeting,
        // geo_targeting: geoTargeting,
        political_leanings: politicalLeanings, 
        keyword_analysis: keywordAnalysis,
        tone_analysis: toneAnalysis,
        date_range_analysis: dateRangeAnalysis,
      };

      const { error } = await supabase
        .from('ai_ads_data')
        .insert(newData);

      if (error) throw error;

      setData({
        topAdvertisers,
        recentAds,
        adFormats,
        // ageTargeting,
        // genderTargeting,
        // geoTargeting,
        politicalLeanings, 
        keywordAnalysis,
        toneAnalysis,
        dateRangeAnalysis,
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
            text="What ads are my competitors running?"
            rightItem={
              <>
                {getPoliticalIcon("Democrat", 6)}
                {getPoliticalIcon("Republican", 6)}
                {getPoliticalIcon("Independent", 6)}
                <FaMeta className={`w-6 h-6`} />
                <FaGoogle className={`w-6 h-6`} />
              </>
            }
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopAdvertisers advertisers={data.topAdvertisers} isLoading={isLoading} />
            <RecentAds ads={data.recentAds} isLoading={isLoading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1">
              <AdFormats formats={data.adFormats} isLoading={isLoading} />
            </div>
            <div className="col-span-2">
              <PoliticalLeanings leanings={data.politicalLeanings} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  <KeywordAnalysis keywords={data.keywordAnalysis} isLoading={isLoading} />
  <ToneAnalysis tones={data.toneAnalysis} isLoading={isLoading} />
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
            <p>{data.dateRangeAnalysis.averageDuration.toFixed(2)} days</p>
          </div>
          <div>
            <h3 className="font-semibold">Longest Running Ad</h3>
            <p>{data.dateRangeAnalysis.longestRunningAd.days_ran_for} days</p>
          </div>
          <div>
            <h3 className="font-semibold">Most Recent Ad</h3>
            <p>{new Date(data.dateRangeAnalysis.mostRecentAd.last_shown).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">Oldest Ad</h3>
            <p>{new Date(data.dateRangeAnalysis.oldestAd.first_shown).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</div>
          
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <AgeTargeting targeting={data.ageTargeting} isLoading={isLoading} />
            <GenderTargeting targeting={data.genderTargeting} isLoading={isLoading} />
            <GeoTargeting targeting={data.geoTargeting} isLoading={isLoading} />
          </div> */}
        </div>
      </main>
    </Navbar>
  );
}