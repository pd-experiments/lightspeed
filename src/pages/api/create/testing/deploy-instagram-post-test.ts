import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

const accessToken = process.env.META_ACCESS_TOKEN_INSTAGRAM;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

async function createCampaign(): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/campaigns`, {
      name: 'Instagram Campaign from API',
      objective: 'OUTCOME_ENGAGEMENT',
      status: 'PAUSED',
      special_ad_categories: ['HOUSING'],
      access_token: accessToken
    });

    console.log('Campaign ID:', response.data.id);
    return response.data.id;
  } catch (error: any) {
    console.error('Error creating campaign:', error.response?.data || error.message);
    return null;
  }
}

async function createAdSet(campaignId: string, dailyBudget: number, bidAmount: number): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/adsets`, {
      name: 'Instagram Ad Set from API',
      campaign_id: campaignId,
      daily_budget: dailyBudget,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_amount: bidAmount,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      targeting: {
        geo_locations: {
          countries: ['US']
        },
        age_min: 18,
        age_max: 65
      },
      status: 'PAUSED',
      access_token: accessToken
    });

    console.log('Ad Set ID:', response.data.id);
    return response.data.id;
  } catch (error: any) {
    console.error('Error creating ad set:', error.response?.data || error.message);
    return null;
  }
}

async function createAdCreative(imageUrl: string, message: string, link: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/adcreatives`, {
      name: 'Instagram Ad Creative from API',
      object_story_spec: {
        instagram_actor_id: instagramAccountId, // Use the Instagram account ID
        link_data: {
          link: link,
          message: message
        }
      },
      image_url: imageUrl,
      access_token: accessToken
    });

    console.log('Ad Creative ID:', response.data.id);
    return response.data.id;
  } catch (error: any) {
    console.error('Error creating ad creative:', error.response?.data || error.message);
    return null;
  }
}

async function createAd(adCreativeId: string, adsetId: string, name: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/ads`, {
      name: name,
      adset_id: adsetId,
      creative: { creative_id: adCreativeId },
      status: 'PAUSED',
      access_token: accessToken
    });

    console.log('Ad ID:', response.data.id);
    return response.data.id;
  } catch (error: any) {
    console.error('Error creating ad:', error.response?.data || error.message);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { deploymentId, adsetId, dailyBudget, bidAmount } = req.body;

    // Fetch deployment and associated creation data
    const { data: deployment, error: deploymentError } = await supabase
      .from('ad_deployments')
      .select(`
        *,
        creation:ad_creations(*)
      `)
      .eq('id', deploymentId)
      .single();

    if (deploymentError) throw new Error('Failed to fetch deployment data');

    const { image_url, caption, link } = deployment;
    const experimentId = deployment.experiment_id;

    // Create a campaign
    const campaignId = await createCampaign();
    if (!campaignId) {
      throw new Error('Failed to create campaign');
    }

    // Get or create an ad set
    const finalAdsetId = await createAdSet(campaignId, deployment.budget, deployment.budget * 7);
    if (!finalAdsetId) {
      throw new Error('Failed to get or create ad set');
    }

    // Create an ad creative
    const adCreativeId = await createAdCreative(image_url, caption, link);
    if (!adCreativeId) {
      throw new Error('Failed to create ad creative');
    }

    // Create an ad
    const adId = await createAd(adCreativeId, finalAdsetId, `Instagram Ad for Experiment ${experimentId}`);
    if (!adId) {
      throw new Error('Failed to create ad');
    }

    // Update deployment status
    const { error: updateError } = await supabase
      .from('ad_deployments')
      .update({ status: 'Deployed' })
      .eq('id', deploymentId);

    if (updateError) throw new Error('Failed to update deployment status');

    res.status(200).json({ 
      success: true, 
      message: 'Instagram ad deployed successfully',
      adId: adId,
      adsetId: finalAdsetId,
      campaignId: campaignId,
      platform: 'Instagram',
      deploymentId: deploymentId
    });
  } catch (error: any) {
    console.error('Error deploying Instagram ad:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deploying Instagram ad', 
      message: error.message 
    });
  }
}