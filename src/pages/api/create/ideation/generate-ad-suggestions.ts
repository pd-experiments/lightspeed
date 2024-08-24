import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const recentAds = await fetchRecentAds();
    const recentConversations = await fetchRecentConversations();
    const suggestions = await generateAdSuggestions(recentAds, recentConversations);

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error generating ad suggestions:', error);
    res.status(500).json({ error: 'Error generating ad suggestions' });
  }
}

async function fetchRecentAds() {
  const { data, error } = await supabase
    .from('int_ads__google_ads_enhanced')
    .select('content, advertiser_name, political_leaning')
    .order('last_shown', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

async function fetchRecentConversations() {
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('text')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: tiktokVideos, error: tiktokError } = await supabase
    .from('tiktok_videos')
    .select('text')
    .order('created_at', { ascending: false })
    .limit(10);

  if (threadsError || tiktokError) throw threadsError || tiktokError;
  return [...threads, ...tiktokVideos];
}

async function generateAdSuggestions(recentAds: any[], recentConversations: any[]) {
    const prompt = `Based on the following recent ads and conversations, generate 5 ad suggestions:
  
  Recent Ads:
  ${recentAds.map(ad => `- ${ad.content} (by ${ad.advertiser_name}, ${ad.political_leaning})`).join('\n')}
  
  Recent Conversations:
  ${recentConversations.map(conv => `- ${conv.text}`).join('\n')}
  
  Generate 5 ad suggestions in the following JSON format:
  [
    {
      "title": "Ad title",
      "description": "Brief ad description",
      "target_audience": {
        "age": ["18-24", "25-34"],
        "gender": ["Male", "Female"],
        "interests": ["Politics", "Technology"]
      },
      "platforms": ["Facebook", "Instagram"],
      "political_leaning": "center-left",
      "budget": 1000,
      "duration": 7,
      "start_date": "2023-07-01",
      "end_date": "2023-07-08",
      "objective": "awareness",
      "key_components": ["Engaging visuals", "Clear message", "Call to action"]
    },
    ...
  ]`;
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an expert political ad strategist." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
  
      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error("No content returned from OpenAI");
      }
  
      const parsedContent = JSON.parse(content);
      if (!Array.isArray(parsedContent)) {
        throw new Error("Invalid response format from OpenAI");
      }
  
      return parsedContent.map(suggestion => ({
        ...suggestion,
        status: "Draft" as const,
        ad_content: {
          headline: suggestion.title,
          body: suggestion.description,
          callToAction: "Learn More",
          image: null
        }
      }));
    } catch (error) {
      console.error("Error generating ad suggestions:", error);
      throw new Error("Failed to generate ad suggestions");
    }
  }