import {
  getEmbedding,
  openai_client,
  OpenAIWithHistory,
} from "../openai-client";
import { supabase } from "../supabaseClient";
import {
  EnhancedGoogleAd,
  PoliticalKeyword,
  PoliticalKeywordEnum,
  PoliticalLeaning,
  PoliticalLeaningEnum,
  PoliticalTone,
  PoliticalToneEnum,
} from "../types/lightspeed-search";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { RelevanceScoreSchema } from "../utils";

// Updated function to search ads
export async function searchAds(
  openai_client: OpenAIWithHistory,
  query: string,
  advertiserName: string,
  keywords: PoliticalKeyword[],
  leanings: PoliticalLeaning[],
  tones: PoliticalTone[],
  minSpend: number | null = null,
  maxSpend: number | null = null,
  minImpressions: number | null = null,
  maxImpressions: number | null = null,
  weightKeyword: number = 0.25,
  weightLeaning: number = 0.2,
  weightTones: number = 0.1,
  weightEmbedding: number = 0.35,
  weightRecency: number = 0.1,
  weightAdvertiserName: number = 0.1,
  weightSpend: number = 0.1,
  weightImpressions: number = 0.1
): Promise<EnhancedGoogleAd[]> {
  try {
    const queryEmbedding = await getEmbedding(query);
    const advertiserNameEmbedding = await getEmbedding(advertiserName);

    const { data, error } = await supabase
      .rpc("search_ads_advanced", {
        _keywords: keywords,
        _embedding: queryEmbedding,
        _leaning: leanings,
        _tones: tones,
        _advertiser_name_embedding: advertiserNameEmbedding,
        _min_spend: minSpend,
        _max_spend: maxSpend,
        _min_impressions: minImpressions,
        _max_impressions: maxImpressions,
        _keyword_weight: weightKeyword,
        _leaning_weight: weightLeaning,
        _tones_weight: weightTones,
        _embedding_weight: weightEmbedding,
        _date_weight: weightRecency,
        _advertiser_name_weight: weightAdvertiserName,
        _spend_weight: weightSpend,
        _impressions_weight: weightImpressions,
      })
      .returns<EnhancedGoogleAd[]>();

    if (error) {
      console.error("Error calling search ads RPC:", error);
      return [];
    }

    // Create an array of promises for getAdRelevanceScore
    const relevanceScorePromises = data
      .slice(0, 50)
      .map((ad: EnhancedGoogleAd) =>
        getAdRelevanceScore(openai_client, query, ad)
      );
    // Execute all promises concurrently
    const relevanceScores = await Promise.all(relevanceScorePromises);

    // Filter parsed.ads based on relevance scores
    return data
      .filter((_, index) => relevanceScores[index] >= 0.5)
      .slice(0, 20);
  } catch (error) {
    console.error("Error in searchAds function:", error);
    return [];
  }
}

// Updated Zod schema for ad search parameters
const SearchAdsParamsSchema = z.object({
  runSearchAds: z.boolean(),
  query: z.string(),
  keywords: z.array(PoliticalKeywordEnum),
  leanings: z.array(PoliticalLeaningEnum),
  tones: z.array(PoliticalToneEnum),
  advertiserName: z.string(),
  minSpend: z.number().nullable(),
  maxSpend: z.number().nullable(),
  minImpressions: z.number().nullable(),
  maxImpressions: z.number().nullable(),
  weightKeyword: z.number(),
  weightLeaning: z.number(),
  weightTones: z.number(),
  weightEmbedding: z.number(),
  weightRecency: z.number(),
  weightAdvertiserName: z.number(),
  weightSpend: z.number(),
  weightImpressions: z.number(),
});

type SearchAdsParams = z.infer<typeof SearchAdsParamsSchema>;

