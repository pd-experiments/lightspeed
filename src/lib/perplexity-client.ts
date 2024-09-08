import OpenAI from "openai";

export const perplexity_client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.perplexity.ai",
});
