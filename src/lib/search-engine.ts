import { CreateEmbeddingResponse } from "openai/resources/embeddings.mjs";
import { openai_client } from "./openai-client";
import { zodResponseFormat } from "openai/helpers/zod";
import { supabase } from "./supabaseClient";
import {
  LightspeedSearchQuery,
  LightspeedSearchQuerySchema,
  SearchResults,
} from "./types/lightspeed-search";
import { Database } from "./types/schema";
import { z } from "zod";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];
type TikTok = Database["public"]["Tables"]["tiktok_videos"]["Row"];
type IGThread = Database["public"]["Tables"]["int_threads"]["Row"];
type NewsArticle = Database["public"]["Tables"]["int_news"]["Row"];

export async function NLPLightspeedSearch(query: string) {
  const completion = await openai_client.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "The user wants to search a political database. Convert their natural language query into a structured JSON query of the given format.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    response_format: zodResponseFormat(
      LightspeedSearchQuerySchema,
      "structured_query"
    ),
  });

  const structured_query = completion.choices[0].message.parsed;

  console.log("query:", structured_query);
  if (structured_query) {
    if (Array.isArray(structured_query["politicalKeywords"])) {
      structured_query["politicalKeywords"] = structured_query[
        "politicalKeywords"
      ].filter((value: string) => value !== "Unknown");
    }
    if (Array.isArray(structured_query["politicalLeanings"])) {
      structured_query["politicalLeanings"] = structured_query[
        "politicalLeanings"
      ].filter((value: string) => value !== "Unknown");
    }
    if (Array.isArray(structured_query["tone"])) {
      structured_query["tone"] = structured_query["tone"].filter(
        (value: string) => value !== "Unknown"
      );
    }
    const with_query = await LightspeedSearch(structured_query, true);
    const without_query = await LightspeedSearch(structured_query, false);

    return {
      ads: [...(with_query.ads || []), ...(without_query.ads || [])],
      tikToks: [
        ...(with_query.tikToks || []),
        ...(without_query.tikToks || []),
      ],
      threads: [
        ...(with_query.threads || []),
        ...(without_query.threads || []),
      ],
      news: [...(with_query.news || []), ...(without_query.news || [])],
    };
  }
  return [];
}

