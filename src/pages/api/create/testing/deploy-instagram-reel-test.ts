import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const instagramUserId = process.env.INSTAGRAM_USER_ID;

async function createMediaContainer(videoUrl: string, caption: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v13.0/${instagramUserId}/media`, {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption,
      access_token: accessToken
    });

    const containerId = response.data.id;
    console.log(`Media container created with ID: ${containerId}`);
    return containerId;
  } catch (error: any) {
    console.error('Error creating media container:', error.response?.data || error.message);
    return null;
  }
}

async function publishReel(containerId: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v13.0/${instagramUserId}/media_publish`, {
      creation_id: containerId,
      access_token: accessToken
    });

    console.log('Reel published successfully!', response.data);
    return response.data.id;
  } catch (error: any) {
    console.error('Error publishing Reel:', error.response?.data || error.message);
    return null;
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { deploymentId } = req.body;

    const { data: deployment, error: deploymentError } = await supabase
      .from('ad_deployments')
      .select(`
        *,
        creation:ad_creations(*)
      `)
      .eq('id', deploymentId)
      .single();

    if (deploymentError) throw new Error('Failed to fetch deployment data');

    const { video_url, caption } = deployment;

    const containerId = await createMediaContainer(video_url, caption);
    if (!containerId) {
      throw new Error('Failed to create media container for Reel');
    }

    const reelId = await publishReel(containerId);
    if (!reelId) {
      throw new Error('Failed to publish Reel');
    }

    const { error: updateError } = await supabase
      .from('ad_deployments')
      .update({ status: 'Deployed' })
      .eq('id', deploymentId);

    if (updateError) throw new Error('Failed to update deployment status');

    res.status(200).json({ 
      success: true, 
      message: 'Instagram Reel deployed successfully',
      reelId: reelId,
      platform: 'Instagram Reel',
      deploymentId: deploymentId
    });
  } catch (error: any) {
    console.error('Error deploying Instagram Reel:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deploying Instagram Reel', 
      message: error.message 
    });
  }
}