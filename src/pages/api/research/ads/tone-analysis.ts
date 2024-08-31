import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('tone')
        .not('tone', 'is', null);

      if (error) throw error;

      const toneCounts = data.reduce((acc: Record<string, number>, { tone }: { tone: string[] }) => {
        tone.forEach((t: string) => {
          acc[t] = (acc[t] || 0) + 1;
        });
        return acc;
      }, {});

      const formattedData = Object.entries(toneCounts)
        .map(([tone, count]) => ({ tone, count }))
        .sort((a, b) => b.count - a.count);

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching tone analysis:', error);
      res.status(500).json({ error: 'Error fetching tone analysis' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}