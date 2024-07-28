import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';

type YouTubeVideo = Database["public"]["Tables"]["youtube"]["Row"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing video ID' });
  }

  try {
    const { data: video, error } = await supabase
    .from('youtube')
    .select('*')
    .eq('id', id)
    .single() as { data: YouTubeVideo | null, error: any };

    if (error) {
      throw error;
    }

    return res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).json({ error: 'Failed to fetch video' });
  }
}