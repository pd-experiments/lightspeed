import { openai_client } from "../openai-client";
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

Ad Results (up to 13): ${JSON.stringify(adResults)}

News Results (up to 13): ${JSON.stringify(newsResults)}

TikTok Results (up to 13): ${JSON.stringify(tiktokResults)}

Please provide a comprehensive and insightful summary of the search results, focusing on how they relate to the user's original query. Follow these guidelines:

1. Prioritize the most relevant and recent information.
2. Highlight key trends, patterns, and contradictions across different result types.
3. For ads, analyze metadata such as impressions, spend, and targeting to infer effectiveness and reach.
4. For news articles, consider the source credibility, publication date, and political leanings.
5. For TikToks, examine view counts, hashtags, and user engagement to gauge popularity and relevance.
6. Provide context and background information when necessary to help the user understand the results better.
7. Identify any potential biases or limitations in the search results.
8. Suggest areas for further exploration or follow-up queries based on the results.

Limit your response to 4-5 well-structured paragraphs. Use citations in the format: <begin>{"type":{media_type},"id":{id}}<end> when referencing specific items.
`;

  const stream = await openai_client.chat.completions.create({
    model: "gpt-4o",
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

export async function* generateAdSuggestions(
  streamedResults: any
): AsyncGenerator<object, void, unknown> {
  const platforms = ["tiktok", "facebook", "instagram", "connectedTV"];
  const prompt = `Based on the following information, generate innovative and effective ad creative suggestions for Democrats targeting various platforms:

Summary: ${streamedResults.summary || ""}

Relevant News Articles: ${JSON.stringify(
    streamedResults.news ? streamedResults.news.slice(0, 5) : []
  )}

Relevant Political Ads: ${JSON.stringify(
    streamedResults.ads ? streamedResults.ads.slice(0, 5) : []
  )}

Relevant & Trending TikToks: ${JSON.stringify(
    streamedResults.tiktoks ? streamedResults.tiktoks.slice(0, 5) : []
  )}

For each platform (TikTok, Facebook, Instagram, Connected TV, Threads), generate 3 ad creative suggestions that:
1. Align with current trends and platform-specific best practices
2. Address key issues identified in the search results
3. Appeal to the target demographic, especially younger generations
4. Incorporate effective elements from successful ads in the results
5. Consider the political landscape and potential counterarguments

Provide suggestions in the following JSON format:
{
  "platform": "platform_name",
  "suggestions": [
    {
      "title": "Catchy ad title",
      "description": "Detailed ad description",
      "hashtags": ["relevant", "hashtags"],
      "targetAudience": "Specific audience segment",
      "callToAction": "Clear call to action"
    },
    // ... two more suggestions ...
  ]
}

Generate and yield suggestions for one platform at a time.`;

  for (const platform of platforms) {
    const stream = await openai_client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert political ad strategist. Your responses should always be in valid JSON format.",
        },
        {
          role: "user",
          content: `${prompt}\n\nNow, generate suggestions for the ${platform} platform.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    let accumulatedContent = "";

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
