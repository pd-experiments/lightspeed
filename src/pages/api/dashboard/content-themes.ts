import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import OpenAI from 'openai';
import { encode } from 'gpt-3-encoder';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_TOKENS = 7000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [threads, tiktokVideos, newsArticles] = await Promise.all([
        supabase.from('threads').select('text').limit(50).order('created_at', { ascending: false }),
        supabase.from('tiktok_videos').select('text').limit(50).order('created_at', { ascending: false }),
        supabase.from('news').select('title, summary').limit(25).order('publish_date', { ascending: false }),
      ]);

      let allContent = [
        ...(threads.data?.map(t => t.text) ?? []),
        ...(tiktokVideos.data?.map(v => v.text) ?? []),
        ...(newsArticles.data?.map(n => `${n.title} ${n.summary}`) ?? []),
      ];

      allContent = allContent.sort(() => Math.random() - 0.5);

      let tokenCount = 0;
      let truncatedContent = [];

      for (const item of allContent) {
        const itemTokens = encode(item);
        if (tokenCount + itemTokens.length <= MAX_TOKENS) {
          truncatedContent.push(item);
          tokenCount += itemTokens.length;
        } else {
          break;
        }
      }

      const contentString = truncatedContent.join('\n');

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are an expert in analyzing political content. Identify the top 10 recurring themes or narratives in the given text. For each theme, provide a short title and a brief description."
          },
          {
            role: "user",
            content: contentString
          }
        ],
        functions: [
          {
            name: "analyze_content_themes",
            description: "Analyze the content and return the top 5 recurring themes",
            parameters: {
              type: "object",
              properties: {
                themes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        description: "A short title for the theme"
                      },
                      description: {
                        type: "string",
                        description: "A brief description of the theme"
                      }
                    },
                    required: ["title", "description"]
                  }
                }
              },
              required: ["themes"]
            }
          }
        ],
        function_call: { name: "analyze_content_themes" },
        temperature: 0.5,
        max_tokens: 500
      });

      const functionCall = response.choices[0].message.function_call;
      if (functionCall && functionCall.name === "analyze_content_themes") {
        const themes = JSON.parse(functionCall.arguments).themes;
        res.status(200).json(themes);
      } else {
        res.status(200).json([]);
      }
    } catch (error) {
      console.error('Error analyzing content themes:', error);
      res.status(200).json([]);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}