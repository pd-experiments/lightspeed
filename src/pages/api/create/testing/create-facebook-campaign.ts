import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const accessToken = process.env.META_ACCESS_TOKEN_FB;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, objective, special_ad_categories } = req.body;

    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/campaigns`, {
      name: name || 'Campaign from API',
      objective: objective || 'OUTCOME_ENGAGEMENT',
      status: 'PAUSED',
      special_ad_categories: special_ad_categories || ['NONE'],
      access_token: accessToken
    });

    res.status(200).json({ 
      success: true, 
      message: 'Facebook campaign created successfully',
      campaignId: response.data.id
    });
  } catch (error: any) {
    console.error('Error creating Facebook campaign:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating Facebook campaign', 
      message: error.response?.data?.error?.message || error.message 
    });
  }
}