import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { AdPerformanceData } from '@/lib/types/customTypes';

const accessToken = process.env.META_ACCESS_TOKEN_FB;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { adId } = req.query;

  if (!adId) {
    return res.status(400).json({ error: 'Ad ID is required' });
  }

  try {
    // Fetch general metrics
    const generalMetricsResponse = await axios.get(`https://graph.facebook.com/v15.0/${adId}/insights`, {
      params: {
        fields: 'impressions,clicks,spend,ctr,cpc,reach,frequency',
        time_range: JSON.stringify({ since: '2023-01-01', until: 'now' }),
        access_token: accessToken
      }
    });

    const generalMetrics = generalMetricsResponse.data.data[0];

    // Fetch age and gender breakdown
    const demographicResponse = await axios.get(`https://graph.facebook.com/v15.0/${adId}/insights`, {
      params: {
        fields: 'impressions,clicks,spend',
        breakdowns: 'age,gender',
        time_range: JSON.stringify({ since: '2023-01-01', until: 'now' }),
        access_token: accessToken
      }
    });

    const demographicData = demographicResponse.data.data;

    // Process demographic data
    const ageGenderBreakdown = demographicData.reduce((acc: any, item: any) => {
      const key = `${item.age}-${item.gender}`;
      acc[key] = {
        impressions: item.impressions,
        clicks: item.clicks,
        spend: item.spend
      };
      return acc;
    }, {});

    // Fetch comments
    const adResponse = await axios.get(`https://graph.facebook.com/v15.0/${adId}`, {
      params: {
        fields: 'creative{effective_object_story_id}',
        access_token: accessToken
      }
    });

    const effectiveObjectStoryId = adResponse.data.creative.effective_object_story_id;

    let comments = [];
    if (effectiveObjectStoryId) {
      const commentsResponse = await axios.get(`https://graph.facebook.com/v15.0/${effectiveObjectStoryId}/comments`, {
        params: {
          access_token: accessToken
        }
      });
      comments = commentsResponse.data.data;
    }

    // Fetch time series data
    const timeSeriesResponse = await axios.get(`https://graph.facebook.com/v15.0/${adId}/insights`, {
        params: {
        fields: 'date_start,date_stop,impressions,clicks,spend',
        time_range: JSON.stringify({ since: '2023-01-01', until: 'now' }),
        time_increment: 1, // Daily granularity
        access_token: accessToken
        }
    });
    
    const timeSeriesData = timeSeriesResponse.data.data;

    const currentTime = new Date().toISOString().replace('T', ' ').replace('Z', '+00');

    const performanceData: AdPerformanceData = {
        updated_at: currentTime,
        metrics: {
          impressions: parseInt(generalMetrics.impressions),
          clicks: parseInt(generalMetrics.clicks),
          spend: parseFloat(generalMetrics.spend),
          ctr: parseFloat(generalMetrics.ctr),
          cpc: parseFloat(generalMetrics.cpc),
          reach: parseInt(generalMetrics.reach),
          frequency: parseFloat(generalMetrics.frequency)
        },
        demographics: {
          ageGenderBreakdown
        },
        comments,
        timeSeriesData
      };
    
      res.status(200).json({
        success: true,
        ...performanceData
      });
  } catch (error: any) {
    console.error('Error fetching Facebook ad metrics:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error fetching Facebook ad metrics',
      message: error.response?.data?.error?.message || error.message
    });
  }
}