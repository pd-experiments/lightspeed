import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('first_shown, last_shown, days_ran_for')
        .order('days_ran_for', { ascending: false })
        .limit(100);

      if (error) throw error;

      const analysis = {
        averageDuration: data.reduce((sum, ad) => sum + ad.days_ran_for, 0) / data.length,
        longestRunningAd: data[0],
        mostRecentAd: data.reduce((recent, ad) => 
          new Date(ad.last_shown) > new Date(recent.last_shown) ? ad : recent
        ),
        oldestAd: data.reduce((oldest, ad) => 
          new Date(ad.first_shown) < new Date(oldest.first_shown) ? ad : oldest
        ),
      };

      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error fetching date range analysis:', error);
      res.status(500).json({ error: 'Error fetching date range analysis' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}