export async function analyzeAdSearchQuery(
  openai_client: OpenAIWithHistory,
  userQuery: string
): Promise<SearchAdsParams | null> {
  const parsed = await openai_client.sendParsedMessage(
    `You are an AI assistant that analyzes user queries to determine if they should be processed by the searchAds function. If applicable, you should provide appropriate parameters for the function.
  
  Rules:
  1. Determine if the user query should be processed by the searchAds function, i.e. if you think giving ad data back to the user is relevant, then you should set runSearchAds to true. Otherwise, set runSearchAds to false.
  2. If relevant, set runSearchAds to true and provide parameters.
  3. If not relevant, set runSearchAds to false and use default values for other fields.
  4. When setting weights, ensure that they sum up to 1.
  5. Ad success is measured by high impressions.
  6. Cheap ads are measured by low spend.
  7. At most 4 weights can be non-zero. The rest should be zero.
  
  Parameters:
  - query: Construct a thorough search query of what specifically the user wants.
  - keywords: Relevant political keywords (array of PoliticalKeyword enum values)
  - leanings: Relevant political leanings (array of PoliticalLeaning enum values)
  - tones: Relevant political tones (array of PoliticalTone enum values)
  - advertiserName: Extract or infer the advertiser name from the user query, if applicable.
  - minSpend: Minimum spend amount, if specified in the query (null if not specified)
  - maxSpend: Maximum spend amount, if specified in the query (null if not specified)
  - minImpressions: Minimum impressions, if specified in the query (null if not specified)
  - maxImpressions: Maximum impressions, if specified in the query (null if not specified)
  - weightKeyword: Weight for keyword matches (0-1). This should be significantly higher if the user is asking for ads with specific keywords.
  - weightLeaning: Weight for leaning matches (0-1). This should be significantly higher if the user is asking for ads from a specific political leaning.
  - weightTones: Weight for tone matches (0-1). This should be significantly higher if the user is asking for ads with a specific political tone.
  - weightEmbedding: Weight for specific query's embedding similarity (0-1)
  - weightRecency: Weight for date recency (0-1). This should be significantly higher if the user is asking for ads in a specific time range.
  - weightAdvertiserName: Weight for advertiser name similarity (0-1). This should be significantly higher if the user is asking for ads from a specific advertiser.
  - weightSpend: Weight for ad spend (0-1). This should be significantly higher if the user is asking for ads with a specific spend range.
  - weightImpressions: Weight for ad impressions (0-1). This should be significantly higher if the user is asking for ads with a certain level of success, which you can measure by specific impression range.
  
  Examples:
  Example 1:
  User Query: "Show me ads from Republican candidates about immigration with high spend"
  Output:
  {
    runSearchAds: true,
    query: "Republican candidate ads on immigration with high spending",
    keywords: ["Immigration"],
    leanings: ["Faith and Flag Conservatives", "Committed Conservatives", "Populist Right"],
    tones: ["Patriotic", "Fearmongering"],
    advertiserName: "",
    minSpend: 10000,
    maxSpend: null,
    minImpressions: null,
    maxImpressions: null,
    weightKeyword: 0.1,
    weightLeaning: 0.1,
    weightTones: 0,
    weightEmbedding: 0,
    weightRecency: 0,
    weightAdvertiserName: 0,
    weightSpend: 0.8,
    weightImpressions: 0
  }
  
  Example 2:
  User Query: "Find recent ads from Democratic candidates about healthcare reform"
  Output:
  {
    runSearchAds: true,
    query: "Recent Democratic candidate ads on healthcare reform",
    keywords: ["Healthcare"],
    leanings: ["Progressive Left", "Establishment Liberals", "Democratic Mainstays"],
    tones: ["Optimistic", "Future-Building"],
    advertiserName: "",
    minSpend: null,
    maxSpend: null,
    minImpressions: null,
    maxImpressions: null,
    weightKeyword: 0.1,
    weightLeaning: 0.1,
    weightTones: 0,
    weightEmbedding: 0,
    weightRecency: 0.8,
    weightAdvertiserName: 0,
    weightSpend: 0,
    weightImpressions: 0
  }
  
  Example 3:
  User Query: "What are the most viewed ads about climate change?"
  Output:
  {
    runSearchAds: true,
    query: "Most viewed ads about climate change",
    keywords: ["Climate Change"],
    leanings: [],
    tones: [],
    advertiserName: "",
    minSpend: null,
    maxSpend: null,
    minImpressions: 1000000,
    maxImpressions: null,
    weightKeyword: 0.1,
    weightLeaning: 0,
    weightTones: 0,
    weightEmbedding: 0.1,
    weightRecency: 0,
    weightAdvertiserName: 0,
    weightSpend: 0,
    weightImpressions: 0.8
  }
  
  Example 4:
  User Query: "Tell me about the weather forecast for tomorrow"
  Output:
  {
    runSearchAds: false,
    query: "",
    keywords: [],
    leanings: [],
    tones: [],
    advertiserName: "",
    minSpend: null,
    maxSpend: null,
    minImpressions: null,
    maxImpressions: null,
    weightKeyword: 0,
    weightLeaning: 0,
    weightTones: 0,
    weightEmbedding: 1,
    weightRecency: 0,
    weightAdvertiserName: 0,
    weightSpend: 0,
    weightImpressions: 0
  }
  
  Example 5:
  User Query: "What successful ads have recently been put out by Kamala Harris related to jobs and employment?"
  Output:
  {
    runSearchAds: true,
    query: "Kamala Harris ads about jobs and employment",
    keywords: ["Economy", "Labor Rights"],
    leanings: ["Democratic Mainstays", "Establishment Liberals"],
    tones: ["Optimistic", "Future-Building"],
    advertiserName: "Kamala Harris",
    minSpend: 1000,
    maxSpend: null,
    minImpressions: 50000,
    maxImpressions: null,
    weightKeyword: 0.3,
    weightLeaning: 0,
    weightTones: 0,
    weightEmbedding: 0,
    weightRecency: 0.2,
    weightAdvertiserName: 0.8,
    weightSpend: 0,
    weightImpressions: 0
  }
  `,
    userQuery,
    SearchAdsParamsSchema,
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

export async function getAdRelevanceScore(
  openai_client: OpenAIWithHistory,
  userQuery: string,
  ad: EnhancedGoogleAd
): Promise<number> {
  const parsed = await openai_client.sendParsedMessage(
    `You are an AI assistant that analyzes the relevance of a Google Ad to a user's query. 
          You should return a relevance score between 0 and 1, where 1 is most relevant and 0 is least relevant.
          Consider all aspects of the ad, including its summary, advertiser name, targeting, keywords, political leaning, and tone.
          Pay special attention to how well the ad's content and (very importantly) metadata aligns with the user's query intent. In case it is useful, the date today is ${
            new Date().toISOString().split("T")[0]
          }.`,
    `User Query: "${userQuery}"
  
  Ad Details:
  ${JSON.stringify(ad, null, 2)}
  
  Please analyze the relevance of this ad to the user's query and provide a relevance score between 0 and 1.`,
    RelevanceScoreSchema,
    false
  );
  return parsed.relevanceScore ?? 0;
}
