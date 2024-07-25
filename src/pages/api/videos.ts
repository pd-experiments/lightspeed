import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

async function searchVideos(query: string, channelId: string, maxResults: number = 50) {
  const searchResponse = await youtube.search.list({
    part: ['snippet'],
    q: query,
    channelId: channelId,
    type: ['video'],
    order: 'date',
    maxResults: maxResults
  });

  const videoIds = searchResponse.data.items?.map(item => item.id?.videoId).filter((id): id is string => !!id) || [];

  const videoResponse = await youtube.videos.list({
    part: ['snippet', 'statistics'],
    id: videoIds
  });

  const videos = await Promise.all(videoResponse.data.items?.map(async item => {
    let transcript = null;
    try {
      if (item.id) {
        transcript = await YoutubeTranscript.fetchTranscript(item.id);
      }
    } catch (error) {
      console.error(`Failed to fetch transcript for video ${item.id}:`, error);
    }

    return {
      video_id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      published_at: item.snippet?.publishedAt,
      transcript: transcript || null,
    };
  }) || []);

  return videos;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const channels = {
      'CNN': 'UCupvZG-5ko_eiXAupbDfxWw',
      'Fox News': 'UCXIJgqnII2ZOINSWNOGFThA',
      'BBC News': 'UC16niRr50-MSBwiO3YDb3RA'
    };

    const query = "politics";
    let allVideos: any[] = [];

    for (const [channelName, channelId] of Object.entries(channels)) {
      const videos = await searchVideos(query, channelId);
      allVideos = allVideos.concat(videos);
    }

    // Check for existing videos in Supabase
    const { data: existingVideos, error: fetchError } = await supabase
      .from('youtube')
      .select('video_id');

    if (fetchError) {
      throw fetchError;
    }

    const existingVideoIds = new Set(existingVideos.map(video => video.video_id));
    const newVideos = allVideos.filter(video => !existingVideoIds.has(video.video_id));

    // Insert new videos into Supabase
    const { data, error } = await supabase
      .from('youtube')
      .insert(newVideos);

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube data' });
  }
}