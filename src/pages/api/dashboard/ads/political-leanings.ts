import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('political_leaning')
        .not('political_leaning', 'is', null);

      if (error) throw error;

      const leaningCounts = data.reduce<Record<string, number>>((acc, { political_leaning }) => {
        acc[political_leaning] = (acc[political_leaning] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.entries(leaningCounts).map(([leaning, count]) => ({ leaning, count }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching political leanings:', error);
      res.status(500).json({ error: 'Error fetching political leanings' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}