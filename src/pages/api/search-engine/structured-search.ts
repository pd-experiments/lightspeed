import { NextApiRequest, NextApiResponse } from "next";
import {
  analyzeAdSearchQuery,
  analyzeNewsSearchQuery,
  processUserQuery,
  searchAds,
  searchNews,
} from "@/lib/new-search-engine";

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

    if (newsParams && newsParams.runSearchNews) {
      sendEvent("newsStart", { message: "Starting news search" });
      const newsResults = await searchNews(
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

    if (adParams && adParams.runSearchAds) {
      sendEvent("adStart", { message: "Starting ad search" });
      const adResults = await searchAds(
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

    sendEvent("done", { message: "Search completed" });
  } catch (error) {
    console.error("Error processing user query:", error);
    sendEvent("error", { error: "Error processing user query: " + error });
  } finally {
    res.end();
  }
}
