import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("called");
    // Fetch videos with transcripts from Supabase
    const { data: videos, error } = await supabase
      .from('youtube')
      .select('id, transcript')
      .not('transcript', 'is', null);

    if (error) {
      throw error;
    }

    // Generate and store embeddings for each transcript item
    for (const video of videos) {
      const transcriptItems = video.transcript;
      console.log(transcriptItems);

      for (const item of transcriptItems) {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: item.text,
        });

        console.log(video.id, embeddingResponse);

        const embedding = {
          video_uuid: video.id,
          timestamp: new Date(item.offset * 1000).toISOString(),
          text: item.text,
          embedding: embeddingResponse.data[0].embedding,
        };

        const { error: insertError } = await supabase
          .from('video_embeddings')
          .insert(embedding);

        if (insertError) {
          console.log(insertError);
          throw insertError;
        }
      }
    }

    res.status(200).json({ message: 'Embeddings generated and stored successfully' });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
}