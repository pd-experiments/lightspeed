import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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
    const { experimentId, version } = req.body;
    const { imageUrl, caption } = version.config;

    const containerId = await createMediaContainer(imageUrl, caption);
    if (!containerId) {
      throw new Error('Failed to create media container');
    }

    const postId = await publishMedia(containerId);
    if (!postId) {
      throw new Error('Failed to publish media');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Instagram post deployed successfully',
      postId: postId,
      platform: 'Instagram Post',
      versionId: version.versionId
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