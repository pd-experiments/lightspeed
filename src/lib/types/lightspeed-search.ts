import { Database } from "./schema";
import { z } from "zod";

type PoliticalKeyword =
  | "Unknown"
  | "Immigration"
  | "Gun Rights"
  | "Healthcare"
  | "Climate Change"
  | "Economy"
  | "Education"
  | "National Security"
  | "Tax Policy"
  | "Social Security"
  | "Abortion"
  | "Civil Rights"
  | "Criminal Justice Reform"
  | "Foreign Policy"
  | "Voting Rights"
  | "Labor Rights"
  | "LGBTQ+ Rights"
  | "Drug Policy"
  | "Infrastructure"
  | "Trade Policy"
  | "Government Spending";

type PoliticalLeaning =
  | "Unknown"
  | "Faith and Flag Conservatives"
  | "Committed Conservatives"
  | "Populist Right"
  | "Ambivalent Right"
  | "Moderate"
  | "Outsider Left"
  | "Democratic Mainstays"
  | "Establishment Liberals"
  | "Progressive Left";

type Tone =
  | "Unknown"
  | "Attack on Opponent(s)"
  | "Patriotic"
  | "Fearmongering"
  | "Optimistic"
  | "Future-Building"
  | "Anger"
  | "Compassionate"
  | "Authoritative";

type TargetAudience = "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
// | "Unknown age";

type LightspeedSearchQuery = {
  specificQuery?: string; // This could be a text description of what precisely the user wants in their query
  politicalKeywords?: PoliticalKeyword[]; // List of keywords to filter by
  politicalLeanings?: PoliticalLeaning[]; // Filter by political leaning
  tone?: Tone[]; // List of tones to filter by
  targetAudiences?: TargetAudience[]; // List of target audience age ranges to filter by
  date_range_start?: Date;
  date_range_end?: Date;

  // Sorting criteria, with "success" as the priority metric
  sortBy?: "success" | "recency";
};

// Define the Zod schema for the LightspeedSearchQuery type
export const LightspeedSearchQuerySchema = z.object({
  specificQuery: z.string().optional(),
  politicalKeywords: z
    .array(
      z.enum([
        "Unknown",
        "Immigration",
        "Gun Rights",
        "Healthcare",
        "Climate Change",
        "Economy",
        "Education",
        "National Security",
        "Tax Policy",
        "Social Security",
        "Abortion",
        "Civil Rights",
        "Criminal Justice Reform",
        "Foreign Policy",
        "Voting Rights",
        "Labor Rights",
        "LGBTQ+ Rights",
        "Drug Policy",
        "Infrastructure",
        "Trade Policy",
        "Government Spending",
      ])
    )
    .optional(),
  politicalLeanings: z
    .array(
      z.enum([
        "Unknown",
        "Faith and Flag Conservatives",
        "Committed Conservatives",
        "Populist Right",
        "Ambivalent Right",
        "Moderate",
        "Outsider Left",
        "Democratic Mainstays",
        "Establishment Liberals",
        "Progressive Left",
      ])
    )
    .optional(),
  tone: z
    .array(
      z.enum([
        "Unknown",
        "Attack on Opponent(s)",
        "Patriotic",
        "Fearmongering",
        "Optimistic",
        "Future-Building",
        "Anger",
        "Compassionate",
        "Authoritative",
      ])
    )
    .optional(),
  targetAudiences: z
    .array(
      z.enum([
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65+",
        // "Unknown age",
      ])
    )
    .optional(),
  date_range_start: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  date_range_end: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  sortBy: z.enum(["success", "recency"]).optional(),
});

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];
type TikTok = Database["public"]["Tables"]["tiktok_videos"]["Row"];
type IGThread = Database["public"]["Tables"]["int_threads"]["Row"];
type NewsArticle = Database["public"]["Tables"]["int_news"]["Row"];

type SearchResults = {
  ads?: EnhancedGoogleAd[];
  tikToks?: TikTok[];
  threads?: IGThread[];
  news?: NewsArticle[];
};

export type {
  PoliticalKeyword,
  PoliticalLeaning,
  Tone,
  TargetAudience,
  LightspeedSearchQuery,
  SearchResults,
};
