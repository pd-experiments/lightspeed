import { NextApiRequest, NextApiResponse } from "next";
import { generateSearchSummaryWithCitations } from "@/lib/new-search-engine";
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
