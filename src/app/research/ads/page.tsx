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

export default function AdsDashboardPage() {
  const [topAdvertisers, setTopAdvertisers] = useState([]);
  const [recentAds, setRecentAds] = useState([]);
  const [adFormats, setAdFormats] = useState([]);
  const [ageTargeting, setAgeTargeting] = useState([]);
  const [genderTargeting, setGenderTargeting] = useState([]);
  const [geoTargeting, setGeoTargeting] = useState([]);
  const [politicalLeanings, setPoliticalLeanings] = useState([]);

  const [isLoadingAdvertisers, setIsLoadingAdvertisers] = useState(true);
  const [isLoadingRecentAds, setIsLoadingRecentAds] = useState(true);
  const [isLoadingAdFormats, setIsLoadingAdFormats] = useState(true);
  const [isLoadingAgeTargeting, setIsLoadingAgeTargeting] = useState(true);
  const [isLoadingGenderTargeting, setIsLoadingGenderTargeting] = useState(true);
  const [isLoadingPoliticalLeanings, setIsLoadingPoliticalLeanings] = useState(true);
  const [isLoadingGeoTargeting, setIsLoadingGeoTargeting] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    fetchTopAdvertisers();
    fetchRecentAds();
    fetchAdFormats();
    fetchAgeTargeting();
    fetchGenderTargeting();
    fetchPoliticalLeanings();
    fetchGeoTargeting();
  }

  const fetchTopAdvertisers = async () => {
    try {
      const response = await fetch('/api/research/ads/top-advertisers');
      const data = await response.json();
      setTopAdvertisers(data);
    } catch (error) {
      console.error('Error fetching top advertisers:', error);
    } finally {
      setIsLoadingAdvertisers(false);
    }
  };

  const fetchRecentAds = async () => {
    try {
      const response = await fetch('/api/research/ads/recent-ads');
      const data = await response.json();
      setRecentAds(data);
    } catch (error) {
      console.error('Error fetching recent ads:', error);
    } finally {
      setIsLoadingRecentAds(false);
    }
  };

  const fetchAdFormats = async () => {
    try {
      const response = await fetch('/api/research/ads/ad-formats');
      const data = await response.json();
      setAdFormats(data);
    } catch (error) {
      console.error('Error fetching ad formats:', error);
    } finally {
      setIsLoadingAdFormats(false);
    }
  };

  const fetchAgeTargeting = async () => {
    try {
      const response = await fetch('/api/research/ads/age-targeting');
      const data = await response.json();
      setAgeTargeting(data);
    } catch (error) {
      console.error('Error fetching age targeting:', error);
    } finally {
      setIsLoadingAgeTargeting(false);
    }
  };

  const fetchGenderTargeting = async () => {
    try {
      const response = await fetch('/api/research/ads/gender-targeting');
      const data = await response.json();
      setGenderTargeting(data);
    } catch (error) {
      console.error('Error fetching gender targeting:', error);
    } finally {
      setIsLoadingGenderTargeting(false);
    }
  };

  const fetchGeoTargeting = async () => {
    try {
      const response = await fetch('/api/research/ads/geo-targeting');
      const data = await response.json();
      setGeoTargeting(data);
    } catch (error) {
      console.error('Error fetching geo targeting:', error);
    } finally {
      setIsLoadingGeoTargeting(false);
    }
  };

  const fetchPoliticalLeanings = async () => {
    try {
      const response = await fetch('/api/research/ads/political-leanings');
      const data = await response.json();
      setPoliticalLeanings(data);
    } catch (error) {
      console.error('Error fetching political leanings:', error);
    } finally {
      setIsLoadingPoliticalLeanings(false);
    }
  };

  return (
    <Navbar>
      <main className="bg-gray-100 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                What Ads Are Running?
              </h1>
            </div>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopAdvertisers advertisers={topAdvertisers} isLoading={isLoadingAdvertisers} />
            <RecentAds ads={recentAds} isLoading={isLoadingRecentAds} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1">
              <AdFormats formats={adFormats} isLoading={isLoadingAdFormats} />
            </div>
            <div className="col-span-2">
              <PoliticalLeanings leanings={politicalLeanings} isLoading={isLoadingPoliticalLeanings} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <AgeTargeting targeting={ageTargeting} isLoading={isLoadingAgeTargeting} />
            <GenderTargeting targeting={genderTargeting} isLoading={isLoadingGenderTargeting} />
            <GeoTargeting targeting={geoTargeting} isLoading={isLoadingGeoTargeting} />
          </div>
        </div>
      </main>
    </Navbar>
  );
}