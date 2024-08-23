import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('age_targeting')
        .not('age_targeting', 'is', null);

      if (error) throw error;

      const ageCounts = data.reduce((acc: Record<string, number>, { age_targeting }) => {
        if (typeof age_targeting === 'string') {
          const parsed = JSON.parse(age_targeting);
          if (parsed.criterion_included) {
            const ages = parsed.criterion_included.split(',');
            ages.forEach((age: string) => {
              const trimmedAge = age.trim();
              if (trimmedAge !== 'Unknown age') {
                acc[trimmedAge] = (acc[trimmedAge] || 0) + 1;
              }
            });
          }
        }
        return acc;
      }, {});

      const formattedData = Object.entries(ageCounts).map(([age, count]) => ({ age, count }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching age targeting:', error);
      res.status(500).json({ error: 'Error fetching age targeting' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}