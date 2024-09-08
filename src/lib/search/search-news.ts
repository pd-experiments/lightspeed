import { openai_client } from "../openai-client";
import { supabase } from "../supabaseClient";
import {
  NewsArticle,
  PoliticalKeyword,
  PoliticalKeywordEnum,
  PoliticalLeaning,
  PoliticalLeaningEnum,
  PoliticalTone,
  PoliticalToneEnum,
} from "../types/lightspeed-search";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { getEmbedding, RelevanceScoreSchema } from "../utils";

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
    const { data, error } = await supabase
      .rpc("search_news_advanced", {
        _keywords: keywords,
        _embedding: embedding, // This should be a vector of floats
        _leaning: leanings,
        _tones: tones,
        _alpha: alpha, // Weight for keyword matches
        _beta: beta, // Weight for leaning matches
        _gamma: gamma, // Weight for tone matches
        _delta: delta, // Weight for embedding similarity
        _epsilon: epsilon, // Weight for date recency
      })
      .returns<NewsArticle[]>();

    // Handle errors
    if (error) {
      console.error("Error calling search RPC:", error);
      return [];
    }

    // Create an array of promises for getArticleRelevanceScore
    const relevanceScorePromises = data
      .slice(0, 50)
      .map((article: NewsArticle) => getNewsRelevanceScore(query, article));

    // Execute all promises concurrently
    const relevanceScores = await Promise.all(relevanceScorePromises);

    // Filter articles based on relevance scores
    return data
      .filter((_, index) => relevanceScores[index] >= 0.5)
      .slice(0, 20);
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

export async function getNewsRelevanceScore(
  userQuery: string,
  newsArticle: NewsArticle
): Promise<number> {
  const completion = await openai_client.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that analyzes the relevance of a news article to a user's query. 
          You should return a relevance score between 0 and 1, where 1 is most relevant and 0 is least relevant.
          Consider all aspects of the article, including its title, content, source, keywords, political leaning, and tone.
          Pay special attention to how well the article's content and metadata aligns with the user's query intent. In case it is useful, the date today is ${
            new Date().toISOString().split("T")[0]
          }.`,
      },
      {
        role: "user",
        content: `User Query: "${userQuery}"
  
  News Article Details:
  ${JSON.stringify(newsArticle, null, 2)}
  
  Please analyze the relevance of this news article to the user's query and provide a relevance score between 0 and 1.`,
      },
    ],
    response_format: zodResponseFormat(
      RelevanceScoreSchema,
      "structured_output"
    ),
  });

  const parsed = completion.choices[0].message.parsed;
  return parsed?.relevanceScore ?? 0;
}
