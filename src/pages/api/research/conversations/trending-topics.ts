import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

type Thread = Database['public']['Tables']['threads']['Row'];
type TikTokVideo = Database['public']['Tables']['tiktok_videos']['Row'];
type NewsArticle = Database['public']['Tables']['news']['Row'];

interface TrendingTopic {
    topic: string;
    count: number;
    references: {
      source: 'threads' | 'tiktok' | 'news';
      data: Thread | TikTokVideo | NewsArticle;
    }[];
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const [threadsTopics, tiktokTopics, newsTopics] = await Promise.all([
      fetchThreadsTopics(),
      fetchTikTokTopics(),
      fetchNewsTopics(),
    ]);

    const combinedTopics = [...threadsTopics, ...tiktokTopics, ...newsTopics];
    const topicMap = combinedTopics.reduce((acc, topic) => {
      if (!acc[topic.topic]) {
        acc[topic.topic] = { ...topic, count: 0, references: [] };
      }
      acc[topic.topic].count += topic.count;
      acc[topic.topic].references.push(...topic.references);
      return acc;
    }, {} as Record<string, TrendingTopic>);
    
    const trendingTopics = Object.values(topicMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return res.status(200).json(trendingTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function fetchTikTokTopics(): Promise<TrendingTopic[]> {
    const { data, error } = await supabase
      .from('tiktok_videos')
      .select('*')
      .not('hashtag', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);
  
    if (error) throw error;
  
    return processTopics(data.flatMap(video => 
      video.hashtag.split(',').map((tag: string) => ({ hashtag: tag.trim(), reference: video }))
    ), 'tiktok');
  }
  
  async function fetchNewsTopics(): Promise<TrendingTopic[]> {
    const { data, error } = await supabase
      .from('int_news')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(100);
  
    if (error) throw error;
  
    return processTopics(data.flatMap(article => 
      article.title.split(' ')
        .filter((word: string) => word.length > 3)
        .map((word: string) => ({ hashtag: word, reference: article }))
    ), 'news');
  }
  
  async function fetchThreadsTopics(): Promise<TrendingTopic[]> {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
  
    if (error) throw error;
  
    const topics = await Promise.all(data.map(async thread => {
      const extractedTopics = await extractTopicsFromText(thread);
      return extractedTopics.map(topic => ({ hashtag: topic, reference: thread }));
    }));
  
    return processTopics(topics.flat(), 'threads');
  }
  
function processTopics(data: { hashtag: string; reference: Thread | TikTokVideo | NewsArticle }[], source: 'threads' | 'tiktok' | 'news'): TrendingTopic[] {
  const topicCounts: Record<string, { count: number; references: { source: 'threads' | 'tiktok' | 'news'; data: Thread | TikTokVideo | NewsArticle }[] }> = {};

  data.forEach(item => {
    if (!topicCounts[item.hashtag]) {
      topicCounts[item.hashtag] = { count: 0, references: [] };
    }
    topicCounts[item.hashtag].count++;
    topicCounts[item.hashtag].references.push({ source, data: item.reference });
  });

  return Object.entries(topicCounts).map(([topic, { count, references }]) => ({
    topic,
    count,
    references
  }));
}

async function extractTopicsFromText(thread: { text: string }): Promise<string[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a topic extractor. Extract up to 3 main topics from the given text. Respond with only the topics, separated by commas."
        },
        {
          role: "user",
          content: thread.text
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });
  
    const topics = response.choices[0].message.content?.split(',').map(topic => topic.trim()) || [];
    return topics;
  }