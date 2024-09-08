import {
  getEmbedding,
  openai_client,
  OpenAIWithHistory,
} from "../openai-client";
import { supabase } from "../supabaseClient";
import {
  PoliticalKeyword,
  PoliticalKeywordEnum,
  PoliticalLeaning,
  PoliticalLeaningEnum,
  PoliticalTone,
  PoliticalToneEnum,
  TikTok,
} from "../types/lightspeed-search";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { RelevanceScoreSchema } from "../utils";

// Updated function to search TikToks
export async function searchTikToks(
  openai_client: OpenAIWithHistory,
  query: string,
  keywords: PoliticalKeyword[],
  leanings: PoliticalLeaning[],
  tones: PoliticalTone[],
  minViews: number | null = null,
  maxViews: number | null = null,
  weightKeyword: number = 0.25,
  weightLeaning: number = 0.2,
  weightTones: number = 0.1,
  weightEmbedding: number = 0.35,
  weightRecency: number = 0.1,
  weightViews: number = 0.1
): Promise<any[]> {
  try {
    const queryEmbedding = await getEmbedding(query);

    const { data, error } = await supabase
      .rpc("search_tiktok_advanced", {
        _keywords: keywords,
        _embedding: queryEmbedding,
        _leaning: leanings,
        _tones: tones,
        _min_views: minViews,
        _max_views: maxViews,
        _keyword_weight: weightKeyword,
        _leaning_weight: weightLeaning,
        _tones_weight: weightTones,
        _embedding_weight: weightEmbedding,
        _date_weight: weightRecency,
        _views_weight: weightViews,
      })
      .returns<TikTok[]>();

    if (error) {
      console.error("Error calling search TikToks RPC:", error);
      return [];
    }

    // Create an array of promises for getTikTokRelevanceScore
    const relevanceScorePromises = data
      .slice(0, 50)
      .map((tiktok: TikTok) =>
        getTikTokRelevanceScore(openai_client, query, tiktok)
      );
    // Execute all promises concurrently
    const relevanceScores = await Promise.all(relevanceScorePromises);

    // Filter TikToks based on relevance scores
    return data
      .filter((_, index: number) => relevanceScores[index] >= 0.5)
      .slice(0, 20);
  } catch (error) {
    console.error("Error in searchTikToks function:", error);
    return [];
  }
}

// Updated Zod schema for TikTok search parameters
const SearchTikToksParamsSchema = z.object({
  runSearchTikToks: z.boolean(),
  query: z.string(),
  keywords: z.array(PoliticalKeywordEnum),
  leanings: z.array(PoliticalLeaningEnum),
  tones: z.array(PoliticalToneEnum),
  minViews: z.number().nullable(),
  maxViews: z.number().nullable(),
  weightKeyword: z.number(),
  weightLeaning: z.number(),
  weightTones: z.number(),
  weightEmbedding: z.number(),
  weightRecency: z.number(),
  weightViews: z.number(),
});

type SearchTikToksParams = z.infer<typeof SearchTikToksParamsSchema>;

export async function analyzeTikTokSearchQuery(
  openai_client: OpenAIWithHistory,
  userQuery: string
): Promise<SearchTikToksParams | null> {
  const parsed = await openai_client.sendParsedMessage(
    `You are an AI assistant that analyzes user queries to determine if they should be processed by the searchTikToks function. If applicable, you should provide appropriate parameters for the function.

Rules:
1. Determine if the user query should be processed by the searchTikToks function, i.e. if you think giving TikTok data back to the user is relevant, then you should set runSearchTikToks to true. Otherwise, set runSearchTikToks to false.
2. If relevant, set runSearchTikToks to true and provide parameters.
3. If not relevant, set runSearchTikToks to false and use default values for other fields.
4. When setting weights, ensure that they sum up to 1.
5. TikTok success is measured by high views.
6. At most 4 weights can be non-zero. The rest should be zero.

Parameters:
- query: Construct a thorough search query of what specifically the user wants.
- keywords: Relevant political keywords (array of PoliticalKeyword enum values)
- leanings: Relevant political leanings (array of PoliticalLeaning enum values)
- tones: Relevant political tones (array of PoliticalTone enum values)
- minViews: Minimum views, if specified in the query (null if not specified)
- maxViews: Maximum views, if specified in the query (null if not specified)
- weightKeyword: Weight for keyword matches (0-1)
- weightLeaning: Weight for leaning matches (0-1)
- weightTones: Weight for tone matches (0-1)
- weightEmbedding: Weight for specific query's embedding similarity (0-1)
- weightRecency: Weight for date recency (0-1)
- weightViews: Weight for TikTok views (0-1)

Provide appropriate values based on the user's query and the given rules.`,
    userQuery,
    SearchTikToksParamsSchema,
    false
  );

  if (parsed) {
    if (Array.isArray(parsed.keywords)) {
      parsed.keywords = parsed.keywords.filter(
        (keyword) => keyword !== "Unknown"
      );
    }
    if (Array.isArray(parsed.leanings)) {
      parsed.leanings = parsed.leanings.filter(
        (leaning) => leaning !== "Unknown"
      );
    }
    if (Array.isArray(parsed.tones)) {
      parsed.tones = parsed.tones.filter((tone) => tone !== "Unknown");
    }
  }
  return parsed;
}

export async function getTikTokRelevanceScore(
  openai_client: OpenAIWithHistory,
  userQuery: string,
  tiktok: TikTok
): Promise<number> {
  const parsed = await openai_client.sendParsedMessage(
    `You are an AI assistant that analyzes the relevance of a TikTok to a user's query. 
          You should return a relevance score between 0 and 1, where 1 is most relevant and 0 is least relevant.
          Consider all aspects of the TikTok, including its description, hashtags, and views.
          Pay special attention to how well the TikTok's content and (very importantly) metadata aligns with the user's query intent. In case it is useful, the date today is ${
            new Date().toISOString().split("T")[0]
          }.`,
    `User Query: "${userQuery}"
  
  TikTok Details:
  ${JSON.stringify(tiktok, null, 2)}
  
  Please analyze the relevance of this TikTok to the user's query and provide a relevance score between 0 and 1.`,
    RelevanceScoreSchema,
    false
  );
  return parsed.relevanceScore ?? 0;
}
