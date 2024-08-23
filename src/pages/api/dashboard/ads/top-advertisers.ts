import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('advertiser_name, id')
        .order('advertiser_name');

      if (error) throw error;

      interface Advertiser {
        name: string;
        adCount: number;
      }

      const advertisers = data.reduce<Advertiser[]>((acc, curr) => {
        const existingAdvertiser = acc.find(a => a.name === curr.advertiser_name);
        if (existingAdvertiser) {
          existingAdvertiser.adCount++;
        } else {
          acc.push({ name: curr.advertiser_name, adCount: 1 });
        }
        return acc;
      }, []);

      advertisers.sort((a, b) => b.adCount - a.adCount);

      res.status(200).json(advertisers.slice(0, 10));
    } catch (error) {
      console.error('Error fetching top advertisers:', error);
      res.status(500).json({ error: 'Error fetching top advertisers' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}