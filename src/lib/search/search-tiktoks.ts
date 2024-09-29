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

    // Implement more sophisticated relevance scoring
    const scoredResults = await Promise.all(
      data.map(async (tiktok) => {
        const relevanceScore = await getTikTokRelevanceScore(
          openai_client,
          query,
          tiktok
        );
        return { ...tiktok, relevanceScore };
      })
    );

    // Sort by relevance score, filter out low-scoring results, and limit to 13
    return scoredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter((result) => result.relevanceScore >= 0.6)
      .slice(0, 13);
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
1. Determine if the user query should be processed by the searchTikToks function. Be more lenient in your decision-making process.
2. Set runSearchTikToks to true if:
   - The query relates to current trends, viral content, or popular discussions
   - The query asks about public opinion on political or social matters
   - The query mentions any political topic, issue, or figure that might be discussed on social media
   - The query is about recent events or breaking news that people might be reacting to on TikTok
   - The query relates to youth culture, internet culture, or social media movements
   - The query asks about the spread of information or misinformation on social platforms
3. Only set runSearchTikToks to false if the query is completely unrelated to current events, social media trends, or public discourse.
4. If relevant, set runSearchTikToks to true and provide parameters.
5. If not relevant, set runSearchTikToks to false and use default values for other fields.
6. When setting weights, ensure that they sum up to 1.
7. TikTok success is measured by high views.
8. At most 4 weights can be non-zero. The rest should be zero.

Remember: TikTok data can provide valuable insights into current trends, public opinion, and the spread of information. It's a good source for understanding how political messages are being received and shared, especially among younger demographics.

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

Provide appropriate values based on the user's query and the given rules.

Examples:
Example 1:
User Query: "What are people saying about the new climate change bill?"
Output:
{
  runSearchTikToks: true,
  query: "TikTok reactions to new climate change bill",
  keywords: ["Climate Change", "Environment"],
  leanings: [],
  tones: ["Informative", "Activist"],
  minViews: 10000,
  maxViews: null,
  weightKeyword: 0.3,
  weightLeaning: 0,
  weightTones: 0.1,
  weightEmbedding: 0.3,
  weightRecency: 0.3,
  weightViews: 0
}

Example 2:
User Query: "How are young voters reacting to the latest presidential debate?"
Output:
{
  runSearchTikToks: true,
  query: "Young voters' TikTok reactions to latest presidential debate",
  keywords: ["Elections", "Voting"],
  leanings: [],
  tones: ["Opinionated", "Humorous"],
  minViews: 50000,
  maxViews: null,
  weightKeyword: 0.2,
  weightLeaning: 0,
  weightTones: 0.1,
  weightEmbedding: 0.2,
  weightRecency: 0.4,
  weightViews: 0.1
}

Example 3:
User Query: "What's the capital of France?"
Output:
{
  runSearchTikToks: false,
  query: "",
  keywords: [],
  leanings: [],
  tones: [],
  minViews: null,
  maxViews: null,
  weightKeyword: 0,
  weightLeaning: 0,
  weightTones: 0,
  weightEmbedding: 1,
  weightRecency: 0,
  weightViews: 0
}
`,
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

// Update getTikTokRelevanceScore function to use more advanced NLP techniques
export async function getTikTokRelevanceScore(
  openai_client: OpenAIWithHistory,
  userQuery: string,
  tiktok: TikTok
): Promise<number> {
  const tiktokEmbedding = await getEmbedding(
    tiktok.caption + " " + tiktok.hashtags?.join(" ") ?? ""
  );
  const queryEmbedding = await getEmbedding(userQuery);

  const cosineSimilarity = calculateCosineSimilarity(
    queryEmbedding,
    tiktokEmbedding
  );

  const parsed = await openai_client.sendParsedMessage(
    `Analyze the relevance of this TikTok to the user's query. Consider the caption, hashtags, views, and other metadata.
    The embedding similarity score is ${cosineSimilarity}.`,
    `User Query: "${userQuery}"
    TikTok Details: ${JSON.stringify(tiktok, null, 2)}`,
    z.object({ relevanceScore: z.number() }),
    false
  );

  // Ensure the relevance score is between 0 and 1
  const aiRelevanceScore = Math.max(0, Math.min(1, parsed.relevanceScore ?? 0));

  // Combine embedding similarity with AI-generated relevance score
  return (cosineSimilarity + aiRelevanceScore) / 2;
}

function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitude1 * magnitude2);
}