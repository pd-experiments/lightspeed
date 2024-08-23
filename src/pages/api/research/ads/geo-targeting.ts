import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('geo_targeting')
        .not('geo_targeting', 'is', null);

      if (error) throw error;

      const geoCounts = data.reduce<Record<string, number>>((acc, { geo_targeting }) => {
        if (typeof geo_targeting === 'string') {
          const parsed = JSON.parse(geo_targeting);
          if (parsed.criterion_included) {
            const locations = parsed.criterion_included.split(',');
            locations.forEach((location: string) => {
              const trimmedLocation = location.trim();
              acc[trimmedLocation] = (acc[trimmedLocation] || 0) + 1;
            });
          }
        }
        return acc;
      }, {});

      const formattedData = Object.entries(geoCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching geo targeting:', error);
      res.status(500).json({ error: 'Error fetching geo targeting' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}