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

export default function AdsDashboardPage() {
  const [data, setData] = useState({
    topAdvertisers: [],
    recentAds: [],
    adFormats: [],
    ageTargeting: [],
    genderTargeting: [],
    geoTargeting: [],
    politicalLeanings: []
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
        await updateData();
      } else {
        const now = new Date();
        const lastUpdate = new Date(latestData.created_at);
        const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastUpdate < 24) {
          console.log('Using cached data');
          setData({
            topAdvertisers: latestData.top_advertisers,
            recentAds: latestData.recent_ads,
            adFormats: latestData.ad_formats,
            ageTargeting: latestData.age_targeting,
            genderTargeting: latestData.gender_targeting,
            geoTargeting: latestData.geo_targeting,
            politicalLeanings: latestData.political_leanings
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
        ageTargeting,
        genderTargeting,
        geoTargeting,
        politicalLeanings
      ] = await Promise.all([
        fetch('/api/research/ads/top-advertisers').then(res => res.json()),
        fetch('/api/research/ads/recent-ads').then(res => res.json()),
        fetch('/api/research/ads/ad-formats').then(res => res.json()),
        fetch('/api/research/ads/age-targeting').then(res => res.json()),
        fetch('/api/research/ads/gender-targeting').then(res => res.json()),
        fetch('/api/research/ads/geo-targeting').then(res => res.json()),
        fetch('/api/research/ads/political-leanings').then(res => res.json())
      ]);

      const newData = {
        top_advertisers: topAdvertisers,
        recent_ads: recentAds,
        ad_formats: adFormats,
        age_targeting: ageTargeting,
        gender_targeting: genderTargeting,
        geo_targeting: geoTargeting,
        political_leanings: politicalLeanings
      };

      const { error } = await supabase
        .from('ai_ads_data')
        .insert(newData);

      if (error) throw error;

      setData({
        topAdvertisers,
        recentAds,
        adFormats,
        ageTargeting,
        genderTargeting,
        geoTargeting,
        politicalLeanings
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
            text="What Ads Are Running?"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <AgeTargeting targeting={data.ageTargeting} isLoading={isLoading} />
            <GenderTargeting targeting={data.genderTargeting} isLoading={isLoading} />
            <GeoTargeting targeting={data.geoTargeting} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </Navbar>
  );
}