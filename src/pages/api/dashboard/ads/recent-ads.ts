import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('advertiser_name, content, last_shown')
        .order('last_shown', { ascending: false })
        .limit(10);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching recent ads:', error);
      res.status(500).json({ error: 'Error fetching recent ads' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}