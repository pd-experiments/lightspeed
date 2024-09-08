import { NextApiRequest, NextApiResponse } from "next";
import { generateSearchSummaryWithCitations } from "@/lib/search/summary-generator";
import {
  EnhancedGoogleAd,
  NewsArticle,
  TikTok,
} from "@/lib/types/lightspeed-search";
import { analyzeNewsSearchQuery, searchNews } from "@/lib/search/search-news";
import {
  analyzeAdSearchQuery,
  searchAds,
} from "@/lib/search/search-google-ads";
import {
  analyzeTikTokSearchQuery,
  searchTikToks,
} from "@/lib/search/search-tiktoks";
import { openai_client } from "@/lib/openai-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const searchPromises = [
      runNewsSearch(query, sendEvent),
      runAdSearch(query, sendEvent),
      runTikTokSearch(query, sendEvent),
    ];

    const [newsResults, adResults, tiktokResults] = await Promise.all(
      searchPromises
    );

    const summary = await generateSearchSummaryWithCitations(
      query,
      adResults,
      newsResults,
      tiktokResults
    );
    for await (const chunk of summary) {
      sendEvent("summary", { message: chunk });
    }

    sendEvent("adSuggestionsStart", { message: "Generating ad suggestions" });
    const adSuggestionsGenerator = generateAdSuggestions({ summary, news: newsResults, ads: adResults, tiktoks: tiktokResults });
    for await (const platformSuggestions of adSuggestionsGenerator) {
      sendEvent("adSuggestions", { data: platformSuggestions });
    }

    sendEvent("done", { message: "Search completed" });
  } catch (error) {
    console.error("Error processing user query:", error);
    sendEvent("error", { error: "Error processing user query: " + error });
  } finally {
    res.end();
  }
}

async function runNewsSearch(
  query: string,
  sendEvent: (event: string, data: any) => void
) {
  const newsParams = await analyzeNewsSearchQuery(query);
  if (newsParams && newsParams.runSearchNews) {
    sendEvent("newsStart", { message: "Starting news search" });
    const results = await searchNews(
      newsParams.query,
      newsParams.keywords,
      newsParams.leanings,
      newsParams.tones,
      newsParams.alpha,
      newsParams.beta,
      newsParams.gamma,
      newsParams.delta,
      newsParams.epsilon
    );
    sendEvent("newsResults", { type: "news", data: results });
    return results;
  } else {
    sendEvent("newsSkipped", { message: "No news search parameters found" });
    return [];
  }
}

async function runAdSearch(
  query: string,
  sendEvent: (event: string, data: any) => void
) {
  const adParams = await analyzeAdSearchQuery(query);
  if (adParams && adParams.runSearchAds) {
    sendEvent("adStart", { message: "Starting ad search" });
    const results = await searchAds(
      adParams.query,
      adParams.advertiserName,
      adParams.keywords,
      adParams.leanings,
      adParams.tones,
      adParams.minSpend,
      adParams.maxSpend,
      adParams.minImpressions,
      adParams.maxImpressions,
      adParams.weightKeyword,
      adParams.weightLeaning,
      adParams.weightTones,
      adParams.weightEmbedding,
      adParams.weightRecency,
      adParams.weightAdvertiserName,
      adParams.weightSpend,
      adParams.weightImpressions
    );
    sendEvent("adResults", { type: "ads", data: results });
    return results;
  } else {
    sendEvent("adSkipped", { message: "No ad search parameters found" });
    return [];
  }
}

async function runTikTokSearch(
  query: string,
  sendEvent: (event: string, data: any) => void
) {
  const tiktoks = await analyzeTikTokSearchQuery(query);
  if (tiktoks && tiktoks.runSearchTikToks) {
    sendEvent("tiktokStart", { message: "Starting TikTok search" });
    const results = await searchTikToks(
      tiktoks.query,
      tiktoks.keywords,
      tiktoks.leanings,
      tiktoks.tones,
      tiktoks.minViews,
      tiktoks.maxViews,
      tiktoks.weightKeyword,
      tiktoks.weightLeaning,
      tiktoks.weightTones,
      tiktoks.weightEmbedding,
      tiktoks.weightRecency,
      tiktoks.weightViews
    );
    sendEvent("tiktokResults", { type: "tiktoks", data: results });
    return results;
  } else {
    sendEvent("tiktokSkipped", {
      message: "No TikTok search parameters found",
    });
    return [];
  }
}

export async function* generateAdSuggestions(streamedResults: any): AsyncGenerator<object, void, unknown> {
  const platforms = ['tiktok', 'facebook', 'instagram', 'connectedTV'];
  const prompt = `Based on the following information, generate trending ad creative suggestions for Democrats for TikTok, Facebook, Instagram, and Connected TV:

Summary: ${streamedResults.summary || ''}

Relevant News Articles: ${JSON.stringify(streamedResults.news ? streamedResults.news.slice(0, 5) : [])}

Relevant Political Ads: ${JSON.stringify(streamedResults.ads ? streamedResults.ads.slice(0, 5) : [])}

Relevant TikToks: ${JSON.stringify(streamedResults.tiktoks ? streamedResults.tiktoks.slice(0, 5) : [])}

Generate 3 ad creative suggestions for each platform (TikTok, Facebook, Instagram, Connected TV) in the following JSON format:
{
  "platform": "platform_name",
  "suggestions": [
    { "title": "Ad title", "description": "Brief ad description", "hashtags": ["tag1", "tag2"] },
    ...
  ]
}

Generate and yield suggestions for one platform at a time. Do not include any markdown formatting in your response.`;

  for (const platform of platforms) {
    const stream = await openai_client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert political ad strategist. Your responses should always be in valid JSON format without any markdown formatting." },
        { role: "user", content: `${prompt}\n\nNow, generate suggestions for the ${platform} platform.` }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    let accumulatedContent = '';

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        accumulatedContent += chunk.choices[0].delta.content;
      }
    }

    try {
      const cleanedContent = accumulatedContent.replace(/```json\n?|\n?```/g, '').trim();
      const parsedContent = JSON.parse(cleanedContent);
      yield parsedContent;
    } catch (error) {
      console.error(`Failed to parse ${platform} suggestions:`, error);
      yield { platform, error: "Failed to generate valid JSON suggestions" };
    }
  }
}