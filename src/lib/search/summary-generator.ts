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

export async function* generateAdSuggestions(streamedResults: any): AsyncGenerator<object, void, unknown> {
  const platforms = ['tiktok', 'facebook', 'instagram', 'connectedTV'];
  const prompt = `Based on the following information, generate trending ad creative suggestions for Democrats for TikTok, Facebook, Instagram, and Connected TV:

Summary: ${streamedResults.summary || ''}

Relevant News Articles: ${JSON.stringify(streamedResults.news ? streamedResults.news.slice(0, 5) : [])}

Relevant Political Ads: ${JSON.stringify(streamedResults.ads ? streamedResults.ads.slice(0, 5) : [])}

Relevant & Trending TikToks: ${JSON.stringify(streamedResults.tiktoks ? streamedResults.tiktoks.slice(0, 5) : [])}

Generate 3 ad creative suggestions for each platform (TikTok, Facebook, Instagram, Connected TV) in the following JSON format:
{
  "platform": "platform_name",
  "suggestions": [
    { "title": "Ad title", "description": "Brief ad description", "hashtags": ["tag1", "tag2"] },
    ...
  ]
}

Generate and yield suggestions for one platform at a time.`;

  for (const platform of platforms) {
    const stream = await openai_client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert political ad strategist. Your responses should always be in valid JSON format." },
        { role: "user", content: `${prompt}\n\nNow, generate suggestions for the ${platform} platform.` }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    let accumulatedContent = '';

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        accumulatedContent += chunk.choices[0].delta.content;
      }
    }

    try {
      const parsedContent = JSON.parse(accumulatedContent);
      yield parsedContent;
    } catch (error) {
      console.error(`Failed to parse ${platform} suggestions:`, error);
      yield { platform, error: "Failed to generate valid JSON suggestions" };
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