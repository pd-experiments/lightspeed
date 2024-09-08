import { perplexity_client } from "../perplexity-client";
import {
  EnhancedGoogleAd,
  NewsArticle,
  TikTok,
} from "../types/lightspeed-search";

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
  >[],
  tiktokResults: Pick<
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
  >[]
): AsyncGenerator<string, void, unknown> {
  const prompt = `
User Query: "${userQuery}"

Ad Results: ${JSON.stringify(adResults)}

News Results: ${JSON.stringify(newsResults)}

TikTok Results: ${JSON.stringify(tiktokResults)}

Please provide a concise summary of the search results, focusing on how they relate to the user's original query. Include key insights from both the ads and news articles, highlighting any trends, contradictions, or particularly relevant information. With ads in particular, if there are particularly interesting metadata, you should mention those (e.g. high impressions means successful ad, low spend means cheap ad, the combination of the two means a highly successful ad). If an ad or news result doesn't seem relevant to the user query, you should ignore it. Limit your response to 3-4 paragraphs.

When referencing specific information from an ad or news article, include a citation in the following format: <begin>{"type":{media_type},"id":{id}}<end>, where {media_type} is "ad" or "news", and {id} is the id of the ad or news article.
`;

  const stream = await perplexity_client.chat.completions.create({
    model: "llama-3.1-sonar-large-128k-online",
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
