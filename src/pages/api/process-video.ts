import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoPath } = req.body;

  if (!videoPath) {
    return res.status(400).json({ error: 'Video path is required' });
  }

  const scriptsPath = path.join(process.cwd(), 'scripts');
  const framesOutputPath = path.join(scriptsPath, 'frames');
  const embeddingsOutputPath = path.join(scriptsPath, 'embeddings.json');

  try {
    // Extract frames
    await new Promise((resolve, reject) => {
      exec(`python ${path.join(scriptsPath, 'extract_frames.py')} ${videoPath} ${framesOutputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error extracting frames: ${stderr}`);
          return reject(error);
        }
        console.log(`Frames extracted: ${stdout}`);
        resolve(stdout);
      });
    });

    // Generate embeddings
    await new Promise((resolve, reject) => {
      exec(`python ${path.join(scriptsPath, 'generate_embeddings.py')} ${framesOutputPath} ${embeddingsOutputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating embeddings: ${stderr}`);
          return reject(error);
        }
        console.log(`Embeddings generated: ${stdout}`);
        resolve(stdout);
      });
    });

    res.status(200).json({ message: 'Video processed successfully', embeddingsPath: embeddingsOutputPath });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
}