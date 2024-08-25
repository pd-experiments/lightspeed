import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
const pageId = process.env.FACEBOOK_PAGE_ID;

async function createAdCreative(imageUrl: string, message: string, link: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/adcreatives`, {
      name: 'Ad Creative from API',
      object_story_spec: {
        page_id: pageId,
        link_data: {
          image_url: imageUrl,
          link: link,
          message: message
        }
      },
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
    const { deploymentId } = req.body;

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

    const { image_url, caption, link, adset_id } = deployment;
    const experimentId = deployment.experiment_id;

    const adCreativeId = await createAdCreative(image_url, caption, link);
    if (!adCreativeId) {
      throw new Error('Failed to create ad creative');
    }

    const adId = await createAd(adCreativeId, adset_id, `Ad for Experiment ${experimentId}`);
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
      message: 'Facebook ad deployed successfully',
      adId: adId,
      platform: 'Facebook',
      deploymentId: deploymentId
    });
  } catch (error: any) {
    console.error('Error deploying Facebook ad:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deploying Facebook ad', 
      message: error.message 
    });
  }
}