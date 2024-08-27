import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const accessToken = process.env.META_ACCESS_TOKEN_FB;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { 
      name, 
      campaignId, 
      dailyBudget, 
      billingEvent, 
      optimizationGoal, 
      bidAmount, 
      targeting 
    } = req.body;

    const response = await axios.post(`https://graph.facebook.com/v15.0/act_${adAccountId}/adsets`, {
      name: name || 'Ad Set from API',
      campaign_id: campaignId,
      daily_budget: dailyBudget,
      billing_event: billingEvent || 'IMPRESSIONS',
      optimization_goal: optimizationGoal || 'LINK_CLICKS',
      bid_amount: bidAmount,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      targeting: targeting || {
        geo_locations: {
          countries: ['US']
        },
        age_min: 18,
        age_max: 65
      },
      status: 'PAUSED',
      access_token: accessToken
    });

    res.status(200).json({ 
      success: true, 
      message: 'Facebook ad set created successfully',
      adsetId: response.data.id
    });
  } catch (error: any) {
    console.error('Error creating Facebook ad set:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating Facebook ad set', 
      message: error.response?.data?.error?.message || error.message 
    });
  }
}