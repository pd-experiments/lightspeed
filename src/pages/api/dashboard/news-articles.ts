import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import OpenAI from 'openai';

type NewsArticle = Database['public']['Tables']['news']['Row'];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function enrichArticles(articles: NewsArticle[]) {
  const prompt = `Analyze the following news articles and provide for each:
    1. A brief summary (max 2 sentences)
    2. Three key points
    3. Potential impact (1 sentence)
    4. Related topics (comma-separated list)
    5. Sentiment (positive, negative, or neutral)

    Articles:
    ${articles.map(article => `Title: ${article.title}\nSummary: ${article.summary}`).join('\n\n')}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert political analyst. Analyze the given news articles and provide structured information." },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "analyze_articles",
          description: "Analyze the articles and return structured information",
          parameters: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    key_points: { type: "array", items: { type: "string" } },
                    potential_impact: { type: "string" },
                    related_topics: { type: "array", items: { type: "string" } },
                    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] }
                  },
                  required: ["summary", "key_points", "potential_impact", "related_topics", "sentiment"]
                }
              }
            },
            required: ["articles"]
          }
        }
      ],
      function_call: { name: "analyze_articles" },
      temperature: 0.5,
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.name === "analyze_articles") {
      const analysisResult = JSON.parse(functionCall.arguments).articles;
      return articles.map((article, index) => ({
        ...article,
        ...analysisResult[index]
      }));
    }
    return articles;
  } catch (error) {
    console.error('Error enriching articles:', error);
    return articles;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      const enrichedArticles = await enrichArticles(data);

      res.status(200).json(enrichedArticles);
    } catch (error) {
      console.error('Error fetching news articles:', error);
      res.status(500).json({ error: 'Error fetching news articles' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}