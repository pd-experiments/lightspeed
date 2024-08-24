import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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
    const { experimentId, version } = req.body;
    const { videoUrl, caption } = version.config;

    const containerId = await createMediaContainer(videoUrl, caption);
    if (!containerId) {
      throw new Error('Failed to create media container for Reel');
    }

    const reelId = await publishReel(containerId);
    if (!reelId) {
      throw new Error('Failed to publish Reel');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Instagram Reel deployed successfully',
      reelId: reelId,
      platform: 'Instagram Reel',
      versionId: version.versionId
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