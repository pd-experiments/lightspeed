import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { openai_client } from "./openai-client";
import { supabase } from "./supabaseClient";
import {
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
) {
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

export async function analyzeSearchQuery(
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

// New function to search ads
export async function searchAds(
  query: string,
  advertiserName: string,
  keywords: PoliticalKeyword[],
  leanings: PoliticalLeaning[],
  tones: PoliticalTone[],
  alpha: number = 0.25,
  beta: number = 0.2,
  gamma: number = 0.1,
  delta: number = 0.35,
  epsilon: number = 0.1,
  zeta: number = 0.1
) {
  try {
    const queryEmbedding = await getEmbedding(query);
    const advertiserNameEmbedding = await getEmbedding(advertiserName);

    const { data, error } = await supabase.rpc("search_ads_advanced", {
      _keywords: keywords,
      _embedding: queryEmbedding,
      _leaning: leanings,
      _tones: tones,
      _advertiser_name_embedding: advertiserNameEmbedding,
      _alpha: alpha,
      _beta: beta,
      _gamma: gamma,
      _delta: delta,
      _epsilon: epsilon,
      _zeta: zeta,
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
  alpha: z.number(),
  beta: z.number(),
  gamma: z.number(),
  delta: z.number(),
  epsilon: z.number(),
  zeta: z.number(),
});

type SearchAdsParams = z.infer<typeof SearchAdsParamsSchema>;

export async function analyzeAdSearchQuery(
  userQuery: string
): Promise<SearchAdsParams | null> {
  const completion = await openai_client.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that analyzes user queries to determine if they should be processed by the searchAds function. If applicable, you should provide appropriate parameters for the function.

Rules:
1. Determine if the user query should be processed by the searchAds function, i.e. if you think giving ad data back to the user is relevant, then you should set runSearchAds to true. Otherwise, set runSearchAds to false.
2. If relevant, set runSearchAds to true and provide parameters.
3. If not relevant, set runSearchAds to false and use default values for other fields.
4. When setting weights (alpha, beta, gamma, delta, epsilon, zeta), ensure that at least one or two weights are significantly higher than the others.
5. The sum of all weights should equal 1.

Parameters:
- query: You will construct a thorough search query of what specifically the user wants.
- keywords: Relevant political keywords (array of PoliticalKeyword enum values)
- leanings: Relevant political leanings (array of PoliticalLeaning enum values)
- tones: Relevant political tones (array of PoliticalTone enum values)
- advertiserName: Extract or infer the advertiser name from the user query, if applicable.
- alpha: Weight for keyword matches (0-1)
- beta: Weight for leaning matches (0-1)
- gamma: Weight for tone matches (0-1)
- delta: Weight for embedding similarity (0-1)
- epsilon: Weight for date recency (0-1)
- zeta: Weight for advertiser name similarity that indicates how much the user is interested in the advertiser name. It should be very high if a the user provides a name, and lower if no name is provided. (0-1)`,
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

// Updated processUserQuery function to handle both news and ad searches
export async function processUserQuery(userQuery: string) {
  // const newsParams = await analyzeSearchQuery(userQuery);
  const adParams = await analyzeAdSearchQuery(userQuery);

  const results = [];

  // if (newsParams && newsParams.runSearchNews) {
  //   console.log("News search parameters:", JSON.stringify(newsParams, null, 2));
  //   const newsResults = await searchNews(
  //     newsParams.query,
  //     newsParams.keywords,
  //     newsParams.leanings,
  //     newsParams.tones,
  //     newsParams.alpha,
  //     newsParams.beta,
  //     newsParams.gamma,
  //     newsParams.delta,
  //     newsParams.epsilon
  //   );
  //   results.push({ type: "news", data: newsResults });
  // } else {
  //   console.log("No news search parameters found.");
  // }

  if (adParams && adParams.runSearchAds) {
    console.log("Ad search parameters:", JSON.stringify(adParams, null, 2));
    const adResults = await searchAds(
      adParams.query,
      adParams.advertiserName,
      adParams.keywords,
      adParams.leanings,
      adParams.tones,
      adParams.alpha,
      adParams.beta,
      adParams.gamma,
      adParams.delta,
      adParams.epsilon,
      adParams.zeta
    );
    results.push({ type: "ads", data: adResults });
  } else {
    console.log("No ad search parameters found.");
  }

  if (results.length === 0) {
    return "The query is not suitable for searching news articles or ads.";
  }

  return results;
}
