import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('format')
        .not('format', 'is', null);

      if (error) throw error;

      const formatCounts = data.reduce<Record<string, number>>((acc, { format }) => {
        acc[format] = (acc[format] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.entries(formatCounts).map(([name, value]) => ({ name, value }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching ad formats:', error);
      res.status(500).json({ error: 'Error fetching ad formats' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}