export async function LightspeedSearch(
  query: z.infer<typeof LightspeedSearchQuerySchema>,
  search_with_specific_query: boolean = false
) {
  let searchResults: SearchResults = {};

  // Create embedding out of specific political event embeddings
  let specificPoliticalEventEmbeddings: number[] | null = null;
  if (search_with_specific_query && query.specificQuery) {
    const embedding: CreateEmbeddingResponse =
      await openai_client.embeddings.create({
        model: "text-embedding-3-small",
        input: query.specificQuery,
        encoding_format: "float",
      });
    specificPoliticalEventEmbeddings = embedding.data[0].embedding;
  }

  // Get ads
  const adsQuery = specificPoliticalEventEmbeddings
    ? supabase.rpc("int_ads__google_ads_enhanced__semantic_search", {
        query_embedding: specificPoliticalEventEmbeddings,
        match_threshold: 0.2,
      })
    : supabase.from("int_ads__google_ads_enhanced").select("*");

  if (query.politicalKeywords && query.politicalKeywords.length > 0) {
    // Build the OR logic for keywords
    const filters = query.politicalKeywords
      .map((keyword) => `keywords.cs.\{${keyword}\}`)
      .join(",");

    adsQuery.or(filters);
  }

  if (query.politicalLeanings && query.politicalLeanings.length > 0) {
    adsQuery.in("political_leaning", query.politicalLeanings);
  }

  if (query.tone && query.tone.length > 0) {
    // Build the OR logic for keywords
    const filters = query.tone.map((t) => `tone.cs.{${t}}`).join(",");

    adsQuery.or(filters);
  }

  if (query.targetAudiences && query.targetAudiences.length > 0) {
    // Build the OR logic for keywords
    const filters = query.targetAudiences
      .map((audience) => `targeted_ages.cs.\{${audience}\}`)
      .join(",");

    adsQuery.or(filters);
  }

  if (query.date_range_start) {
    adsQuery.gte("first_shown", query.date_range_start.toISOString());
  }

  if (query.date_range_end) {
    adsQuery.lte("last_shown", query.date_range_end.toISOString());
  }

  if (query.sortBy) {
    if (query.sortBy == "recency") {
      adsQuery.order("last_shown", { ascending: false });
    } else {
      // TODO: Add this after estimated_success is calculated from number of ad views
    }
  }

  adsQuery.returns<EnhancedGoogleAd[]>().limit(10);
  const { data: adData, error: adError } = await adsQuery;
  if (adError) throw adError;
  searchResults.ads = adData as EnhancedGoogleAd[];
  searchResults.ads = searchResults.ads.map((ad) => {
    return { ...ad, summary_embeddings: null };
  });

  // Get TikToks
  const tiktoksQuery = supabase.from("tiktok_embeddings").select("*");

  if (query.politicalKeywords && query.politicalKeywords.length > 0) {
    // Build the OR logic for keywords
    const filters = query.politicalKeywords
      .map((keyword) => `keywords.cs.\{${keyword}\}`)
      .join(",");

    tiktoksQuery.or(filters);
  }

  tiktoksQuery.returns<TikTok[]>().limit(10);
  const { data: tiktokData, error: tiktokError } = await tiktoksQuery;
  if (tiktokError) throw tiktokError;
  searchResults.tikToks = (tiktokData || []) as any[];
  searchResults.tikToks = searchResults.tikToks?.map((tiktok) => ({
    ...tiktok,
    caption_embedding: null,
    summary_embedding: null,
  }));  

  // Get Instagram Threads
  const igThreadsQuery = supabase.from("int_threads").select("*");

  if (query.politicalKeywords && query.politicalKeywords.length > 0) {
    console.log("keywords exist", query.politicalKeywords);
    // Build the OR logic for keywords
    const filters = query.politicalKeywords
      .map((keyword) => `political_keywords.cs.\{${keyword}\}`)
      .join(",");

    igThreadsQuery.or(filters);
  }

  if (query.politicalLeanings && query.politicalLeanings.length > 0) {
    igThreadsQuery.in("political_leaning", query.politicalLeanings);
  }

  if (query.tone && query.tone.length > 0) {
    console.log("tone exists", query.tone);
    // Build the OR logic for keywords
    const filters = query.tone
      .map((t) => `political_tones.cs.{${t}}`)
      .join(",");

    igThreadsQuery.or(filters);
  }

  if (query.date_range_start) {
    igThreadsQuery.gte("created_at", query.date_range_start.toISOString());
  }

  if (query.date_range_end) {
    igThreadsQuery.lte("created_at", query.date_range_end.toISOString());
  }

  if (query.sortBy) {
    if (query.sortBy == "recency") {
      igThreadsQuery.order("created_at", { ascending: false });
    } else {
      // TODO: Add this after estimated_success is calculated from number of ad views
    }
  }

  igThreadsQuery.returns<IGThread[]>().limit(10);
  const { data: igThreadData, error: igThreadError } = await igThreadsQuery;
  if (igThreadError) throw igThreadError;
  searchResults.threads = igThreadData;
  searchResults.threads = searchResults.threads?.map((thread) => ({
    ...thread,
    summary_embedding: null,
    raw_text_embedding: null,
  }));

  // Get News Articles
  const newsArticlesQuery = supabase.from("int_news").select("*");

  if (query.politicalKeywords && query.politicalKeywords.length > 0) {
    console.log("keywords exist", query.politicalKeywords);
    // Build the OR logic for keywords
    const filters = query.politicalKeywords
      .map((keyword) => `political_keywords.cs.\{${keyword}\}`)
      .join(",");

    newsArticlesQuery.or(filters);
  }

  if (query.politicalLeanings && query.politicalLeanings.length > 0) {
    newsArticlesQuery.in("political_leaning", query.politicalLeanings);
  }

  if (query.tone && query.tone.length > 0) {
    console.log("tone exists", query.tone);
    // Build the OR logic for keywords
    const filters = query.tone
      .map((t) => `political_tones.cs.{${t}}`)
      .join(",");

    newsArticlesQuery.or(filters);
  }

  if (query.date_range_start) {
    newsArticlesQuery.gte("publish_date", query.date_range_start.toISOString());
  }

  if (query.date_range_end) {
    newsArticlesQuery.lte("publish_date", query.date_range_end.toISOString());
  }

  if (query.sortBy) {
    if (query.sortBy == "recency") {
      newsArticlesQuery.order("publish_date", { ascending: false });
    } else {
      // TODO: Add this after estimated_success is calculated from number of ad views
    }
  }

  newsArticlesQuery.returns<NewsArticle[]>().limit(10);
  const { data: newsArticleData, error: newsArticleError } =
    await newsArticlesQuery;
  if (newsArticleError) throw newsArticleError;
  searchResults.news = newsArticleData as NewsArticle[];
  searchResults.news = searchResults.news.map((result) => ({
    ...result,
    summary_embedding: "",
  }));

  return searchResults;
}
