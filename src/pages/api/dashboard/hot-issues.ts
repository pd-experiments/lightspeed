import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { encode } from 'gpt-3-encoder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    try {
      const recentContent = await fetchRecentContent();
      const hotIssues = await analyzeHotIssues(recentContent);
  
      return res.status(200).json(hotIssues);
    } catch (error) {
      console.error('Error fetching hot issues:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

async function fetchRecentContent() {
  const [tweets, tiktokVideos, newsArticles] = await Promise.all([
    fetchRecentTweets(),
    fetchRecentTikTokVideos(),
    fetchRecentNewsArticles(),
  ]);

  return [...tweets, ...tiktokVideos, ...newsArticles];
}

async function fetchRecentTweets() {
  const { data, error } = await supabase
    .from('threads')
    .select('text')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data.map((item) => item.text);
}

async function fetchRecentTikTokVideos() {
  const { data, error } = await supabase
    .from('tiktok_videos')
    .select('text')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data.map((item) => item.text);
}

async function fetchRecentNewsArticles() {
  const { data, error } = await supabase
    .from('news')
    .select('title, summary')
    .order('publish_date', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data.map((item) => `${item.title} ${item.summary}`);
}

async function analyzeHotIssues(content: string[]) {
    const MAX_TOKENS = 7000;
    let truncatedContent = '';
    let totalTokens = 0;

    for (const item of content) {
        const itemTokens = encode(item).length;
        if (totalTokens + itemTokens > MAX_TOKENS) {
            break;
        }
        truncatedContent += item + '\n\n';
        totalTokens += itemTokens;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an AI assistant that analyzes political content and identifies hot issues. Respond with a JSON array only.",
      },
      {
        role: "user",
        content: `Analyze the following recent political content and identify the top 5 hot issues or topics being discussed. For each issue, provide a brief description and its importance score (1-10):
  
  ${truncatedContent}
  
  Output the result as a JSON array with objects containing 'issue', 'description', and 'importance' fields. Do not include any additional text or formatting.`,
      },
    ];
  
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.5,
    });
  
    const hotIssuesText = response.choices[0].message.content;
    if (!hotIssuesText) {
      throw new Error("No response from GPT");
    }
  
    try {
      const cleanedText = hotIssuesText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error parsing GPT response:", hotIssuesText);
      throw new Error("Failed to parse GPT response");
    }
}