import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { experiment, platforms, toneOfVoice, creativityLevel, targetAudience, keyMessage, numVersions } = req.body;

    console.log("platforms", platforms);

    const prompt = `Generate political ad versions for the following platforms: ${platforms.join(', ')}.

Experiment details:
Title: ${experiment.title}
Description: ${experiment.description}
Original Ad Content:
- Headline: ${experiment.ad_content.headline}
- Body: ${experiment.ad_content.body}
- Call to Action: ${experiment.ad_content.callToAction}

Additional parameters:
- Tone of Voice: ${toneOfVoice}
- Creativity Level: ${creativityLevel}
- Target Audience: ${targetAudience}
- Key Message: ${keyMessage}
- Political Leaning: ${experiment.political_leaning}

For each platform, create ${numVersions} ad versions that are tailored to the platform's specific format and best practices. Ensure that the content aligns with the political leaning and key message while appealing to the target audience.

Generate the ad versions in the following JSON format, depending on the platform:

The possible platform or ad types are: Facebook, Instagram Post, Instagram Story, Instagram Reel, TikTok, Threads.

For Facebook:
{
  "id": "facebook-1",
  "platform": "Facebook",
  "textContent": "Ad text content",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "hashtags": ["#hashtag1", "#hashtag2"]
}

For Instagram Post:
{
  "id": "instagram-post-1",
  "platform": "Instagram Post",
  "textContent": "Ad text content",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "hashtags": ["#hashtag1", "#hashtag2"]
}

For Instagram Story:
{
  "id": "instagram-story-1",
  "platform": "Instagram Story",
  "textContent": "Ad text content",
  "image": "https://example.com/image.jpg",
  "hashtags": ["#hashtag1", "#hashtag2"]
}

For Instagram Reel:
{
  "id": "instagram-reel-1",
  "platform": "Instagram Reel",
  "textContent": "Ad text content",
  "videoDescription": "Description of the video content",
  "inVideoScript": "Script for the video content",
  "hashtags": ["#hashtag1", "#hashtag2"]
}

For TikTok:
{
  "id": "tiktok-1",
  "platform": "TikTok",
  "textContent": "Ad text content",
  "videoDescription": "Description of the video content",
  "inVideoScript": "Script for the video content",
  "hashtags": ["#hashtag1", "#hashtag2"]
}

For Threads:
{
  "id": "threads-1",
  "platform": "Threads",
  "textContent": "Ad text content",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "hashtags": ["#hashtag1", "#hashtag2"]
}

Generate an array of these objects, with the appropriate format for each selected platform.`;


    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
        { role: "system", content: "You are an expert political ad strategist and copywriter. Respond only with valid JSON." },
        { role: "user", content: prompt }
        ],
        temperature: creativityLevel / 100,
        max_tokens: 2000,
    });
    
    console.log("response", response);
    
    const content = response.choices[0].message?.content;
    if (!content) {
        throw new Error("No content returned from OpenAI");
    }
    
    let generatedVersions;
    try {
        generatedVersions = JSON.parse(content);
    } catch (parseError) {
        console.error('Error parsing OpenAI response:', content);
        throw new Error("Invalid JSON returned from OpenAI");
    }

    res.status(200).json(generatedVersions);
  } catch (error) {
    console.error('Error generating ad versions:', error);
    res.status(500).json({ error: 'Error generating ad versions' });
  }
}