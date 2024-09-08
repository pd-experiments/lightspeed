import { NextApiRequest, NextApiResponse } from "next";
import {
  analyzeAdSearchQuery,
  analyzeNewsSearchQuery,
  analyzeTikTokSearchQuery,
  generateSearchSummary,
  generateSearchSummaryWithCitations,
  searchAds,
  searchNews,
  searchTikToks,
} from "@/lib/new-search-engine";
import {
  EnhancedGoogleAd,
  NewsArticle,
  TikTok,
} from "@/lib/types/lightspeed-search";

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
    const newsParams = await analyzeNewsSearchQuery(query);

    let newsResults: Pick<
      NewsArticle,
      | "id"
      | "ai_summary"
      | "authors"
      | "created_at"
      | "political_keywords"
      | "political_leaning"
      | "political_tones"
      | "issues"
      | "publish_date"
      | "title"
      | "source_url"
    >[] = [];
    if (newsParams && newsParams.runSearchNews) {
      sendEvent("newsStart", { message: "Starting news search" });
      newsResults = await searchNews(
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
      sendEvent("newsResults", { type: "news", data: newsResults });
    } else {
      sendEvent("newsSkipped", { message: "No news search parameters found" });
    }

    const adParams = await analyzeAdSearchQuery(query);

    let adResults: Pick<
      EnhancedGoogleAd,
      | "id"
      | "summary"
      | "advertiser_name"
      | "gender_targeting"
      | "geo_targeting"
      | "targeted_ages"
      | "days_ran_for"
      | "keywords"
      | "political_leaning"
      | "tone"
      | "last_shown"
      | "first_shown"
      | "min_impressions"
      | "max_impressions"
      | "min_spend"
      | "max_spend"
    >[] = [];

    if (adParams && adParams.runSearchAds) {
      sendEvent("adStart", { message: "Starting ad search" });
      adResults = await searchAds(
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
      sendEvent("adResults", { type: "ads", data: adResults });
    } else {
      sendEvent("adSkipped", { message: "No ad search parameters found" });
    }

    const tiktoks = await analyzeTikTokSearchQuery(query);

    let tiktokResults: Pick<
      TikTok,
      | "id"
      | "author"
      | "created_at"
      | "views"
      | "summary"
      | "caption"
      | "hashtags"
      | "keywords"
      | "political_leaning"
      | "tone"
      | "topic"
    >[] = [];

    if (tiktoks && tiktoks.runSearchTikToks) {
      sendEvent("tiktokStart", { message: "Starting TikTok search" });
      tiktokResults = await searchTikToks(
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
      sendEvent("tiktokResults", { type: "tiktoks", data: tiktokResults });
    } else {
      sendEvent("tiktokSkipped", {
        message: "No TikTok search parameters found",
      });
    }

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
