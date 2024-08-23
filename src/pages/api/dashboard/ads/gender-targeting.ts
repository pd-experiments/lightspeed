import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('int_ads__google_ads_enhanced')
        .select('gender_targeting')
        .not('gender_targeting', 'is', null);

      if (error) throw error;

      const genderCounts = data.reduce<Record<string, number>>((acc, { gender_targeting }) => {
        if (typeof gender_targeting === 'string') {
          const parsed = JSON.parse(gender_targeting);
          if (parsed.criterion_included) {
            const genders = parsed.criterion_included.split(',');
            genders.forEach((gender: string) => {
              const trimmedGender = gender.trim();
              acc[trimmedGender] = (acc[trimmedGender] || 0) + 1;
            });
          }
        }
        return acc;
      }, {});

      const formattedData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching gender targeting:', error);
      res.status(500).json({ error: 'Error fetching gender targeting' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}