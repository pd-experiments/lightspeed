import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { openai_client } from "./openai-client";
import { supabase } from "./supabaseClient";
import {
  EnhancedGoogleAd,
  NewsArticle,
  PoliticalKeyword,
  PoliticalKeywordEnum,
  PoliticalLeaning,
  PoliticalLeaningEnum,
  PoliticalTone,
  PoliticalToneEnum,
} from "./types/lightspeed-search";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

async function getEmbedding(query: string): Promise<number[]> {
  const embedding: CreateEmbeddingResponse =
    await openai_client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
  return embedding.data[0].embedding;
}

// Main function to call the search RPC
export async function searchNews(
  query: string,
  keywords: PoliticalKeyword[],
  leanings: PoliticalLeaning[],
  tones: PoliticalTone[],
  alpha: number = 0.25,
  beta: number = 0.2,
  gamma: number = 0.1,
  delta: number = 0.35,
  epsilon: number = 0.1
): Promise<NewsArticle[]> {
  try {
    // Get the embedding for the query string
    const embedding = await getEmbedding(query);

    // Call the Supabase RPC
    const { data, error } = await supabase.rpc("search_news_advanced", {
      _keywords: keywords,
      _embedding: embedding, // This should be a vector of floats
      _leaning: leanings,
      _tones: tones,
      _alpha: alpha, // Weight for keyword matches
      _beta: beta, // Weight for leaning matches
      _gamma: gamma, // Weight for tone matches
      _delta: delta, // Weight for embedding similarity
      _epsilon: epsilon, // Weight for date recency
    });

    // Handle errors
    if (error) {
      console.error("Error calling search RPC:", error);
      return [];
    }

    // Return the top 20 results
    return data.slice(0, 20); // Return only top 20 results
  } catch (error) {
    console.error("Error in searchNews function:", error);
    return [];
  }
}

// Zod schema for the structured output
const SearchNewsParamsSchema = z.object({
  runSearchNews: z.boolean(),
  query: z.string(),
  keywords: z.array(PoliticalKeywordEnum),
  leanings: z.array(PoliticalLeaningEnum),
  tones: z.array(PoliticalToneEnum),
  alpha: z.number(),
  beta: z.number(),
  gamma: z.number(),
  delta: z.number(),
  epsilon: z.number(),
});

type SearchNewsParams = z.infer<typeof SearchNewsParamsSchema>;

