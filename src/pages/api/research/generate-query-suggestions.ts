import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function truncateArray(arr: any[], maxLength: number) {
  return arr.slice(0, maxLength);
}

function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

function truncateData(data: any[], maxItems: number, maxLength: number) {
  return truncateArray(data, maxItems).map(item => truncateString(JSON.stringify(item), maxLength));
}

function extractJSONFromString(str: string): string[] {
  const jsonMatch = str.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
    }
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('ai_conversations_data')
      .select('hot_issues, trending_topics')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (conversationsError) throw conversationsError;

    const { data: adsData, error: adsError } = await supabase
      .from('ai_ads_data')
      .select('recent_ads')
      .order('created_at', { ascending: false })
      .limit(1);

    if (adsError) throw adsError;

    const hotIssues = truncateData(conversationsData.hot_issues || [], 5, 50);
    const trendingTopics = truncateData(conversationsData.trending_topics || [], 5, 50);
    const adContent = truncateData(adsData[0]?.recent_ads || [], 5, 50);

    const prompt = `
      Based on the following data:
      
      Hot Issues: ${JSON.stringify(hotIssues)}
      Trending Topics: ${JSON.stringify(trendingTopics)}
      Recent Ad Content: ${JSON.stringify(adContent)}

      Generate 10 diverse and engaging search query suggestions (keep them to a few words, brief) that users might be interested in. 
      These should be relevant to current trends, hot issues, and recent advertising content.
      Format the output as a JSON array of strings, without any additional formatting or explanation.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const suggestionsString = completion.choices[0].message.content;
    console.log('Raw suggestions:', suggestionsString);

    const suggestions = extractJSONFromString(suggestionsString || '[]');

    if (suggestions.length === 0) {
      throw new Error('Failed to generate valid suggestions');
    }

    const { error: insertError } = await supabase
      .from('ai_query_suggestions')
      .insert({ suggestions });

    if (insertError) throw insertError;

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error generating query suggestions:', error);
    return res.status(500).json({ error: 'Failed to generate query suggestions' });
  }
}