import { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    const fileName = `${info.videoDetails.title}.mp4`;
    const filePath = path.join(process.cwd(), 'downloads', fileName);

    console.log(info)

    if (!fs.existsSync(path.join(process.cwd(), 'downloads'))) {
      fs.mkdirSync(path.join(process.cwd(), 'downloads'));
    }

    await new Promise((resolve, reject) => {
      ytdl(url, {
        format: format,
        filter: 'audioandvideo',
        quality: 'highest'
      })
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          console.log("success");
          res.status(200).json({ message: 'Video downloaded successfully', filePath });
          resolve(null);
        })
        .on('error', (error) => {
          console.log("error", error);
          console.error('Error downloading video:', error);
          res.status(500).json({ error: 'Failed to download video' });
          reject(error);
        });
    });
  } catch (error) {
    console.log("error", error);
    console.error('Error processing YouTube URL:', error);
    res.status(500).json({ error: 'Failed to process YouTube URL' });
  }
}