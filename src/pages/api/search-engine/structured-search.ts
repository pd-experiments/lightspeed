import { NextApiRequest, NextApiResponse } from "next";
import { generateSearchSummaryWithCitations } from "@/lib/search/summary-generator";
import { analyzeNewsSearchQuery, searchNews } from "@/lib/search/search-news";
import {
  analyzeAdSearchQuery,
  searchAds,
} from "@/lib/search/search-google-ads";
import {
  analyzeTikTokSearchQuery,
  searchTikToks,
} from "@/lib/search/search-tiktoks";
import { openai_client, OpenAIWithHistory } from "@/lib/openai-client";
import { v4 as uuidv4 } from "uuid";

const map_openai_client_history_id_to_client = new Map<
  string,
  OpenAIWithHistory
>();

interface AdSuggestion {
  description: string;
  textContent: string;
  hashtags: string[];
  politicalLeaning: string;
  imageDescription: string;
  callToAction: string;
}

interface AdSuggestionResult {
  platform: string;
  suggestions: AdSuggestion[];
}

interface GenerateAdSuggestionsResult {
  type: "platformComplete" | "platformError";
  data: AdSuggestionResult | { platform: string; error: string; suggestions: never[] };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query, openai_client_history_id } = req.query;

  let openai_client_history_id_for_session = openai_client_history_id;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  if (
    !openai_client_history_id_for_session ||
    typeof openai_client_history_id_for_session !== "string"
  ) {
    // Create a new OpenAIWithHistory client and add it to the map
    console.log(
      "Creating new OpenAIWithHistory client for new session (no id)"
    );
    openai_client_history_id_for_session = uuidv4();
    map_openai_client_history_id_to_client.set(
      openai_client_history_id_for_session,
      new OpenAIWithHistory()
    );
  } else if (
    !map_openai_client_history_id_to_client.has(
      openai_client_history_id_for_session
    )
  ) {
    console.log(
      "Creating new OpenAIWithHistory client for new session (given id)"
    );
    map_openai_client_history_id_to_client.set(
      openai_client_history_id_for_session,
      new OpenAIWithHistory()
    );
  }

  const openai_client_with_history = map_openai_client_history_id_to_client.get(
    openai_client_history_id_for_session
  );

  console.log(
    "OpenAI client history ID for session:",
    openai_client_history_id_for_session
  );

  if (!openai_client_with_history) {
    return res.status(500).json({ error: "Internal server error" });
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
      runNewsSearch(query, sendEvent, openai_client_with_history),
      runAdSearch(query, sendEvent, openai_client_with_history),
      runTikTokSearch(query, sendEvent, openai_client_with_history),
    ];

    const [newsResults, adResults, tiktokResults] = await Promise.all(
      searchPromises
    );

    sendEvent("newsResults", { type: "news", data: newsResults });
    sendEvent("adResults", { type: "ads", data: adResults });
    sendEvent("tiktokResults", { type: "tiktoks", data: tiktokResults });

    const summary = await generateSearchSummaryWithCitations(
      query,
      adResults,
      newsResults,
      tiktokResults
    );
    sendEvent("summaryStart", { message: "Generating summary" });
    for await (const chunk of summary) {
      sendEvent("summary", { message: chunk });
    }

    const adSuggestions = [];

    sendEvent("adSuggestionsStart", { message: "Generating ad suggestions" });
    const adSuggestionsGenerator = generateAdSuggestions({
      summary,
      news: newsResults,
      ads: adResults,
      tiktoks: tiktokResults,
    });
    for await (const result of adSuggestionsGenerator) {
      if (result.type === "platformComplete") {
        sendEvent("adSuggestions", { data: result.data });
        adSuggestions.push(result.data);
      } else if (result.type === "platformError") {
        sendEvent("adSuggestionsError", { data: result.data });
      }
    }

    if (
      adResults.length > 0 ||
      newsResults.length > 0 ||
      tiktokResults.length > 0 ||
      adSuggestions.length > 0
    ) {
      openai_client_with_history.addMultipleToHistory([
        { role: "user", content: query },
        {
          role: "assistant",
          content: `
        Summary: ${JSON.stringify(summary)}\n
        Ad Results: ${JSON.stringify(adResults)}\n
        News Results: ${JSON.stringify(newsResults)}\n
        TikTok Results: ${JSON.stringify(tiktokResults)}
        Ad Suggestions generated: ${JSON.stringify(adSuggestions)}
        `,
        },
      ]);
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
  sendEvent: (event: string, data: any) => void,
  openai_client_with_history: OpenAIWithHistory
) {
  const newsParams = await analyzeNewsSearchQuery(
    openai_client_with_history,
    query
  );
  if (newsParams && newsParams.runSearchNews) {
    sendEvent("newsStart", { message: "Starting news search" });
    const results = await searchNews(
      openai_client_with_history,
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

    // openai_client_with_history.addMultipleToHistory([
    //   {
    //     role: "user",
    //     content: query,
    //   },
    //   {
    //     role: "assistant",
    //     content: JSON.stringify(results),
    //   },
    // ]);

    sendEvent("newsResults", { type: "news", data: results });
    return results;
  } else {
    sendEvent("newsSkipped", { message: "No news search parameters found" });
    return [];
  }
}

async function runAdSearch(
  query: string,
  sendEvent: (event: string, data: any) => void,
  openai_client_with_history: OpenAIWithHistory
) {
  const adParams = await analyzeAdSearchQuery(
    openai_client_with_history,
    query
  );
  if (adParams && adParams.runSearchAds) {
    sendEvent("adStart", { message: "Starting ad search" });
    const results = await searchAds(
      openai_client_with_history,
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
    // openai_client_with_history.addMultipleToHistory([
    //   {
    //     role: "user",
    //     content: query,
    //   },
    //   {
    //     role: "assistant",
    //     content: JSON.stringify(results),
    //   },
    // ]);
    sendEvent("adResults", { type: "ads", data: results });
    return results;
  } else {
    sendEvent("adSkipped", { message: "No ad search parameters found" });
    return [];
  }
}

async function runTikTokSearch(
  query: string,
  sendEvent: (event: string, data: any) => void,
  openai_client_with_history: OpenAIWithHistory
) {
  const tiktoks = await analyzeTikTokSearchQuery(
    openai_client_with_history,
    query
  );
  if (tiktoks && tiktoks.runSearchTikToks) {
    sendEvent("tiktokStart", { message: "Starting TikTok search" });
    const results = await searchTikToks(
      openai_client_with_history,
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
    // openai_client_with_history.addMultipleToHistory([
    //   {
    //     role: "user",
    //     content: query,
    //   },
    //   {
    //     role: "assistant",
    //     content: JSON.stringify(results),
    //   },
    // ]);
    sendEvent("tiktokResults", { type: "tiktoks", data: results });
    return results;
  } else {
    sendEvent("tiktokSkipped", {
      message: "No TikTok search parameters found",
    });
    return [];
  }
}

export async function* generateAdSuggestions(
  streamedResults: any
): AsyncGenerator<GenerateAdSuggestionsResult, void, unknown> {
  const platforms = [
    "tiktok",
    "facebook",
    "instagram",
    "connectedTV",
    "threads",
  ];

  const prompt = `Based on the following information, generate brief, trendy ad creative suggestions for Democrats that appeal to younger generations, especially Gen Z:

Summary: ${streamedResults.summary || ""}

Relevant News Articles: ${JSON.stringify(
    streamedResults.news ? streamedResults.news.slice(0, 5) : []
  )}

Relevant Political Ads: ${JSON.stringify(
    streamedResults.ads ? streamedResults.ads.slice(0, 5) : []
  )}

Relevant TikToks: ${JSON.stringify(
    streamedResults.tiktoks ? streamedResults.tiktoks.slice(0, 5) : []
  )}

Generate 3 concise, engaging ad creative suggestions for the specified platform. Ensure content is brief, to the point, and aligns with current trending narratives. Focus on issues that resonate with Gen Z and younger millennials. Use platform-specific language and trends. Keep political messaging subtle but effective.`;

  for (const platform of platforms) {
    try {
      const response = await openai_client.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert political ad strategist for the Democratic party.",
          },
          {
            role: "user",
            content: `${prompt}\n\nNow, generate suggestions for the ${platform} platform.`,
          },
        ],
        functions: [
          {
            name: "generate_ad_suggestions",
            parameters: {
              type: "object",
              properties: {
                platform: { type: "string" },
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      textContent: { type: "string" },
                      hashtags: { type: "array", items: { type: "string" } },
                      politicalLeaning: { type: "string" },
                      imageDescription: { type: "string" },
                      callToAction: { type: "string" },
                    },
                    required: ["description", "textContent", "hashtags", "politicalLeaning", "imageDescription", "callToAction"],
                  },
                },
              },
              required: ["platform", "suggestions"],
            },
          },
        ],
        function_call: { name: "generate_ad_suggestions" },
      });

      const functionCall = response.choices[0].message.function_call;
      if (functionCall && functionCall.arguments) {
        const parsedContent = JSON.parse(functionCall.arguments);
        yield { type: "platformComplete", data: parsedContent };
      } else {
        throw new Error("Invalid function call response");
      }
    } catch (error) {
      console.error(`Failed to generate suggestions for ${platform}:`, error);
      yield { type: "platformError", data: { platform, error: "Failed to generate valid suggestions", suggestions: [] } };
    }
  }
}