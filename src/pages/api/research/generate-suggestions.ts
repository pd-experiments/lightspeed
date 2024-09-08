import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractJSONFromString(str: string): any {
  const jsonRegex = /{[\s\S]*}/;
  const match = str.match(jsonRegex);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { streamedResults } = req.body;

    const prompt = `Based on the following information, generate trending ad creative suggestions for Democrats for TikTok, Facebook, Instagram, and Connected TV:

Summary: ${streamedResults.summary || ''}

Relevant News Articles: ${JSON.stringify(streamedResults.news ? streamedResults.news.slice(0, 5) : [])}

Relevant Political Ads: ${JSON.stringify(streamedResults.ads ? streamedResults.ads.slice(0, 5) : [])}

Generate 3 ad creative suggestions for each platform (TikTok, Facebook, Instagram, Connected TV) in the following JSON format:
{
  "tiktok": [
    { "title": "Ad title", "description": "Brief ad description", "hashtags": ["tag1", "tag2"] },
    ...
  ],
  "facebook": [...],
  "instagram": [...],
  "connectedTV": [...]
}

Ensure that your response is a valid JSON object.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert political ad strategist. Your responses should always be in valid JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON. Attempting to extract JSON from string.");
      suggestions = extractJSONFromString(content);
      if (!suggestions) {
        throw new Error("Failed to extract valid JSON from OpenAI response");
      }
    }

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error generating ad suggestions:", error);
    return res.status(500).json({ error: "Failed to generate ad suggestions" });
  }
}