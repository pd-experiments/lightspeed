import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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
    const { experimentId, version } = req.body;
    const { imageUrl, caption, link, adsetId } = version.config;

    const adCreativeId = await createAdCreative(imageUrl, caption, link);
    if (!adCreativeId) {
      throw new Error('Failed to create ad creative');
    }

    const adId = await createAd(adCreativeId, adsetId, `Ad for Experiment ${experimentId}`);
    if (!adId) {
      throw new Error('Failed to create ad');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Facebook ad deployed successfully',
      adId: adId,
      platform: 'Facebook',
      versionId: version.versionId
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