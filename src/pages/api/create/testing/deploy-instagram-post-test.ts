import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const instagramUserId = process.env.INSTAGRAM_USER_ID;

async function createMediaContainer(imageUrl: string, caption: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v13.0/${instagramUserId}/media`, {
      image_url: imageUrl,
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

async function publishMedia(containerId: string): Promise<string | null> {
  try {
    const response = await axios.post(`https://graph.facebook.com/v13.0/${instagramUserId}/media_publish`, {
      creation_id: containerId,
      access_token: accessToken
    });

    console.log('Post published successfully!', response.data);
    return response.data.id;
  } catch (error: any) {
    console.error('Error publishing post:', error.response?.data || error.message);
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

    const { image_url, caption } = deployment;

    const containerId = await createMediaContainer(image_url, caption);
    if (!containerId) {
      throw new Error('Failed to create media container');
    }

    const postId = await publishMedia(containerId);
    if (!postId) {
      throw new Error('Failed to publish media');
    }

    // Update deployment status
    const { error: updateError } = await supabase
      .from('ad_deployments')
      .update({ status: 'Deployed' })
      .eq('id', deploymentId);

    if (updateError) throw new Error('Failed to update deployment status');

    res.status(200).json({ 
      success: true, 
      message: 'Instagram post deployed successfully',
      postId: postId,
      platform: 'Instagram Post',
      deploymentId: deploymentId
    });
  } catch (error: any) {
    console.error('Error deploying Instagram Post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deploying Instagram Post', 
      message: error.message 
    });
  }
}