export async function analyzeNewsSearchQuery(
  userQuery: string
): Promise<SearchNewsParams | null> {
  const completion = await openai_client.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that analyzes user queries to determine if they should be processed by the searchNews function. If applicable, you should provide appropriate parameters for the function.

Rules:
1. Determine if the user query should be processed by the searchNews function, i.e. if you think giving news data back to the user is relevant, then you should set runSearchNews to true. Otherwise, set runSearchNews to false.
2. If relevant, set runSearchNews to true and provide parameters.
3. If not relevant, set runSearchNews to false and use default values for other fields.
4. When setting weights (alpha, beta, gamma, delta, epsilon), ensure that at least one or two weights are significantly higher than the others.
5. The sum of all weights should equal 1.

Parameters:
- query: You will construct a thorough search query of what specifically the user wants.
- keywords: Relevant political keywords (array of PoliticalKeyword enum values)
- leanings: Relevant political leanings (array of PoliticalLeaning enum values)
- tones: Relevant political tones (array of PoliticalTone enum values)
- alpha: Weight for keyword matches (0-1)
- beta: Weight for leaning matches (0-1)
- gamma: Weight for tone matches (0-1)
- delta: Weight for embedding similarity (0-1)
- epsilon: Weight for date recency (0-1)`,
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
    response_format: zodResponseFormat(
      SearchNewsParamsSchema,
      "structured_output"
    ),
  });

  const parsed = completion.choices[0].message.parsed;
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

// Updated function to search ads
export async function searchAds(
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

    const { data, error } = await supabase.rpc("search_ads_advanced", {
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
    });

    if (error) {
      console.error("Error calling search ads RPC:", error);
      return [];
    }

    return data.slice(0, 20);
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
  userQuery: string
): Promise<SearchAdsParams | null> {
  const completion = await openai_client.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that analyzes user queries to determine if they should be processed by the searchAds function. If applicable, you should provide appropriate parameters for the function.

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
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
    response_format: zodResponseFormat(
      SearchAdsParamsSchema,
      "structured_output"
    ),
  });

  const parsed = completion.choices[0].message.parsed;
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

// Function to generate AI summary of search results
export async function* generateSearchSummary(
  userQuery: string,
  adResults: Pick<
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
  >[],
  newsResults: Pick<
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
  >[]
): AsyncGenerator<string, void, unknown> {
  const prompt = `
User Query: "${userQuery}"

Ad Results: ${JSON.stringify(adResults)}

News Results: ${JSON.stringify(newsResults)}

Please provide a concise summary of the search results, focusing on how they relate to the user's original query. Include key insights from both the ads and news articles, highlighting any trends, contradictions, metadata, or particularly relevant information. If an ad or news result doesn't seem relevant to the user query, you should ignore it. Limit your response to 3-4 paragraphs.
`;

  const stream = await openai_client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant tasked with summarizing search results related to political topics. Provide clear, unbiased insights based on the given information.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      yield chunk.choices[0].delta.content;
    }
  }
}

// Function to generate AI summary of search results with citations
export async function* generateSearchSummaryWithCitations(
  userQuery: string,
  adResults: Pick<
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
  >[],
  newsResults: Pick<
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
  >[]
): AsyncGenerator<string, void, unknown> {
  const prompt = `
User Query: "${userQuery}"

Ad Results: ${JSON.stringify(adResults)}

News Results: ${JSON.stringify(newsResults)}

Please provide a concise summary of the search results, focusing on how they relate to the user's original query. Include key insights from both the ads and news articles, highlighting any trends, contradictions, or particularly relevant information. With ads in particular, if there are particularly interesting metadata, you should mention those (e.g. high impressions means successful ad, low spend means cheap ad, the combination of the two means a highly successful ad). If an ad or news result doesn't seem relevant to the user query, you should ignore it. Limit your response to 3-4 paragraphs.

When referencing specific information from an ad or news article, include a citation in the following format: <begin>{"type":{media_type},"id":{id}}<end>, where {media_type} is "ad" or "news", and {id} is the id of the ad or news article.
`;

  const stream = await openai_client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant tasked with summarizing search results related to political topics. Provide clear, unbiased insights based on the given information, and include citations for specific information.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      yield chunk.choices[0].delta.content;
    }
  }
}

// // Updated processUserQuery function to handle both news and ad searches
// export async function processUserQuery(userQuery: string) {
//   const newsParams = await analyzeNewsSearchQuery(userQuery);
//   const adParams = await analyzeAdSearchQuery(userQuery);

//   const results = [];

//   if (newsParams && newsParams.runSearchNews) {
//     console.log("News search parameters:", JSON.stringify(newsParams, null, 2));
//     const newsResults = await searchNews(
//       newsParams.query,
//       newsParams.keywords,
//       newsParams.leanings,
//       newsParams.tones,
//       newsParams.alpha,
//       newsParams.beta,
//       newsParams.gamma,
//       newsParams.delta,
//       newsParams.epsilon
//     );
//     results.push({ type: "news", data: newsResults });
//   } else {
//     console.log("No news search parameters found.");
//   }

//   if (adParams && adParams.runSearchAds) {
//     console.log("Ad search parameters:", JSON.stringify(adParams, null, 2));
//     const adResults = await searchAds(
//       adParams.query,
//       adParams.advertiserName,
//       adParams.keywords,
//       adParams.leanings,
//       adParams.tones,
//       adParams.minSpend,
//       adParams.maxSpend,
//       adParams.minImpressions,
//       adParams.maxImpressions,
//       adParams.weightKeyword,
//       adParams.weightLeaning,
//       adParams.weightTones,
//       adParams.weightEmbedding,
//       adParams.weightRecency,
//       adParams.weightAdvertiserName,
//       adParams.weightSpend,
//       adParams.weightImpressions
//     );
//     results.push({ type: "ads", data: adResults });
//   } else {
//     console.log("No ad search parameters found.");
//   }

//   if (results.length === 0) {
//     return "The query is not suitable for searching news articles or ads.";
//   }

//   return results;
// }
