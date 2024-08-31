import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('keywords')
        .not('keywords', 'is', null);

      if (error) throw error;

      const keywordCounts = data.reduce((acc: Record<string, number>, { keywords }: { keywords: string[] }) => {
        keywords.forEach((keyword: string) => {
          acc[keyword] = (acc[keyword] || 0) + 1;
        });
        return acc;
      }, {});

      const formattedData = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching keyword analysis:', error);
      res.status(500).json({ error: 'Error fetching keyword analysis' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}