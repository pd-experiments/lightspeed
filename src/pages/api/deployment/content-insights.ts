import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { deploymentId } = req.body;

  try {
    // Fetch deployment data
    const { data: deployment, error: deploymentError } = await supabase
      .from('ad_deployments')
      .select(`*, creation:ad_creations(*)`)
      .eq('id', deploymentId)
      .single();

    if (deploymentError) throw deploymentError;

    // Check if content insights are up to date
    const lastUpdate = new Date(deployment.content_insights?.updated_at || 0);
    const hoursSinceLastUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (deployment.content_insights && hoursSinceLastUpdate < 24) {
      return res.status(200).json({ insights: deployment.content_insights.insights });
    }

    // Prepare data for AI analysis
    const analysisData = {
      deployment: {
        ...deployment,
        creation: deployment.creation,
        performance_data: deployment.performance_data,
      },
    };

    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are an expert in digital advertising and content analysis. Provide insights in a structured format." },
        { role: "user", content: `Analyze this ad deployment and provide insights on its success/failure, potential content improvements, and suggestions for future ads. Return your analysis in the following JSON structure:
        {
          "overallPerformance": "A brief summary of the ad's performance",
          "successFactors": ["List of factors contributing to success"],
          "challengeAreas": ["List of areas where the ad faced challenges"],
          "contentImprovements": ["List of specific content improvement suggestions"],
          "futureSuggestions": ["List of suggestions for future ad campaigns"],
          "keyMetrics": {
            "metric1": "Description of an important metric and its significance",
            "metric2": "Description of another important metric and its significance"
          }
        }
        
        Here's the ad data to analyze: ${JSON.stringify(analysisData)}` }
      ],
      response_format: { type: "json_object" }
    });

    const insights = JSON.parse(completion.choices[0].message.content || '{}');

    // Update deployment with new insights
    const { error: updateError } = await supabase
      .from('ad_deployments')
      .update({ 
        content_insights: { 
          insights,
          updated_at: new Date().toISOString()
        }
      })
      .eq('id', deploymentId);

    if (updateError) throw updateError;

    return res.status(200).json({ insights });
  } catch (error) {
    console.error('Error generating content insights:', error);
    return res.status(500).json({ error: 'Failed to generate content insights' });
  }
}