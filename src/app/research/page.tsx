"use client";

import { useState, useCallback, useEffect } from 'react';
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Lightbulb, Search } from "lucide-react";
import { getPlatformIcon, getNewsIcon } from "@/lib/helperUtils/create/utils";
import UniversalSearchResults from "@/components/research/universalsearch/UniversalSearchResults";
import { SearchResults } from "@/lib/types/lightspeed-search";
import { PageHeader } from "@/components/ui/pageHeader";
import { FaMeta, FaGoogle } from "react-icons/fa6";
import { supabase } from "@/lib/supabaseClient";
import { Flame } from 'lucide-react';

export default function UniversalSearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [querySuggestions, setQuerySuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  const fetchQuerySuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data: latestData, error } = await supabase
        .from('ai_query_suggestions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!latestData || !latestData.created_at) {
        await updateQuerySuggestions();
      } else {
        const now = new Date();
        const lastUpdate = new Date(latestData.created_at);
        const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastUpdate < 24) {
          console.log('Using cached query suggestions');
          setQuerySuggestions(latestData.suggestions);
        } else {
          await updateQuerySuggestions();
        }
      }
    } catch (error) {
      console.error('Error fetching query suggestions:', error);
      setQuerySuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const updateQuerySuggestions = async () => {
    try {
      const response = await fetch('/api/research/generate-query-suggestions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const suggestions = await response.json();

      const { error } = await supabase
        .from('ai_query_suggestions')
        .insert({ suggestions });

      if (error) throw error;

      setQuerySuggestions(suggestions);
    } catch (error) {
      console.error('Error updating query suggestions:', error);
      setQuerySuggestions([]);
    }
  };

  useEffect(() => {
    fetchQuerySuggestions();
  }, [fetchQuerySuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/search-engine/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!response.ok) {
        throw new Error("Failed to perform search");
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
  };

  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center">
        <div className="w-full max-w-[1500px] gap-6 flex flex-col">
          <PageHeader
            text="Search through troves of online narrative data"
            rightItem={
              <>
                {getPlatformIcon("TikTok", 6)}
                {getPlatformIcon("Threads", 6)}
                {getPlatformIcon("Facebook", 6)}
                {getPlatformIcon("Instagram Post", 6)}
                {getNewsIcon("FOX", 6)}
                {getNewsIcon("CNN", 6)}
                {getNewsIcon("NYT", 6)}
                {getNewsIcon("Reuters", 6)}
                <FaMeta className="w-6 h-6" />
                <FaGoogle className="w-6 h-6" />
              </>
            }
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-2 w-full">
              <Input
                placeholder="Search across all platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-grow"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
            
            {!isLoadingSuggestions && querySuggestions.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 w-full">
                <div className="flex items-center gap-2 p-2 rounded-md font-semibold text-gray-600">
                  <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-500">Suggestions</p>
                  <ChevronRight className="w-4 h-4 text-yellow-500" />
                </div>
                {querySuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm text-blue-800 bg-blue-50 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <UniversalSearchResults query={searchQuery} results={searchResults} isLoading={isLoading} />
        </div>
      </main>
    </Navbar>
  );
}