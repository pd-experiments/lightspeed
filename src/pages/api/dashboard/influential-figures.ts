import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { OpenAI } from 'openai';

const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_ITEMS = 200;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [threads, tiktokVideos, newsArticles] = await Promise.all([
        supabase.from('threads').select('username, text').limit(100).order('created_at', { ascending: false }),
        supabase.from('tiktok_videos').select('author, text').limit(100).order('created_at', { ascending: false }),
        supabase.from('news').select('title, summary').limit(50).order('publish_date', { ascending: false }),
      ]);

      const mentionCounts: Record<string, number> = {};
      const regex = /@(\w+)|([A-Z][a-z]+ [A-Z][a-z]+)/g;

      const processContent = (content: string, weight = 1) => {
        const matches = content.match(regex);
        if (matches) {
          matches.forEach(match => {
            const name = match.startsWith('@') ? match.slice(1) : match;
            mentionCounts[name] = (mentionCounts[name] || 0) + weight;
          });
        }
      };

      let itemCount = 0;
      const processItems = (items: any[], textKey: string, weight: number) => {
        for (const item of items) {
          if (itemCount >= MAX_ITEMS) break;
          processContent(item[textKey], weight);
          itemCount++;
        }
      };

      processItems(threads.data || [], 'text', 2);
      processItems(tiktokVideos.data || [], 'text', 3);
      processItems(newsArticles.data || [], 'title', 5);
      processItems(newsArticles.data || [], 'summary', 4);

      const entities = Object.keys(mentionCounts);
      console.log('Entities before filtering:', entities);
      
      const filteredEntities = await filterEntities(entities);
      console.log('Filtered entities:', filteredEntities);
      
      const influentialFigures = Object.entries(mentionCounts)
        .filter(([name]) => filteredEntities.includes(name))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, mentionCount: count }));
      
      console.log('Influential figures:', influentialFigures);
      
      if (influentialFigures.length === 0) {
        influentialFigures.push(...Object.entries(mentionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, mentionCount: count }))
        );
      }
      
      res.status(200).json(influentialFigures);
    } catch (error) {
      console.error('Error analyzing influential figures:', error);
      res.status(500).json({ error: 'Failed to analyze influential figures' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function filterEntities(entities: string[]): Promise<string[]> {
  if (entities.length === 0) return [];

  const prompt = `Given the following list of entities, return only those that are likely to be people, organizations, or other entities that are relevant to the political sphere. If none are relevant, return the top 10 most likely to be names or organizations. Respond with a JSON array of strings, and nothing else:

${entities.join(', ')}`;

  try {
    const response = await openai_client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that identifies people and organizations from a list of entities. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error("No response from OpenAI");
      return entities.slice(0, 10); 
    }

    const cleanedContent = content.replace(/^```json\s*|\s*```$/g, '').trim();
    
    try {
      const filteredEntities = JSON.parse(cleanedContent);
      return Array.isArray(filteredEntities) ? filteredEntities : entities.slice(0, 10);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Raw response:", content);
      return entities.slice(0, 10);
    }
  } catch (error) {
    console.error("Error in filterEntities:", error);
    return entities.slice(0, 10);
  }
}