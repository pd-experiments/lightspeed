import { NextApiRequest, NextApiResponse } from 'next';
import { openai_client } from '@/lib/openai-client';
import { AdCreationInsert } from '@/lib/types/customTypes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { title, description, answers } = req.body;
    const prompt = `Based on the following information, generate a complete ad creation configuration:
    User Responses:
    ${answers.map((answer: string, index: number) => `Question ${index + 1}: ${answer}`).join('\n')}

    Provide a JSON object with the following structure:
    {
      "title": string,
      "description": string,
      "objective": "awareness" | "consideration" | "conversion",
      "budget": number,
      "duration": number,
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "target_audience": {
        "age": ("18-24" | "25-34" | "35-44" | "45-54" | "55+")[],
        "gender": ("male" | "female" | "other")[],
        "interests": string[],
        "location": string
      },
      "ad_content": {
        "headline": string,
        "body": string,
        "callToAction": string
      },
      "platforms": ("Facebook" | "Tiktok" | "Instagram Post" | "Instagram Reel" | "Instagram Story" | "Threads")[],
      "political_leaning": "left" | "center-left" | "center" | "center-right" | "right",
      "key_components": string[]
    }

    Notes:
    - For the "age" field, provide an array of one or more age ranges that best fit the target audience.
    - For the "gender" field, provide an array of one or more genders that best fit the target audience. Use "male", "female", and/or "other".
    - Ensure that the generated configuration aligns with the provided information and user responses.`;

    const completion = await openai_client.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const generatedConfig = JSON.parse(completion.choices[0].message?.content || '{}');

    const quickSetupConfig: AdCreationInsert = {
      title,
      description,
      ...generatedConfig,
      status: 'Draft',
    };

    res.status(200).json(quickSetupConfig);
  } catch (error) {
    console.error('Error in quick setup:', error);
    res.status(500).json({ message: 'Error generating quick setup configuration' });
  }
}